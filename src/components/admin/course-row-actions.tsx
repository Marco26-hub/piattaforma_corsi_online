"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { togglePublish, archiveCourse, duplicateCourse } from "@/app/actions/courses";

export function CourseRowActions({ id, published, title, archived = false }: { id: string; published: boolean; title: string; archived?: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const run = (action: () => Promise<unknown>) => startTransition(async () => {
    try { await action(); } catch (error) { toast.error(error instanceof Error ? error.message : "Operazione non riuscita"); }
  });
  const iconButton = "inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border-strong hover:bg-surface-muted disabled:opacity-40";
  return <div className="flex flex-wrap gap-2" aria-label={`Azioni corso ${title}`}>
    <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border-strong px-3 text-sm font-semibold hover:bg-surface-muted disabled:opacity-40" disabled={pending} onClick={() => run(async () => {
      if (archived) { await archiveCourse(id, false); toast.success("Corso ripristinato come bozza"); }
      else { await togglePublish(id, !published); toast.success(published ? "Corso ritirato dal catalogo" : "Corso pubblicato"); }
    })}>
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : archived ? <RotateCcw size={16} aria-hidden="true" /> : published ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      {archived ? "Ripristina bozza" : published ? "Ritira dal catalogo" : "Pubblica"}
    </button>
    <button type="button" className={iconButton} title="Duplica corso" aria-label="Duplica corso" disabled={pending} onClick={() => run(async () => {
      const copyId = await duplicateCourse(id); toast.success("Copia creata come bozza"); router.push(`/admin/corsi/${copyId}`);
    })}><Copy size={16} aria-hidden="true" /></button>
    {!archived && <button type="button" className={iconButton} title="Archivia corso" aria-label="Archivia corso" disabled={pending} onClick={() => {
      if (window.confirm(`Archiviare "${title}"? Il corso non sara nel catalogo, ma gli iscritti manterranno il loro accesso.`)) run(async () => { await archiveCourse(id, true); toast.success("Corso archiviato"); });
    }}><Archive size={16} aria-hidden="true" /></button>}
  </div>;
}
