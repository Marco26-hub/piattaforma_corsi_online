import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCourse } from "@/app/actions/courses";
import { CourseForm } from "@/components/admin/course-form";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Nuovo corso" };

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/corsi"
        className="inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Corsi
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-medium">Nuovo corso</h1>
        <p className="mt-1 text-foreground/60">
          Compila i dettagli, poi aggiungi moduli e lezioni dalla pagina di modifica.
        </p>
      </div>

      <Card className="p-6">
        <CourseForm action={createCourse} submitLabel="Crea corso" />
      </Card>
    </div>
  );
}
