import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle, Signal, Clock, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CheckoutForm } from "@/components/checkout-form";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Base",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzato",
};

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  return { title: course?.title ?? "Corso" };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course || !course.published) notFound();

  const session = await auth();
  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.durationMin ?? 0), 0),
    0
  );

  return (
    <div className="container-app grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">
            <Signal className="size-3" />
            {LEVEL_LABEL[course.level] ?? course.level}
          </Badge>
          {course.category && <Badge variant="neutral">{course.category}</Badge>}
        </div>

        <h1 className="mt-4 font-serif text-3xl font-medium leading-tight sm:text-4xl">{course.title}</h1>
        {course.subtitle && (
          <p className="mt-3 text-lg text-foreground/65">{course.subtitle}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-5 text-sm text-foreground/60">
          <span className="flex items-center gap-1.5">
            <FileText className="size-4" /> {totalLessons} lezioni
          </span>
          {totalMinutes > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {totalMinutes} min totali
            </span>
          )}
        </div>

        {course.imageUrl && (
          <div className="mt-8 aspect-video overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.imageUrl} alt={course.title} className="size-full object-cover" />
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Descrizione</h2>
          <p className="mt-3 whitespace-pre-line text-foreground/70">{course.description}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Programma del corso</h2>
          <div className="mt-4 space-y-4">
            {course.modules.map((module, mIndex) => (
              <div key={module.id} className="overflow-hidden rounded-2xl border border-border-subtle">
                <div className="bg-surface-muted px-5 py-3 font-medium">
                  Modulo {mIndex + 1}: {module.title}
                </div>
                <ul className="divide-y divide-border-subtle">
                  {module.lessons.map((lesson) => {
                    const unlocked = lesson.isFreePreview || !!enrollment;
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                      >
                        <span className="flex items-center gap-3">
                          {unlocked ? (
                            <PlayCircle className="size-4 shrink-0 text-brand-400" />
                          ) : (
                            <Lock className="size-4 shrink-0 text-foreground/30" />
                          )}
                          {unlocked ? <Link prefetch={false} className="hover:underline" href={enrollment
                            ? `/dashboard/corsi/${course.slug}?lezione=${lesson.id}`
                            : `/corsi/${course.slug}/anteprima/${lesson.id}`}>{lesson.title}</Link>
                            : <span className="text-foreground/50">{lesson.title}</span>}
                          {lesson.isFreePreview && (
                            <Badge variant="accent" className="ml-1">
                              Anteprima
                            </Badge>
                          )}
                        </span>
                        {lesson.durationMin && (
                          <span className="shrink-0 text-xs text-foreground/40">
                            {lesson.durationMin} min
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {course.modules.length === 0 && (
              <p className="text-sm text-foreground/50">Programma in fase di pubblicazione.</p>
            )}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-border-subtle p-6 lg:sticky lg:top-24">
        <p className="text-3xl font-bold">
          {formatPrice(course.priceCents, course.currency)}
        </p>

        <div className="mt-6">
          {enrollment ? (
            <Button href={`/dashboard/corsi/${course.slug}`} className="w-full" size="lg">
              Vai al corso
            </Button>
          ) : session?.user ? (
            <CheckoutForm courseId={course.id} free={course.priceCents === 0} />
          ) : (
            <Button href={`/login?callbackUrl=/corsi/${course.slug}`} className="w-full" size="lg">
              Accedi per acquistare
            </Button>
          )}
        </div>

        <ul className="mt-6 space-y-3 text-sm text-foreground/70">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> Accesso immediato e a vita
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> Guarda da mobile o desktop
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> Pagamento sicuro con Stripe
          </li>
        </ul>
      </aside>
    </div>
  );
}
