"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormError } from "@/components/ui/form-error";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <FormError message={state?.error} />

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="tu@esempio.it" required />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </div>

      <SubmitButton className="w-full" size="lg" pendingLabel="Accesso...">
        Accedi
      </SubmitButton>

      <p className="text-center text-sm text-foreground/60">
        Non hai un account?{" "}
        <Link href="/registrati" className="font-medium text-brand-400 hover:underline">
          Registrati
        </Link>
      </p>
    </form>
  );
}
