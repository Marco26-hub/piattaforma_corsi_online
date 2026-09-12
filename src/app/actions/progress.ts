"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";

export async function toggleLessonProgress(
  courseSlug: string,
  lessonId: string,
  completed: boolean
) {
  const session = await requireUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) throw new Error("Lezione non trovata");

  if (!lesson.isFreePreview) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.module.course.id,
        },
      },
    });
    if (!enrollment) throw new Error("Non hai acquistato questo corso");
  }

  if (completed) {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId: session.user.id, lessonId, completed: true },
    });
  } else {
    await prisma.progress.deleteMany({
      where: { userId: session.user.id, lessonId },
    });
  }

  revalidatePath(`/dashboard/corsi/${courseSlug}`);
}
