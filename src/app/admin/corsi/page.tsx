import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CourseRowActions } from "@/components/admin/course-row-actions";

export const metadata = { title: "Corsi" };

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Corsi</h1>
          <p className="mt-1 text-foreground/60">Gestisci il catalogo corsi.</p>
        </div>
        <Button href="/admin/corsi/nuovo">
          <Plus className="size-4" /> Nuovo corso
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-16 text-center">
          <BookOpen className="size-8 text-foreground/30" />
          <p className="text-foreground/60">Nessun corso creato ancora.</p>
          <Button href="/admin/corsi/nuovo">Crea il primo corso</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex items-center gap-4 p-4">
              <div className="hidden size-14 shrink-0 overflow-hidden rounded-md bg-brand-900 sm:block">
                {course.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.imageUrl} alt="" className="size-full object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/corsi/${course.id}`}
                  className="truncate font-medium hover:text-brand-400 hover:underline"
                >
                  {course.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                  <Badge variant={course.published ? "success" : "neutral"}>
                    {course.published ? "Pubblicato" : "Bozza"}
                  </Badge>
                  <span>{course._count.modules} moduli</span>
                  <span>{course._count.enrollments} iscritti</span>
                </div>
              </div>

              <span className="hidden shrink-0 font-semibold sm:block">
                {formatPrice(course.priceCents, course.currency)}
              </span>

              <CourseRowActions id={course.id} published={course.published} title={course.title} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
