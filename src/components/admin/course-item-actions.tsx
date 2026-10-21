"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { moveItem, deleteLesson, deleteModule } from "@/app/actions/courses";

export function CourseItemActions({ courseId, id, kind, title, first, last, protectedContent }: {
  courseId: string; id: string; kind: "module" | "lesson"; title: string; first: boolean; last: boolean; protectedContent: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const noun = kind === "module" ? "modulo" : "lezione";
  const run = (action: () => Promise<void>) => startTransition(async () => {
    try { await action(); } catch (error) { toast.error(error instanceof Error ? error.message : "Operazione non riuscita"); }
  });
  const classes = "inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border-subtle hover:bg-surface-muted disabled:opacity-40";
  return <div className="flex shrink-0 gap-1" aria-label={`Azioni ${noun} ${title}`}>
    <button type="button" className={classes} title={`Sposta ${noun} in alto`} aria-label={`Sposta ${noun} in alto`} disabled={pending || first} onClick={() => run(() => moveItem(courseId, id, kind, "up"))}><ArrowUp size={16} aria-hidden="true" /></button>
    <button type="button" className={classes} title={`Sposta ${noun} in basso`} aria-label={`Sposta ${noun} in basso`} disabled={pending || last} onClick={() => run(() => moveItem(courseId, id, kind, "down"))}><ArrowDown size={16} aria-hidden="true" /></button>
    <button type="button" className={`${classes} text-red-700 dark:text-red-300`} aria-label={`Elimina ${noun}`} title={protectedContent ? "Contenuto protetto: il corso ha iscrizioni" : `Elimina ${noun}`} disabled={pending || protectedContent} onClick={() => {
      if (window.confirm(`Eliminare ${noun} "${title}"${kind === "module" ? " e tutte le sue lezioni" : ""}? L'operazione non si puo annullare.`)) run(() => kind === "module" ? deleteModule(courseId, id) : deleteLesson(courseId, id));
    }}>{pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}</button>
  </div>;
}
