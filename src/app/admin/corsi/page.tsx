import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { Plus, BookOpen, Search, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { formatPrice } from "@/lib/utils";
import { parseCourseFilters, courseFilterWhere, courseFilterHref, type CourseFilters } from "@/lib/course-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import styles from "@/styles/course-management.module.css";

export const metadata = { title: "Gestione corsi" };
const PAGE_SIZE = 20;

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const filters = parseCourseFilters(await searchParams);
  const where = courseFilterWhere(filters);
  const [total, drafts, published, archived, count, categories] = await Promise.all([
    prisma.course.count(), prisma.course.count({ where: { published: false, archivedAt: null } }),
    prisma.course.count({ where: { published: true, archivedAt: null } }), prisma.course.count({ where: { archivedAt: { not: null } } }),
    prisma.course.count({ where }), prisma.course.findMany({ where: { category: { not: null } }, select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE)), page = Math.min(filters.page, pages);
  const orderBy: Prisma.CourseOrderByWithRelationInput[] = filters.sort === "title" ? [{ title: "asc" }, { id: "asc" }]
    : filters.sort === "price" ? [{ priceCents: "asc" }, { id: "asc" }] : [{ updatedAt: "desc" }, { id: "asc" }];
  const courses = await prisma.course.findMany({ where, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    include: { _count: { select: { modules: true, enrollments: true } }, modules: { select: { _count: { select: { lessons: true } } } } },
  });
  const tabs: { status: CourseFilters["status"]; label: string; count: number }[] = [
    { status: "all", label: "Tutti", count: total }, { status: "draft", label: "Bozze", count: drafts },
    { status: "published", label: "Pubblicati", count: published }, { status: "archived", label: "Archivio", count: archived },
  ];
  return <div className={`${styles.workspace} space-y-6`}>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-semibold">Corsi</h1><p className="mt-1 text-foreground/80">{total} {total === 1 ? "corso nel catalogo" : "corsi nel catalogo"}</p></div>
      <Button href="/admin/corsi/nuovo"><Plus size={18} aria-hidden="true" />Nuovo corso</Button>
    </header>
    <nav aria-label="Stato dei corsi" className="flex flex-wrap gap-1 border-b border-border-subtle">
      {tabs.map(tab => <Link key={tab.status} href={courseFilterHref({ status: tab.status })} aria-current={filters.status === tab.status ? "page" : undefined}
        className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold ${filters.status === tab.status ? "border-brand-400 text-brand-400" : "border-transparent text-foreground/80 hover:text-foreground"}`}>
        {tab.label}<span className="tabular-nums">{tab.count}</span>
      </Link>)}
    </nav>
    <form method="get" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_12rem_12rem_auto]" role="search" aria-label="Cerca nei corsi">
      <input type="hidden" name="status" value={filters.status} />
      <div><Label htmlFor="course-search">Cerca un corso</Label><Input id="course-search" name="q" defaultValue={filters.q} placeholder="Titolo o contenuto" maxLength={200} /></div>
      <div><Label htmlFor="course-category">Categoria</Label><Select id="course-category" name="category" defaultValue={filters.category}>
        <option value="">Tutte le categorie</option>{categories.filter(item => item.category).map(item => <option key={item.category} value={item.category!}>{item.category}</option>)}
      </Select></div>
      <div><Label htmlFor="course-sort">Ordina per</Label><Select id="course-sort" name="sort" defaultValue={filters.sort}>
        <option value="updated">Ultima modifica</option><option value="title">Titolo</option><option value="price">Prezzo crescente</option>
      </Select></div>
      <div className="flex items-end gap-3"><Button type="submit"><Search size={16} aria-hidden="true" />Cerca</Button>
        {(filters.q || filters.category) && <Link className="inline-flex min-h-11 items-center text-sm font-semibold underline" href={courseFilterHref({ status: filters.status })}>Azzera filtri</Link>}
      </div>
    </form>
    <p className="text-sm text-foreground/80" role="status">{count === 0 ? "Nessun corso trovato" : `${count} ${count === 1 ? "corso trovato" : "corsi trovati"}`}</p>
    {!courses.length ? <div className="border-y border-border-subtle py-12 text-center">
      <BookOpen size={32} className="mx-auto mb-3 text-brand-400" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{total ? "Nessun corso con questi filtri" : "Il catalogo e ancora vuoto"}</h2>
      <div className="mt-4"><Button href={total ? courseFilterHref() : "/admin/corsi/nuovo"} variant="outline">{total ? "Mostra tutti i corsi" : "Crea il primo corso"}</Button></div>
    </div> : <div className="divide-y divide-border-subtle border-y border-border-subtle">
      {courses.map(course => {
        const lessons = course.modules.reduce((sum, item) => sum + item._count.lessons, 0);
        return <article key={course.id} aria-label={`Corso ${course.title}`} className="grid min-w-0 gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted">
              {course.imageUrl ? <Image unoptimized src={course.imageUrl} alt="" width={56} height={56} className="size-full object-cover" /> : <BookOpen size={24} className="text-brand-400" aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/corsi/${course.id}`} className="block text-lg font-semibold leading-6 [overflow-wrap:anywhere] hover:underline">{course.title}</Link>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-foreground/80">
                <Badge variant="outline" className="text-sm normal-case tracking-normal text-foreground">{course.archivedAt ? "Archiviato" : course.published ? "Pubblicato" : "Bozza"}</Badge>
                {course.category && <span>{course.category}</span>}<span>{course._count.modules} {course._count.modules === 1 ? "modulo" : "moduli"}</span><span>{lessons} {lessons === 1 ? "lezione" : "lezioni"}</span><span>{course._count.enrollments} {course._count.enrollments === 1 ? "iscritto" : "iscritti"}</span>
              </div>
              <p className="mt-2 font-semibold tabular-nums">{course.priceCents === 0 ? "Gratuito" : formatPrice(course.priceCents, course.currency)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/corsi/${course.id}`} aria-label={`Modifica corso ${course.title}`} title="Modifica corso" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border-strong hover:bg-surface-muted"><Pencil size={16} aria-hidden="true" /></Link>
            <CourseRowActions id={course.id} published={course.published} archived={!!course.archivedAt} title={course.title} />
          </div>
        </article>;
      })}
    </div>}
    {pages > 1 && <nav aria-label="Pagine dei corsi" className="flex items-center justify-between gap-3">
      {page > 1 ? <Link href={courseFilterHref({ ...filters, page: page - 1 })} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold"><ChevronLeft size={18} aria-hidden="true" />Precedente</Link> : <span />}
      <span className="text-sm tabular-nums">{page} / {pages}</span>
      {page < pages ? <Link href={courseFilterHref({ ...filters, page: page + 1 })} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold">Successiva<ChevronRight size={18} aria-hidden="true" /></Link> : <span />}
    </nav>}
  </div>;
}
