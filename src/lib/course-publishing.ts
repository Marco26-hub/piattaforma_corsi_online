import { normalizeLessonVideoUrl } from "./lesson-media";

type CourseForPublication = {
  title: string; description: string; archivedAt: Date | null;
  modules: { lessons: { title: string; type: "VIDEO" | "TEXT"; videoUrl: string | null; content: string | null }[] }[];
};

export function coursePublicationIssues(course: CourseForPublication): string[] {
  const issues: string[] = [];
  if (course.archivedAt) issues.push("Ripristina il corso dall'archivio prima di pubblicarlo.");
  if (course.title.trim().length < 3) issues.push("Completa il titolo del corso.");
  if (course.description.trim().length < 10) issues.push("Completa la descrizione del corso.");
  const lessons = course.modules.flatMap(item => item.lessons);
  if (!lessons.length) issues.push("Aggiungi almeno una lezione con il suo contenuto.");
  for (const lesson of lessons) {
    const ready = lesson.type === "VIDEO" ? !!normalizeLessonVideoUrl(lesson.videoUrl || "") : !!lesson.content?.trim();
    if (!ready) issues.push(`Completa il contenuto della lezione "${lesson.title}".`);
  }
  return issues;
}
