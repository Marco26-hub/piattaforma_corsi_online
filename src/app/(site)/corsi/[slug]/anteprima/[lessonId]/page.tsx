import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonContent } from "@/components/dashboard/lesson-content";

export const metadata = { title: "Anteprima del corso" };

export default async function PreviewLessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, isFreePreview: true, module: { course: { slug, published: true } } },
    select: { title: true, type: true, videoUrl: true, content: true, module: { select: { course: { select: { title: true } } } } },
  });
  if (!lesson) notFound();
  return <main className="container-app max-w-4xl py-12">
    <Link prefetch={false} href={`/corsi/${slug}`} className="text-brand-300">Torna a {lesson.module.course.title}</Link>
    <p className="mt-6 text-sm text-foreground/60">Anteprima gratuita</p>
    <h1 className="my-4 font-serif text-3xl">{lesson.title}</h1>
    <LessonContent lesson={lesson} />
  </main>;
}
