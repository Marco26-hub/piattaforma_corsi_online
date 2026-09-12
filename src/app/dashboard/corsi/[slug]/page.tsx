import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { confirmCheckoutSession } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { LessonNav } from "@/components/dashboard/lesson-nav";
import { LessonContent } from "@/components/dashboard/lesson-content";
import { LessonCompleteToggle } from "@/components/dashboard/lesson-complete-toggle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { title: true } });
  return { title: course?.title ?? "Corso" };
}

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lezione?: string; session_id?: string }>;
}) {
  const session = await requireUser();
  const { slug } = await params;
  const { lezione, session_id: stripeSessionId } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  let enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (!enrollment && stripeSessionId) {
    enrollment = await confirmCheckoutSession(stripeSessionId, session.user.id);
  }

  if (!enrollment) redirect(`/corsi/${course.slug}`);

  const orderedLessons = course.modules.flatMap((m) => m.lessons);
  if (orderedLessons.length === 0) {
    return (
      <div className="container-app py-12">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground">
          <ArrowLeft className="size-4" /> I miei corsi
        </Link>
        <div className="rounded-2xl border border-dashed border-border-subtle py-16 text-center text-foreground/60">
          Il programma di questo corso non è ancora disponibile.
        </div>
      </div>
    );
  }

  const activeLesson =
    orderedLessons.find((l) => l.id === lezione) ?? orderedLessons[0];
  const activeIndex = orderedLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = activeIndex > 0 ? orderedLessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex < orderedLessons.length - 1 ? orderedLessons[activeIndex + 1] : null;

  const progressRows = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      completed: true,
      lessonId: { in: orderedLessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  });
  const completedIds = new Set(progressRows.map((p) => p.lessonId));
  const percent = Math.round((completedIds.size / orderedLessons.length) * 100);
  const isActiveCompleted = completedIds.has(activeLesson.id);

  return (
    <div className="container-app py-6 md:py-10">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> I miei corsi
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-xl font-medium sm:text-2xl">{course.title}</h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-sm text-foreground/60">{percent}% completato</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 lg:order-1">
          <LessonContent lesson={activeLesson} />

          <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">{activeLesson.title}</h2>
              {activeLesson.durationMin && (
                <p className="text-sm text-foreground/50">{activeLesson.durationMin} min</p>
              )}
            </div>
            <LessonCompleteToggle
              courseSlug={course.slug}
              lessonId={activeLesson.id}
              completed={isActiveCompleted}
            />
          </div>

          <div className="flex items-center justify-between">
            {prevLesson ? (
              <Button
                href={`/dashboard/corsi/${course.slug}?lezione=${prevLesson.id}`}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="size-4" /> Precedente
              </Button>
            ) : (
              <span />
            )}
            {nextLesson && (
              <Button
                href={`/dashboard/corsi/${course.slug}?lezione=${nextLesson.id}`}
                size="sm"
              >
                Successiva <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="lg:order-2">
          <LessonNav
            courseSlug={course.slug}
            modules={course.modules}
            activeLessonId={activeLesson.id}
            completedIds={completedIds}
          />
        </div>
      </div>
    </div>
  );
}
