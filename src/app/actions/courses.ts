"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { courseSchema, moduleSchema, lessonSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/app/actions/auth";

async function uniqueSlug(title: string, ignoreId?: string) {
  const base = slugify(title) || "corso";
  let slug = base;
  let attempt = 1;
  while (
    await prisma.course.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

function parseCourseForm(formData: FormData) {
  return courseSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl") || "",
    price: formData.get("price"),
    level: formData.get("level"),
    category: formData.get("category") || undefined,
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  });
}

export async function createCourse(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseCourseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const slug = await uniqueSlug(parsed.data.title);

  const course = await prisma.course.create({
    data: {
      slug,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      priceCents: Math.round(parsed.data.price * 100),
      level: parsed.data.level,
      category: parsed.data.category,
      published: parsed.data.published ?? false,
      featured: parsed.data.featured ?? false,
    },
  });

  revalidatePath("/admin/corsi");
  redirect(`/admin/corsi/${course.id}`);
}

export async function updateCourse(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseCourseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const current = await prisma.course.findUnique({ where: { id } });
  if (!current) return { error: "Corso non trovato" };

  const slug =
    current.title === parsed.data.title
      ? current.slug
      : await uniqueSlug(parsed.data.title, id);

  await prisma.course.update({
    where: { id },
    data: {
      slug,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      priceCents: Math.round(parsed.data.price * 100),
      level: parsed.data.level,
      category: parsed.data.category,
      published: parsed.data.published ?? false,
      featured: parsed.data.featured ?? false,
    },
  });

  revalidatePath("/admin/corsi");
  revalidatePath(`/admin/corsi/${id}`);
  revalidatePath(`/corsi/${slug}`);
  return { error: undefined };
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/corsi");
}

export async function togglePublish(id: string, published: boolean) {
  await requireAdmin();
  await prisma.course.update({ where: { id }, data: { published } });
  revalidatePath("/admin/corsi");
  revalidatePath(`/admin/corsi/${id}`);
}

export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin();

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    courseId,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { title: parsed.data.title, courseId, order: count },
  });

  revalidatePath(`/admin/corsi/${courseId}`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/corsi/${courseId}`);
}

export async function createLesson(
  courseId: string,
  moduleId: string,
  formData: FormData
) {
  await requireAdmin();

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    moduleId,
    type: formData.get("type"),
    videoUrl: formData.get("videoUrl") || "",
    content: formData.get("content") || undefined,
    durationMin: formData.get("durationMin") || undefined,
    isFreePreview: formData.get("isFreePreview") === "on",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      title: parsed.data.title,
      moduleId,
      order: count,
      type: parsed.data.type,
      videoUrl: parsed.data.videoUrl || null,
      content: parsed.data.content,
      durationMin: parsed.data.durationMin,
      isFreePreview: parsed.data.isFreePreview ?? false,
    },
  });

  revalidatePath(`/admin/corsi/${courseId}`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/corsi/${courseId}`);
}
