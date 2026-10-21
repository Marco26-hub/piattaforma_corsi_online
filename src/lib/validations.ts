import { z } from "zod";
import { normalizeLessonVideoUrl } from "./lesson-media";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Inserisci il tuo nome"),
    email: z.email("Email non valida"),
    password: z.string().min(8, "Minimo 8 caratteri"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Email non valida"),
  password: z.string().min(1, "Inserisci la password"),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Il titolo deve contenere almeno 3 caratteri").max(200, "Titolo troppo lungo"),
  subtitle: z.string().optional(),
  description: z.string().trim().min(10, "La descrizione deve contenere almeno 10 caratteri"),
  imageUrl: z.union([z.url("Collegamento immagine non valido").refine(value => value.startsWith("https://"), "Il collegamento dell'immagine deve iniziare con https://"), z.literal("")]).optional(),
  price: z.coerce
    .number()
    .min(0, "Il prezzo non può essere negativo")
    .multipleOf(0.01, "Il prezzo puo avere al massimo due decimali")
    .max(21474836.47, "Prezzo troppo alto"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.string().optional(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
});

export const moduleSchema = z.object({
  title: z.string().trim().min(2, "Il titolo deve contenere almeno 2 caratteri").max(200, "Titolo troppo lungo"),
  courseId: z.string().min(1),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(2, "Il titolo deve contenere almeno 2 caratteri").max(200, "Titolo troppo lungo"),
  moduleId: z.string().min(1),
  type: z.enum(["VIDEO", "TEXT"]),
  videoUrl: z.union([z.url("Collegamento video non valido"), z.literal("")]).optional(),
  content: z.string().optional(),
  durationMin: z.coerce.number().int("La durata deve essere un numero intero di minuti").min(0).max(10080, "Durata troppo alta").optional(),
  isFreePreview: z.coerce.boolean().optional(),
}).superRefine((lesson, context) => {
  if (lesson.type === "VIDEO" && !normalizeLessonVideoUrl(lesson.videoUrl || "")) {
    context.addIssue({ code: "custom", path: ["videoUrl"], message: "Inserisci un video YouTube, Vimeo o un file video con collegamento https:// valido" });
  }
  if (lesson.type === "TEXT" && !lesson.content?.trim()) {
    context.addIssue({ code: "custom", path: ["content"], message: "Inserisci il testo della lezione" });
  }
});
