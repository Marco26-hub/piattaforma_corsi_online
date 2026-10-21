"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/ui/form-error";
import type { ActionState } from "@/app/actions/auth";

type CourseDefaultValues = {
  title: string;
  subtitle: string | null;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string | null;
  published: boolean;
  featured: boolean;
};

export function CourseForm({
  action,
  defaultValues,
  submitLabel = "Salva corso",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: CourseDefaultValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [values, setValues] = useState({
    title: defaultValues?.title ?? "", subtitle: defaultValues?.subtitle ?? "",
    description: defaultValues?.description ?? "", imageUrl: defaultValues?.imageUrl ?? "",
    price: defaultValues ? (defaultValues.priceCents / 100).toFixed(2) : "0",
    category: defaultValues?.category ?? "", level: defaultValues?.level ?? "BEGINNER",
    featured: defaultValues?.featured ?? false,
  });
  const change = <K extends keyof typeof values>(key: K, value: typeof values[K]) => setValues(current => ({ ...current, [key]: value }));

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error} />
      {state?.success && <p role="status" className="text-sm font-medium text-brand-400">{state.success}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Titolo del corso</Label>
          <Input id="title" name="title" required maxLength={200} value={values.title} onChange={e => change("title", e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="subtitle">Sottotitolo</Label>
          <Input
            id="subtitle"
            name="subtitle"
            placeholder="Una frase che spiega il corso"
            value={values.subtitle} onChange={e => change("subtitle", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Descrizione</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={6}
            value={values.description} onChange={e => change("description", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="imageUrl">Immagine di copertina (collegamento)</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://esempio.it/copertina.jpg"
            value={values.imageUrl} onChange={e => change("imageUrl", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="price">Prezzo (EUR)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={values.price} onChange={e => change("price", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            placeholder="es. Sviluppo Web"
            value={values.category} onChange={e => change("category", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="level">Livello</Label>
          <Select id="level" name="level" value={values.level} onChange={e => change("level", e.target.value as CourseDefaultValues["level"])}>
            <option value="BEGINNER">Base</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzato</option>
          </Select>
        </div>

        <div className="flex items-center gap-6 pt-6">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="featured"
              checked={values.featured} onChange={e => change("featured", e.target.checked)}
              className="size-4 rounded border-border-subtle accent-brand-600"
            />
            In evidenza
          </label>
        </div>
      </div>

      <SubmitButton size="lg">{submitLabel}</SubmitButton>
    </form>
  );
}
