import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/site/course-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@prisma/client";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Base",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzato",
};

export const metadata = {
  title: "Catalogo corsi",
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; livello?: string }>;
}) {
  const { q, categoria, livello } = await searchParams;

  const where: Prisma.CourseWhereInput = {
    published: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { subtitle: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoria ? { category: categoria } : {}),
    ...(livello ? { level: livello as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
  };

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.course.findMany({
      where: { published: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const hasFilters = Boolean(q || categoria || livello);

  return (
    <div className="container-app py-12 md:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-serif text-3xl font-medium sm:text-4xl">Catalogo corsi</h1>
        <p className="mt-3 text-foreground/60">
          Trova il corso giusto per il tuo prossimo obiettivo.
        </p>
      </div>

      <form className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
          <Input
            type="search"
            name="q"
            placeholder="Cerca un corso..."
            defaultValue={q}
            className="pl-11"
          />
        </div>

        <Select name="categoria" defaultValue={categoria ?? ""}>
          <option value="">Tutte le categorie</option>
          {categories.map(
            (c) =>
              c.category && (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              )
          )}
        </Select>

        <Select name="livello" defaultValue={livello ?? ""}>
          <option value="">Tutti i livelli</option>
          {Object.entries(LEVEL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Button type="submit">Filtra</Button>
      </form>

      {hasFilters && (
        <div className="mb-6">
          <Button href="/corsi" variant="ghost" size="sm">
            Rimuovi filtri
          </Button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle py-20 text-center">
          <p className="text-foreground/60">
            Nessun corso trovato con questi filtri.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
