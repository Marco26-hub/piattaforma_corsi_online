import { z } from "zod";

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
  title: z.string().min(3, "Titolo troppo corto"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Descrizione troppo corta"),
  imageUrl: z.union([z.url("URL immagine non valido"), z.literal("")]).optional(),
  price: z.coerce
    .number()
    .min(1, "I corsi sono a pagamento: il prezzo minimo è 1 euro"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.string().optional(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
});

export const moduleSchema = z.object({
  title: z.string().min(2, "Titolo troppo corto"),
  courseId: z.string().min(1),
});

export const lessonSchema = z.object({
  title: z.string().min(2, "Titolo troppo corto"),
  moduleId: z.string().min(1),
  type: z.enum(["VIDEO", "TEXT"]),
  videoUrl: z.union([z.url("URL video non valido"), z.literal("")]).optional(),
  content: z.string().optional(),
  durationMin: z.coerce.number().int().min(0).optional(),
  isFreePreview: z.coerce.boolean().optional(),
});
