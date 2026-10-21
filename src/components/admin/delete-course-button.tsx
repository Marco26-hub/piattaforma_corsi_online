"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Archive } from "lucide-react";
import { toast } from "sonner";
import { archiveCourse } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";

export function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Archiviare "${title}"? Il corso non sara nel catalogo, ma gli iscritti manterranno il loro accesso.`)) {
          return;
        }
        startTransition(async () => {
          try {
            await archiveCourse(id, true);
            toast.success("Corso archiviato");
            router.push("/admin/corsi");
          } catch {
            toast.error("Impossibile archiviare il corso");
          }
        });
      }}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
      Archivia corso
    </Button>
  );
}
