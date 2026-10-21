import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { formatPrice } from "@/lib/utils";
import { LessonContent } from "@/components/dashboard/lesson-content";
import styles from "@/styles/course-management.module.css";

export const metadata = { title: "Anteprima riservata" };
export default async function CoursePreview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lezione?: string }> }) {
  await requireAdmin();
  const { id } = await params, { lezione } = await searchParams;
  const course = await prisma.course.findUnique({ where: { id }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
  if (!course) notFound();
  const lessons = course.modules.flatMap(item => item.lessons), active = lessons.find(item => item.id === lezione) || lessons[0];
  return <div className={`${styles.workspace} mx-auto max-w-5xl space-y-6`}>
    <Link href={`/admin/corsi/${id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"><ArrowLeft size={16} aria-hidden="true" />Torna alla modifica</Link>
    <p className="flex items-center gap-2 text-sm text-brand-400"><LockKeyhole size={16} aria-hidden="true" />Anteprima riservata all&apos;amministratore</p>
    <h1 className="text-2xl font-semibold">{course.title}</h1>
    {course.subtitle && <p className="text-lg text-foreground/80">{course.subtitle}</p>}
    <p className="font-semibold">{course.priceCents ? formatPrice(course.priceCents, course.currency) : "Gratuito"}</p>
    <p className="whitespace-pre-line text-foreground/80">{course.description}</p>
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Lezioni in anteprima" className="border-y border-border-subtle py-4">
        {course.modules.map(item => <div key={item.id} className="mb-4"><h2 className="font-semibold">{item.title}</h2>
          {item.lessons.map(lesson => <Link key={lesson.id} aria-current={active?.id === lesson.id ? "page" : undefined} href={`/admin/corsi/${id}/anteprima?lezione=${encodeURIComponent(lesson.id)}`}
            className={`mt-1 flex min-h-11 items-center text-sm ${active?.id === lesson.id ? "font-semibold text-brand-400" : "text-foreground/80 hover:underline"}`}>{lesson.title}</Link>)}
        </div>)}
      </nav>
      <section aria-label="Contenuto della lezione" className="min-w-0 space-y-4">{active ? <><h2 className="text-xl font-semibold">{active.title}</h2><LessonContent lesson={active} /></> : <p className="text-foreground/80">Nessuna lezione presente.</p>}</section>
    </div>
  </div>;
}
