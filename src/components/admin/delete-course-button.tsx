"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCourse } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";

export function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Eliminare definitivamente "${title}"? Questa azione non si può annullare.`)) {
          return;
        }
        startTransition(async () => {
          try {
            await deleteCourse(id);
            toast.success("Corso eliminato");
            router.push("/admin/corsi");
          } catch {
            toast.error("Impossibile eliminare il corso");
          }
        });
      }}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      Elimina corso
    </Button>
  );
}
