import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-md bg-brand-900/50 text-brand-300">
        <Compass className="size-8" />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-medium">Pagina non trovata</h1>
      <p className="mt-3 max-w-sm text-foreground/60">
        La pagina che cerchi non esiste più o è stata spostata.
      </p>
      <Button href="/" className="mt-8">
        Torna alla home
      </Button>
    </div>
  );
}
