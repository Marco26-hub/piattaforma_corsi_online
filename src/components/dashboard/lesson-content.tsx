import { FileText } from "lucide-react";
import { normalizeLessonVideoUrl, isDirectLessonVideo } from "@/lib/lesson-media";

type Lesson = {
  type: "VIDEO" | "TEXT";
  videoUrl: string | null;
  content: string | null;
  title: string;
};

export function LessonContent({ lesson }: { lesson: Lesson }) {
  const videoUrl = lesson.type === "VIDEO" ? normalizeLessonVideoUrl(lesson.videoUrl || "") : null;
  if (videoUrl) {
    const isDirectFile = isDirectLessonVideo(videoUrl);

    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {isDirectFile ? (
          <video controls className="size-full" src={videoUrl} />
        ) : (
          <iframe
            src={videoUrl}
            title={lesson.title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  if (lesson.content) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground/50">
          <FileText className="size-4" /> Lezione di testo
        </div>
        <div className="mt-4 whitespace-pre-line leading-relaxed text-foreground/80">
          {lesson.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border-subtle text-sm text-foreground/50">
      Contenuto non ancora disponibile per questa lezione.
    </div>
  );
}
