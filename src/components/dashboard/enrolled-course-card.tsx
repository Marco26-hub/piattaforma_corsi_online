import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";

export function EnrolledCourseCard({
  slug,
  title,
  imageUrl,
  totalLessons,
  completedLessons,
}: {
  slug: string;
  title: string;
  imageUrl: string | null;
  totalLessons: number;
  completedLessons: number;
}) {
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const isDone = totalLessons > 0 && completedLessons === totalLessons;

  return (
    <Link
      href={`/dashboard/corsi/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface transition-colors hover:border-border-strong"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-brand-900">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <BookOpen className="size-12 text-white/80" />
          </div>
        )}
        {isDone && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
            <CheckCircle2 className="size-3.5" /> Completato
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-semibold leading-snug">{title}</h3>

        <div className="mt-auto">
          <div className="mb-1.5 flex items-center justify-between text-xs text-foreground/60">
            <span>
              {completedLessons}/{totalLessons} lezioni
            </span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
