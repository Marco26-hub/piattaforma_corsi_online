import Link from "next/link";
import { BookOpen, Signal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Base",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzato",
};

export type CourseCardData = {
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  level: string;
  category: string | null;
  _count?: { modules?: number };
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/corsi/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface transition-colors duration-200 hover:border-border-strong"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-brand-900">
        {course.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.imageUrl}
            alt={course.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <BookOpen className="size-12 text-white/80" />
          </div>
        )}
        {course.category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {course.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="brand">
            <Signal className="size-3" />
            {LEVEL_LABEL[course.level] ?? course.level}
          </Badge>
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug">{course.title}</h3>

        {course.subtitle && (
          <p className="line-clamp-2 text-sm text-foreground/60">{course.subtitle}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-brand-300">
            {formatPrice(course.priceCents, course.currency)}
          </span>
          <span className="text-sm font-medium text-accent-400 group-hover:underline">
            Scopri di più
          </span>
        </div>
      </div>
    </Link>
  );
}
