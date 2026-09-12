"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state?.error} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Titolo del corso</Label>
          <Input id="title" name="title" required defaultValue={defaultValues?.title} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="subtitle">Sottotitolo</Label>
          <Input
            id="subtitle"
            name="subtitle"
            placeholder="Una frase che spiega il corso"
            defaultValue={defaultValues?.subtitle ?? ""}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Descrizione</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={6}
            defaultValue={defaultValues?.description}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="imageUrl">URL immagine di copertina</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://..."
            defaultValue={defaultValues?.imageUrl ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="price">Prezzo (EUR)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="1"
            required
            defaultValue={
              defaultValues ? (defaultValues.priceCents / 100).toFixed(2) : "297"
            }
          />
          <p className="mt-1 text-xs text-foreground/50">Prezzo minimo 1€ — la piattaforma non prevede corsi gratuiti.</p>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            placeholder="es. Sviluppo Web"
            defaultValue={defaultValues?.category ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="level">Livello</Label>
          <Select id="level" name="level" defaultValue={defaultValues?.level ?? "BEGINNER"}>
            <option value="BEGINNER">Base</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzato</option>
          </Select>
        </div>

        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="published"
              defaultChecked={defaultValues?.published}
              className="size-4 rounded border-border-subtle accent-brand-600"
            />
            Pubblicato
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={defaultValues?.featured}
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
