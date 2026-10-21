import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCourse } from "@/app/actions/courses";
import { CourseForm } from "@/components/admin/course-form";
import styles from "@/styles/course-management.module.css";

export const metadata = { title: "Nuovo corso" };

export default function NewCoursePage() {
  return (
    <div className={`${styles.workspace} mx-auto max-w-3xl space-y-6`}>
      <Link
        href="/admin/corsi"
        className="inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Corsi
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Nuovo corso</h1>
      </div>

      <section className="border-y border-border-subtle py-6"><CourseForm action={createCourse} submitLabel="Crea bozza" /></section>
    </div>
  );
}
