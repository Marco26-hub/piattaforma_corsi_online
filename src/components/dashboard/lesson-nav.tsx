import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type LessonItem = {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT";
  durationMin: number | null;
};

type ModuleItem = {
  id: string;
  title: string;
  lessons: LessonItem[];
};

function LessonNavList({
  courseSlug,
  modules,
  activeLessonId,
  completedIds,
}: {
  courseSlug: string;
  modules: ModuleItem[];
  activeLessonId: string;
  completedIds: Set<string>;
}) {
  return (
    <div className="space-y-5">
      {modules.map((module, index) => (
        <div key={module.id}>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-foreground/40">
            Modulo {index + 1}: {module.title}
          </p>
          <ul className="space-y-1">
            {module.lessons.map((lesson) => {
              const isActive = lesson.id === activeLessonId;
              const isDone = completedIds.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/dashboard/corsi/${courseSlug}?lezione=${lesson.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-brand-900/50 font-medium text-brand-200"
                        : "hover:bg-surface-muted"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-foreground/25" />
                    )}
                    {lesson.type === "VIDEO" ? (
                      <PlayCircle className="size-4 shrink-0 text-foreground/40" />
                    ) : (
                      <FileText className="size-4 shrink-0 text-foreground/40" />
                    )}
                    <span className="flex-1 truncate">{lesson.title}</span>
                    {lesson.durationMin && (
                      <span className="shrink-0 text-xs text-foreground/40">
                        {lesson.durationMin}m
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function LessonNav(props: {
  courseSlug: string;
  modules: ModuleItem[];
  activeLessonId: string;
  completedIds: Set<string>;
}) {
  return (
    <>
      <details className="rounded-2xl border border-border-subtle bg-surface p-4 lg:hidden" open>
        <summary className="cursor-pointer text-sm font-semibold">Programma del corso</summary>
        <div className="mt-4">
          <LessonNavList {...props} />
        </div>
      </details>

      <div className="hidden rounded-2xl border border-border-subtle bg-surface p-4 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <p className="mb-3 px-1 text-sm font-semibold">Programma del corso</p>
        <LessonNavList {...props} />
      </div>
    </>
  );
}
