import { FileText } from "lucide-react";

type Lesson = {
  type: "VIDEO" | "TEXT";
  videoUrl: string | null;
  content: string | null;
  title: string;
};

const DIRECT_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

export function LessonContent({ lesson }: { lesson: Lesson }) {
  if (lesson.type === "VIDEO" && lesson.videoUrl) {
    const isDirectFile = DIRECT_VIDEO_EXTENSIONS.some((ext) =>
      lesson.videoUrl!.toLowerCase().includes(ext)
    );

    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {isDirectFile ? (
          <video controls className="size-full" src={lesson.videoUrl} />
        ) : (
          <iframe
            src={lesson.videoUrl}
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
