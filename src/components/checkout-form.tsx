"use client";

import { useActionState } from "react";
import { checkoutWithSupport } from "@/app/actions/checkout";
import { SubmitButton } from "@/components/ui/submit-button";
import PaymentSupport from "@/components/payment-support";

export function CheckoutForm({ courseId, free }: { courseId: string; free: boolean }) {
  const [state, action] = useActionState(checkoutWithSupport.bind(null, courseId), null);
  return <form action={action}>
    <SubmitButton className="w-full" size="lg" pendingLabel="Reindirizzamento...">
      {free ? "Iscriviti gratis" : "Acquista ora"}
    </SubmitButton>
    {state?.error && <div role="alert"><p>{state.error}</p><PaymentSupport /></div>}
  </form>;
}
