"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/ui/form-error";
import { CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />
      {state?.success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{state.success}</span>
        </div>
      )}

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" placeholder="Mario Rossi" required />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="tu@esempio.it" required />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Minimo 8 caratteri" required />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Conferma password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>

      <SubmitButton className="w-full" size="lg" pendingLabel="Invio richiesta...">
        Richiedi accesso
      </SubmitButton>

      <p className="text-center text-sm text-foreground/60">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-brand-400 hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
