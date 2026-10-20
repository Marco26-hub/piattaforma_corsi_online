"use client";

import { useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function DeleteIconButton({
  confirmMessage,
  action,
  label = "Elimina",
}: {
  confirmMessage: string;
  action: () => Promise<void>;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await action();
          } catch {
            toast.error("Operazione non riuscita");
          }
        });
      }}
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
    </button>
  );
}
