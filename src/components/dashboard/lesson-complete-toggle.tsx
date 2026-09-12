"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toggleLessonProgress } from "@/app/actions/progress";
import { cn } from "@/lib/utils";

export function LessonCompleteToggle({
  courseSlug,
  lessonId,
  completed,
}: {
  courseSlug: string;
  lessonId: string;
  completed: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          toggleLessonProgress(courseSlug, lessonId, !completed);
        })
      }
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        completed
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border-subtle hover:bg-surface-muted"
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : completed ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <Circle className="size-4" />
      )}
      {completed ? "Lezione completata" : "Segna come completata"}
    </button>
  );
}
