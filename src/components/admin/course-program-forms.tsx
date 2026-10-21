"use client";

import { useActionState, useState } from "react";
import { Plus, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/ui/form-error";
import type { ActionState } from "@/app/actions/auth";

type FormAction = (previous: ActionState, data: FormData) => Promise<ActionState>;

export function ModuleForm({ action, id, title = "", editing = false }: { action: FormAction; id: string; title?: string; editing?: boolean }) {
  const [value, setValue] = useState(title);
  const [state, submit] = useActionState(async (previous: ActionState, data: FormData) => {
    const result = await action(previous, data);
    if (result?.success && !editing) setValue("");
    return result;
  }, undefined);
  return <form action={submit} aria-label={editing ? "Modifica titolo del modulo" : "Aggiungi modulo"} className="space-y-3">
    <FormError message={state?.error} />
    {state?.success && <p role="status" className="text-sm text-brand-400">{state.success}</p>}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1"><Label htmlFor={`${id}-title`}>{editing ? "Titolo del modulo" : "Nuovo modulo"}</Label>
        <Input id={`${id}-title`} name="title" value={value} onChange={event => setValue(event.target.value)} required maxLength={200} placeholder="Es. Introduzione" />
      </div>
      <SubmitButton variant={editing ? "outline" : "primary"} pendingLabel="Salvataggio...">
        {editing ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{editing ? "Salva titolo" : "Aggiungi modulo"}
      </SubmitButton>
    </div>
  </form>;
}

type LessonValues = { title: string; type: "VIDEO" | "TEXT"; videoUrl: string; content: string; durationMin: string; isFreePreview: boolean };
const EMPTY_LESSON: LessonValues = { title: "", type: "VIDEO", videoUrl: "", content: "", durationMin: "", isFreePreview: false };

export function LessonForm({ action, id, lesson }: {
  action: FormAction; id: string;
  lesson?: { title: string; type: "VIDEO" | "TEXT"; videoUrl: string | null; content: string | null; durationMin: number | null; isFreePreview: boolean };
}) {
  const [values, setValues] = useState<LessonValues>(lesson ? {
    title: lesson.title, type: lesson.type, videoUrl: lesson.videoUrl || "", content: lesson.content || "",
    durationMin: lesson.durationMin?.toString() || "", isFreePreview: lesson.isFreePreview,
  } : EMPTY_LESSON);
  const change = <K extends keyof LessonValues>(key: K, value: LessonValues[K]) => setValues(current => ({ ...current, [key]: value }));
  const [state, submit] = useActionState(async (previous: ActionState, data: FormData) => {
    const result = await action(previous, data);
    if (result?.success && !lesson) setValues(EMPTY_LESSON);
    return result;
  }, undefined);

  return <form action={submit} aria-label={lesson ? `Modifica lezione ${lesson.title}` : "Aggiungi lezione"} className="space-y-4">
    <FormError message={state?.error} />
    {state?.success && <p role="status" className="text-sm text-brand-400">{state.success}</p>}
    <div><Label htmlFor={`${id}-title`}>Titolo della lezione</Label><Input id={`${id}-title`} name="title" value={values.title} onChange={e => change("title", e.target.value)} maxLength={200} required /></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><Label htmlFor={`${id}-type`}>Contenuto della lezione</Label><Select id={`${id}-type`} name="type" value={values.type} onChange={e => change("type", e.target.value as LessonValues["type"])}>
        <option value="VIDEO">Video</option><option value="TEXT">Testo</option>
      </Select></div>
      <div><Label htmlFor={`${id}-duration`}>Durata in minuti</Label><Input id={`${id}-duration`} name="durationMin" type="number" min="0" max="10080" step="1" value={values.durationMin} onChange={e => change("durationMin", e.target.value)} /></div>
    </div>
    {values.type === "VIDEO" ? <div><Label htmlFor={`${id}-video`}>Collegamento al video</Label>
      <Input id={`${id}-video`} name="videoUrl" type="url" value={values.videoUrl} onChange={e => change("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
    </div> : <div><Label htmlFor={`${id}-content`}>Testo della lezione</Label>
      <Textarea id={`${id}-content`} name="content" value={values.content} onChange={e => change("content", e.target.value)} rows={8} required />
    </div>}
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" name="isFreePreview" className="size-5 accent-brand-600" checked={values.isFreePreview} onChange={e => change("isFreePreview", e.target.checked)} />Anteprima gratuita</label>
    <SubmitButton pendingLabel="Salvataggio...">{lesson ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{lesson ? "Salva lezione" : "Aggiungi lezione"}</SubmitButton>
  </form>;
}
