"use client";

import { useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { setUserApproval } from "@/app/actions/users";

export function UserApprovalToggle({ userId, approved }: { userId: string; approved: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        try {
          await setUserApproval(userId, !approved);
          toast.success(approved ? "Accesso revocato" : "Accesso approvato");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Operazione non riuscita");
        }
      })}
      className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium hover:bg-surface-muted disabled:opacity-50"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : approved ? <X className="size-3.5" /> : <Check className="size-3.5" />}
      {approved ? "Revoca accesso" : "Approva accesso"}
    </button>
  );
}
