import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, CheckCircle2, CircleAlert, FileText, PlayCircle, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { coursePublicationIssues } from "@/lib/course-publishing";
import { updateCourse, saveModule, saveLesson } from "@/app/actions/courses";
import { CourseForm } from "@/components/admin/course-form";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import { CourseItemActions } from "@/components/admin/course-item-actions";
import { ModuleForm, LessonForm } from "@/components/admin/course-program-forms";
import { Badge } from "@/components/ui/badge";
import styles from "@/styles/course-management.module.css";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id }, select: { title: true } });
  return { title: course?.title ?? "Modifica corso" };
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id }, include: {
    _count: { select: { enrollments: true } },
    modules: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { lessons: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } } },
  } });
  if (!course) notFound();
  const history = await prisma.enrollmentRevocation.count({ where: { courseId: id } });
  const protectedContent = !!(course._count.enrollments || history);
  const lessons = course.modules.flatMap(item => item.lessons), minutes = lessons.reduce((sum, item) => sum + (item.durationMin || 0), 0);
  const issues = coursePublicationIssues(course);
  return <div className={`${styles.workspace} mx-auto max-w-5xl space-y-6`}>
    <Link href="/admin/corsi" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} aria-hidden="true" />Tutti i corsi</Link>
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-3"><Badge variant="outline" className="text-sm normal-case tracking-normal text-foreground">{course.archivedAt ? "Archiviato" : course.published ? "Pubblicato" : "Bozza"}</Badge>
        <span className="text-sm text-foreground/80">{course.modules.length} {course.modules.length === 1 ? "modulo" : "moduli"} · {lessons.length} {lessons.length === 1 ? "lezione" : "lezioni"} · {minutes} minuti · {course._count.enrollments} {course._count.enrollments === 1 ? "iscritto" : "iscritti"}</span>
      </div>
      <h1 className="text-2xl font-semibold leading-8">{course.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/admin/corsi/${id}/anteprima`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong px-3 text-sm font-semibold hover:bg-surface-muted"><Eye size={16} aria-hidden="true" />Anteprima</Link>
        <CourseRowActions id={id} published={course.published} archived={!!course.archivedAt} title={course.title} />
      </div>
    </header>
    {!course.archivedAt && <aside className="border-y border-border-subtle py-4" aria-label="Verifica pubblicazione">
      <p className="flex items-center gap-2 font-semibold">{issues.length ? <CircleAlert size={18} aria-hidden="true" /> : <CheckCircle2 size={18} className="text-brand-400" aria-hidden="true" />}{issues.length ? "Da completare" : "Pronto per la pubblicazione"}</p>
      {!!issues.length && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
    </aside>}
    <nav aria-label="Sezioni del corso" className="flex flex-wrap gap-4 border-b border-border-subtle text-sm font-semibold"><a href="#dettagli" className="inline-flex min-h-11 items-center">Dettagli</a><a href="#programma" className="inline-flex min-h-11 items-center">Moduli e lezioni</a></nav>
    <section id="dettagli" aria-labelledby="course-details" className="scroll-mt-24 border-b border-border-subtle pb-6">
      <h2 id="course-details" className="mb-5 text-lg font-semibold">Dettagli del corso</h2>
      <CourseForm key={course.id} action={updateCourse.bind(null, id)} defaultValues={{ title: course.title, subtitle: course.subtitle, description: course.description,
        imageUrl: course.imageUrl, priceCents: course.priceCents, level: course.level, category: course.category, published: course.published, featured: course.featured }} />
    </section>
    <section id="programma" aria-labelledby="course-program" className="scroll-mt-24 space-y-5">
      <h2 id="course-program" className="text-lg font-semibold">Moduli e lezioni</h2>
      {!course.modules.length && <p className="border-y border-dashed border-border-strong py-6 text-foreground/80">Nessun modulo presente.</p>}
      {course.modules.map((item, index) => <article key={item.id} className="min-w-0 rounded-lg border border-border-strong p-4 sm:p-5" aria-label={`Modulo ${item.title}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="min-w-0 text-lg font-semibold">{index + 1}. {item.title}</h3>
          <CourseItemActions courseId={id} id={item.id} kind="module" title={item.title} first={index === 0} last={index === course.modules.length - 1} protectedContent={protectedContent} />
        </div>
        <details className="mt-2 border-b border-border-subtle pb-3"><summary className="flex gap-2 text-sm"><Pencil size={16} className="self-center" aria-hidden="true" />Modifica titolo del modulo</summary>
          <div className="pt-3"><ModuleForm action={saveModule.bind(null, id, item.id)} id={item.id} title={item.title} editing /></div>
        </details>
        <ul className="divide-y divide-border-subtle">
          {item.lessons.map((lesson, lessonIndex) => <li key={lesson.id} className="min-w-0 space-y-3 py-4" aria-label={`Lezione ${lesson.title}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-start gap-2 font-semibold">{lesson.type === "VIDEO" ? <PlayCircle size={18} className="mt-1 shrink-0" aria-hidden="true" /> : <FileText size={18} className="mt-1 shrink-0" aria-hidden="true" />}<span>{lessonIndex + 1}. {lesson.title}</span></p>
                <p className="mt-1 text-sm text-foreground/80">{lesson.type === "VIDEO" ? "Video" : "Testo"}{lesson.durationMin ? ` · ${lesson.durationMin} minuti` : ""}{lesson.isFreePreview ? " · Anteprima gratuita" : ""}</p>
              </div>
              <CourseItemActions courseId={id} id={lesson.id} kind="lesson" title={lesson.title} first={lessonIndex === 0} last={lessonIndex === item.lessons.length - 1} protectedContent={protectedContent} />
            </div>
            <details><summary className="flex gap-2 text-sm"><Pencil size={16} className="self-center" aria-hidden="true" />Modifica lezione</summary>
              <div className="border-t border-border-subtle pt-4"><LessonForm action={saveLesson.bind(null, id, item.id, lesson.id)} id={lesson.id} lesson={lesson} /></div>
            </details>
          </li>)}
        </ul>
        {!item.lessons.length && <p className="py-4 text-sm text-foreground/80">Nessuna lezione in questo modulo.</p>}
        <details className="border-t border-border-subtle pt-2"><summary className="flex gap-2 text-sm text-brand-400"><Plus size={16} className="self-center" aria-hidden="true" />Aggiungi lezione</summary>
          <div className="pt-3"><LessonForm action={saveLesson.bind(null, id, item.id, null)} id={`${item.id}-new`} /></div>
        </details>
      </article>)}
      <div className="border-t border-border-subtle pt-5"><ModuleForm action={saveModule.bind(null, id, null)} id="new-module" /></div>
    </section>
  </div>;
}
