"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="size-8" />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-medium">Qualcosa è andato storto</h1>
      <p className="mt-3 max-w-sm text-foreground/60">
        Si è verificato un errore imprevisto. Riprova, oppure torna alla home.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} variant="outline">
          Riprova
        </Button>
        <Button href="/">Torna alla home</Button>
      </div>
    </div>
  );
}
