import "server-only";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { courseSchema, lessonSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { normalizeLessonVideoUrl } from "@/lib/lesson-media";
import { coursePublicationIssues } from "@/lib/course-publishing";

type CourseData = z.output<typeof courseSchema>;
type LessonData = z.output<typeof lessonSchema>;

async function withCourseLock<T>(courseId: string, action: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async tx => {
    // Serializes edits and prevents new enrollment foreign keys racing removal.
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM courses WHERE id = ${courseId} FOR UPDATE`;
    if (!rows.length) throw new Error("Corso non trovato");
    return action(tx);
  });
}

async function uniqueSlug(tx: Prisma.TransactionClient, title: string) {
  const base = slugify(title) || "corso";
  let slug = base;
  let suffix = 1;
  while (await tx.course.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${++suffix}`;
  return slug;
}

function courseData(data: CourseData) {
  return {
    title: data.title, subtitle: data.subtitle?.trim() || null, description: data.description,
    imageUrl: data.imageUrl || null, priceCents: Math.round(data.price * 100),
    level: data.level, category: data.category?.trim() || null, featured: data.featured ?? false,
  };
}

export async function createCourseRecord(data: CourseData) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${`academy-slug:${slugify(data.title)}`}, 0))`;
    return tx.course.create({ data: { ...courseData(data), slug: await uniqueSlug(tx, data.title), published: false } });
  });
}

export async function updateCourseRecord(id: string, data: CourseData) {
  // A title edit must not invalidate URLs already shared or purchased.
  return withCourseLock(id, tx => tx.course.update({ where: { id }, data: courseData(data) }));
}

export async function duplicateCourseRecord(id: string) {
  return withCourseLock(id, async tx => {
    const original = await tx.course.findUniqueOrThrow({
      where: { id }, include: { modules: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { lessons: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } } } },
    });
    const title = `${original.title.slice(0, 190)} (copia)`;
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${`academy-slug:${slugify(title)}`}, 0))`;
    return tx.course.create({ data: {
      title, slug: await uniqueSlug(tx, title), subtitle: original.subtitle, description: original.description,
      imageUrl: original.imageUrl, priceCents: original.priceCents, currency: original.currency,
      level: original.level, category: original.category, published: false, featured: false,
      modules: { create: original.modules.map((item, order) => ({ title: item.title, order,
        lessons: { create: item.lessons.map((lesson, lessonOrder) => ({ title: lesson.title, order: lessonOrder,
          type: lesson.type, videoUrl: lesson.videoUrl, content: lesson.content, durationMin: lesson.durationMin, isFreePreview: lesson.isFreePreview })) },
      })) },
    } });
  });
}

export async function publishCourseRecord(id: string, published: boolean) {
  if (typeof published !== "boolean") throw new Error("Stato del corso non valido");
  return withCourseLock(id, async tx => {
    const course = await tx.course.findUniqueOrThrow({ where: { id }, include: { modules: { include: { lessons: true } } } });
    if (course.archivedAt) throw new Error("Ripristina il corso dall'archivio prima di modificarne la pubblicazione");
    const issues = published ? coursePublicationIssues(course) : [];
    if (issues.length) throw new Error(issues.join(" "));
    return tx.course.update({ where: { id }, data: { published } });
  });
}

export async function archiveCourseRecord(id: string, archived: boolean) {
  if (typeof archived !== "boolean") throw new Error("Stato dell'archivio non valido");
  return withCourseLock(id, tx => tx.course.update({ where: { id }, data: { archivedAt: archived ? new Date() : null, published: false } }));
}

async function protectStudents(tx: Prisma.TransactionClient, courseId: string) {
  if (await tx.enrollment.count({ where: { courseId } }) || await tx.enrollmentRevocation.count({ where: { courseId } })) {
    throw new Error("Il corso ha uno storico di iscrizioni: moduli e lezioni non possono essere eliminati. Puoi modificarli o archiviare il corso.");
  }
}

export async function saveModuleRecord(courseId: string, title: string, moduleId?: string) {
  return withCourseLock(courseId, async tx => {
    if (moduleId) {
      const result = await tx.module.updateMany({ where: { id: moduleId, courseId }, data: { title } });
      if (!result.count) throw new Error("Modulo non trovato in questo corso");
      return;
    }
    const last = await tx.module.aggregate({ where: { courseId }, _max: { order: true } });
    await tx.module.create({ data: { courseId, title, order: (last._max.order ?? -1) + 1 } });
  });
}

export async function removeModuleRecord(courseId: string, moduleId: string) {
  return withCourseLock(courseId, async tx => {
    const item = await tx.module.findFirst({ where: { id: moduleId, courseId }, include: { _count: { select: { lessons: true } } } });
    if (!item) throw new Error("Modulo non trovato in questo corso");
    await protectStudents(tx, courseId);
    const course = await tx.course.findUniqueOrThrow({ where: { id: courseId } });
    const remaining = await tx.lesson.count({ where: { module: { courseId, id: { not: moduleId } } } });
    if (course.published && !remaining && item._count.lessons) throw new Error("Ritira prima il corso dal catalogo: non puo restare pubblicato senza lezioni");
    await tx.module.delete({ where: { id: moduleId } });
  });
}

export async function saveLessonRecord(courseId: string, data: LessonData, lessonId?: string) {
  return withCourseLock(courseId, async tx => {
    if (!await tx.module.findFirst({ where: { id: data.moduleId, courseId }, select: { id: true } })) throw new Error("Modulo non trovato in questo corso");
    const values = { title: data.title, type: data.type,
      videoUrl: data.type === "VIDEO" ? normalizeLessonVideoUrl(data.videoUrl || "") : null,
      content: data.type === "TEXT" ? data.content?.trim() : null,
      durationMin: data.durationMin ?? null, isFreePreview: data.isFreePreview ?? false };
    if (lessonId) {
      const result = await tx.lesson.updateMany({ where: { id: lessonId, moduleId: data.moduleId }, data: values });
      if (!result.count) throw new Error("Lezione non trovata in questo modulo");
      return;
    }
    const last = await tx.lesson.aggregate({ where: { moduleId: data.moduleId }, _max: { order: true } });
    await tx.lesson.create({ data: { ...values, moduleId: data.moduleId, order: (last._max.order ?? -1) + 1 } });
  });
}

export async function removeLessonRecord(courseId: string, lessonId: string) {
  return withCourseLock(courseId, async tx => {
    const lesson = await tx.lesson.findFirst({ where: { id: lessonId, module: { courseId } } });
    if (!lesson) throw new Error("Lezione non trovata in questo corso");
    await protectStudents(tx, courseId);
    const course = await tx.course.findUniqueOrThrow({ where: { id: courseId } });
    if (course.published && await tx.lesson.count({ where: { module: { courseId } } }) <= 1) throw new Error("Ritira prima il corso dal catalogo: non puo restare pubblicato senza lezioni");
    await tx.lesson.delete({ where: { id: lessonId } });
  });
}

export async function moveCourseItem(courseId: string, itemId: string, kind: "module" | "lesson", direction: "up" | "down") {
  if (!["module", "lesson"].includes(kind) || !["up", "down"].includes(direction)) throw new Error("Spostamento non valido");
  return withCourseLock(courseId, async tx => {
    let moduleId: string | undefined;
    if (kind === "lesson") {
      const lesson = await tx.lesson.findFirst({ where: { id: itemId, module: { courseId } }, select: { moduleId: true } });
      if (!lesson) throw new Error("Lezione non trovata in questo corso");
      moduleId = lesson.moduleId;
    }
    const items = kind === "module"
      ? await tx.module.findMany({ where: { courseId }, orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } })
      : await tx.lesson.findMany({ where: { moduleId }, orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } });
    const index = items.findIndex(item => item.id === itemId);
    if (index < 0) throw new Error("Elemento non trovato in questo corso");
    const target = index + (direction === "up" ? -1 : 1);
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    for (const [order, item] of items.entries()) {
      if (kind === "module") await tx.module.update({ where: { id: item.id }, data: { order } });
      else await tx.lesson.update({ where: { id: item.id }, data: { order } });
    }
  });
}
