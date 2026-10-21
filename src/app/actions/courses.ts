"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { courseSchema, moduleSchema, lessonSchema } from "@/lib/validations";
import { createCourseRecord, updateCourseRecord, duplicateCourseRecord, publishCourseRecord,
  archiveCourseRecord, saveModuleRecord, removeModuleRecord, saveLessonRecord,
  removeLessonRecord, moveCourseItem } from "@/lib/course-store";
import type { ActionState } from "@/app/actions/auth";

function errorMessage(error: unknown) {
  if (error instanceof Error && !error.name.startsWith("Prisma")) return error.message;
  console.error("[Academy/corsi] salvataggio non riuscito", error);
  return "Salvataggio non riuscito. Riprova tra qualche istante.";
}

async function refreshCourse(id?: string) {
  revalidatePath("/admin/corsi");
  revalidatePath("/corsi");
  revalidatePath("/api/public/catalog");
  if (id) {
    revalidatePath(`/admin/corsi/${id}`);
    revalidatePath(`/admin/corsi/${id}/anteprima`);
    const course = await prisma.course.findUnique({ where: { id }, select: { slug: true } });
    if (course) {
      revalidatePath(`/corsi/${course.slug}`);
      revalidatePath(`/dashboard/corsi/${course.slug}`);
    }
  }
}

function parseCourseForm(formData: FormData) {
  return courseSchema.safeParse({
    title: formData.get("title"), subtitle: formData.get("subtitle") || undefined,
    description: formData.get("description"), imageUrl: formData.get("imageUrl") || "",
    price: formData.get("price"), level: formData.get("level"),
    category: formData.get("category") || undefined, featured: formData.get("featured") === "on",
  });
}

export async function createCourse(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseCourseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  let id: string;
  try { id = (await createCourseRecord(parsed.data)).id; }
  catch (error) { return { error: errorMessage(error) }; }
  await refreshCourse(id);
  redirect(`/admin/corsi/${id}`);
}

export async function updateCourse(id: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseCourseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  try { await updateCourseRecord(id, parsed.data); }
  catch (error) { return { error: errorMessage(error) }; }
  await refreshCourse(id);
  return { success: "Modifiche salvate." };
}

export async function duplicateCourse(id: string) {
  await requireAdmin();
  const copy = await duplicateCourseRecord(id);
  await refreshCourse();
  return copy.id;
}

export async function togglePublish(id: string, published: boolean) {
  await requireAdmin();
  await publishCourseRecord(id, published);
  await refreshCourse(id);
}

export async function archiveCourse(id: string, archived: boolean) {
  await requireAdmin();
  await archiveCourseRecord(id, archived);
  await refreshCourse(id);
}

export async function saveModule(courseId: string, moduleId: string | null, _previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = moduleSchema.safeParse({ courseId, title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Titolo non valido" };
  try { await saveModuleRecord(courseId, parsed.data.title, moduleId || undefined); }
  catch (error) { return { error: errorMessage(error) }; }
  await refreshCourse(courseId);
  return { success: moduleId ? "Titolo del modulo salvato." : "Modulo aggiunto." };
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  await removeModuleRecord(courseId, moduleId);
  await refreshCourse(courseId);
}

export async function saveLesson(courseId: string, moduleId: string, lessonId: string | null, _previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = lessonSchema.safeParse({
    moduleId, title: formData.get("title"), type: formData.get("type"),
    videoUrl: formData.get("videoUrl") || "", content: formData.get("content") || undefined,
    durationMin: formData.get("durationMin") || undefined, isFreePreview: formData.get("isFreePreview") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Lezione non valida" };
  try { await saveLessonRecord(courseId, parsed.data, lessonId || undefined); }
  catch (error) { return { error: errorMessage(error) }; }
  await refreshCourse(courseId);
  return { success: lessonId ? "Lezione salvata." : "Lezione aggiunta." };
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  await removeLessonRecord(courseId, lessonId);
  await refreshCourse(courseId);
}

export async function moveItem(courseId: string, itemId: string, kind: "module" | "lesson", direction: "up" | "down") {
  await requireAdmin();
  await moveCourseItem(courseId, itemId, kind, direction);
  await refreshCourse(courseId);
}
