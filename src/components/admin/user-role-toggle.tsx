"use client";

import { useTransition } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { setUserRole } from "@/app/actions/users";

export function UserRoleToggle({
  userId,
  role,
}: {
  userId: string;
  role: "ADMIN" | "CUSTOMER";
}) {
  const [isPending, startTransition] = useTransition();
  const nextRole = role === "ADMIN" ? "CUSTOMER" : "ADMIN";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await setUserRole(userId, nextRole);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Operazione non riuscita");
          }
        })
      }
      className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium hover:bg-surface-muted disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : role === "ADMIN" ? (
        <ShieldOff className="size-3.5" />
      ) : (
        <ShieldCheck className="size-3.5" />
      )}
      {role === "ADMIN" ? "Rendi cliente" : "Rendi admin"}
    </button>
  );
}
