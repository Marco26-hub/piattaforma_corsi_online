"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/ui/form-error";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state?.error} />

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

      <SubmitButton className="w-full" size="lg" pendingLabel="Creazione account...">
        Crea account
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
