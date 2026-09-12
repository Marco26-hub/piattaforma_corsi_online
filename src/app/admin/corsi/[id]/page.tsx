import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle, FileText, Plus, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateCourse, createModule, createLesson, deleteModule, deleteLesson } from "@/app/actions/courses";
import { CourseForm } from "@/components/admin/course-form";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { DeleteIconButton } from "@/components/admin/delete-icon-button";
import { LessonTypeFields } from "@/components/admin/lesson-type-fields";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id }, select: { title: true } });
  return { title: course?.title ?? "Modifica corso" };
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/corsi"
          className="inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Corsi
        </Link>
        {course.published && (
          <Link
            href={`/corsi/${course.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-brand-400 hover:underline"
          >
            Vedi pagina pubblica <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>

      <div>
        <h1 className="font-serif text-2xl font-medium">{course.title}</h1>
        <Badge variant={course.published ? "success" : "neutral"} className="mt-2">
          {course.published ? "Pubblicato" : "Bozza"}
        </Badge>
      </div>

      <Card className="p-6">
        <h2 className="mb-5 font-semibold">Dettagli corso</h2>
        <CourseForm
          action={updateCourse.bind(null, course.id)}
          defaultValues={{
            title: course.title,
            subtitle: course.subtitle,
            description: course.description,
            imageUrl: course.imageUrl,
            priceCents: course.priceCents,
            level: course.level,
            category: course.category,
            published: course.published,
            featured: course.featured,
          }}
        />
      </Card>

      <div>
        <h2 className="mb-4 font-semibold">Programma del corso</h2>

        <div className="space-y-4">
          {course.modules.map((module, mIndex) => (
            <Card key={module.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">
                  Modulo {mIndex + 1}: {module.title}
                </h3>
                <DeleteIconButton
                  confirmMessage={`Eliminare il modulo "${module.title}" e tutte le sue lezioni?`}
                  action={deleteModule.bind(null, course.id, module.id)}
                />
              </div>

              <ul className="mt-4 space-y-2">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-2.5 text-sm"
                  >
                    {lesson.type === "VIDEO" ? (
                      <PlayCircle className="size-4 shrink-0 text-foreground/40" />
                    ) : (
                      <FileText className="size-4 shrink-0 text-foreground/40" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                    {lesson.isFreePreview && <Badge variant="accent">Anteprima</Badge>}
                    {lesson.durationMin && (
                      <span className="shrink-0 text-xs text-foreground/40">
                        {lesson.durationMin}m
                      </span>
                    )}
                    <DeleteIconButton
                      confirmMessage={`Eliminare la lezione "${lesson.title}"?`}
                      action={deleteLesson.bind(null, course.id, lesson.id)}
                    />
                  </li>
                ))}
                {module.lessons.length === 0 && (
                  <p className="px-3 py-2 text-sm text-foreground/40">Nessuna lezione ancora.</p>
                )}
              </ul>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-brand-400">
                  + Aggiungi lezione
                </summary>
                <form
                  action={createLesson.bind(null, course.id, module.id)}
                  className="mt-4 space-y-4 rounded-xl border border-border-subtle p-4"
                >
                  <div>
                    <Label>Titolo lezione</Label>
                    <Input name="title" required />
                  </div>
                  <LessonTypeFields />
                  <div className="flex items-center gap-6">
                    <div className="w-32">
                      <Label>Durata (min)</Label>
                      <Input name="durationMin" type="number" min="0" />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        name="isFreePreview"
                        className="size-4 rounded border-border-subtle accent-brand-600"
                      />
                      Anteprima gratuita
                    </label>
                  </div>
                  <SubmitButton size="sm">
                    <Plus className="size-4" /> Aggiungi lezione
                  </SubmitButton>
                </form>
              </details>
            </Card>
          ))}
        </div>

        <Card className="mt-4 p-5">
          <form action={createModule.bind(null, course.id)} className="flex items-end gap-3">
            <div className="flex-1">
              <Label>Nuovo modulo</Label>
              <Input name="title" placeholder="es. Introduzione" required />
            </div>
            <SubmitButton>
              <Plus className="size-4" /> Aggiungi
            </SubmitButton>
          </form>
        </Card>
      </div>

      <Card className="border-red-900/40 p-6">
        <h2 className="font-semibold text-red-400">Zona pericolosa</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Eliminare il corso rimuove anche moduli, lezioni e iscrizioni collegate.
        </p>
        <div className="mt-4">
          <DeleteCourseButton id={course.id} title={course.title} />
        </div>
      </Card>
    </div>
  );
}
