"use client";

import { useActionState } from "react";
import { checkoutWithSupport } from "@/app/actions/checkout";
import { SubmitButton } from "@/components/ui/submit-button";
import PaymentSupport from "@/components/payment-support";
import { LEGAL_LINKS } from "@/lib/legal";

export function CheckoutForm({ courseId, free }: { courseId: string; free: boolean }) {
  const [state, action] = useActionState(checkoutWithSupport.bind(null, courseId), null);
  return <form action={action}>
    <label className="mb-3 flex items-start gap-2 text-xs text-foreground/60">
      <input type="checkbox" name="consenso" required className="mt-0.5 size-4 shrink-0 accent-brand-600" />
      <span>
        Accetto i <a href={LEGAL_LINKS.termini} target="_blank" rel="noreferrer" className="underline">termini</a>
        {!free && <> e chiedo l&apos;accesso immediato al corso, rinunciando al <a href={LEGAL_LINKS.recesso} target="_blank" rel="noreferrer" className="underline">diritto di recesso</a> sul contenuto digitale gia&apos; fruito</>}.
      </span>
    </label>
    <SubmitButton className="w-full" size="lg" pendingLabel="Reindirizzamento...">
      {free ? "Iscriviti gratis" : "Acquista ora"}
    </SubmitButton>
    {state?.error && <div role="alert"><p>{state.error}</p><PaymentSupport /></div>}
  </form>;
}
