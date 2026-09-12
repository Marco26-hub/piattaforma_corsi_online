"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { togglePublish, deleteCourse } from "@/app/actions/courses";

export function CourseRowActions({
  id,
  published,
  title,
}: {
  id: string;
  published: boolean;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isPending}
        title={published ? "Nascondi corso" : "Pubblica corso"}
        onClick={() => startTransition(() => togglePublish(id, !published))}
        className="flex size-9 items-center justify-center rounded-full text-foreground/60 hover:bg-surface-muted disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : published ? (
          <Eye className="size-4" />
        ) : (
          <EyeOff className="size-4" />
        )}
      </button>
      <button
        type="button"
        disabled={isPending}
        title="Elimina corso"
        onClick={() => {
          if (window.confirm(`Eliminare definitivamente "${title}"? Questa azione non si può annullare.`)) {
            startTransition(async () => {
              try {
                await deleteCourse(id);
              } catch {
                toast.error("Impossibile eliminare il corso");
              }
            });
          }
        }}
        className="flex size-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
