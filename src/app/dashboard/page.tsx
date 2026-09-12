import { Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { Button } from "@/components/ui/button";
import { EnrolledCourseCard } from "@/components/dashboard/enrolled-course-card";

export const metadata = { title: "I miei corsi" };

export default async function DashboardPage() {
  const session = await requireUser();

  const [enrollments, progressRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: { modules: { include: { lessons: { select: { id: true } } } } },
        },
      },
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedIds = new Set(progressRows.map((p) => p.lessonId));

  return (
    <div className="container-app py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium sm:text-3xl">
          Bentornato{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 text-foreground/60">Continua da dove avevi lasciato.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-subtle py-20 text-center">
          <Compass className="size-10 text-foreground/30" />
          <p className="mt-4 max-w-sm text-foreground/60">
            Non hai ancora nessun corso. Scopri il catalogo e inizia il tuo
            primo percorso.
          </p>
          <Button href="/corsi" className="mt-6">
            Esplora i corsi
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const lessons = enrollment.course.modules.flatMap((m) => m.lessons);
            const completedLessons = lessons.filter((l) => completedIds.has(l.id)).length;

            return (
              <EnrolledCourseCard
                key={enrollment.id}
                slug={enrollment.course.slug}
                title={enrollment.course.title}
                imageUrl={enrollment.course.imageUrl}
                totalLessons={lessons.length}
                completedLessons={completedLessons}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
