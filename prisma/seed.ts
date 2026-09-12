import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin pronto: ${adminEmail}`);

  const webDevCourse = await prisma.course.upsert({
    where: { slug: "sviluppo-web-da-zero" },
    update: {},
    create: {
      slug: "sviluppo-web-da-zero",
      title: "Sviluppo Web da Zero",
      subtitle: "HTML, CSS e JavaScript per costruire il tuo primo sito",
      description:
        "Un percorso pratico per imparare le basi dello sviluppo web moderno: struttura le pagine con HTML, disegnale con CSS e rendile interattive con JavaScript. Alla fine del corso saprai costruire e pubblicare un sito completo.",
      priceCents: 49700,
      level: "BEGINNER",
      category: "Sviluppo Web",
      published: true,
      featured: true,
      imageUrl: null,
      modules: {
        create: [
          {
            title: "Introduzione",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Benvenuto al corso",
                  order: 0,
                  type: "TEXT",
                  isFreePreview: true,
                  durationMin: 3,
                  content:
                    "Benvenuto! In questo corso imparerai le basi dello sviluppo web partendo da zero, un passo alla volta.",
                },
                {
                  title: "Come impostare l'ambiente di lavoro",
                  order: 1,
                  type: "VIDEO",
                  isFreePreview: true,
                  durationMin: 8,
                  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                },
              ],
            },
          },
          {
            title: "HTML e CSS",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Struttura di una pagina HTML",
                  order: 0,
                  type: "VIDEO",
                  durationMin: 12,
                  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                },
                {
                  title: "Stili e layout con CSS",
                  order: 1,
                  type: "VIDEO",
                  durationMin: 15,
                  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const businessCourse = await prisma.course.upsert({
    where: { slug: "avviare-un-business-online" },
    update: {},
    create: {
      slug: "avviare-un-business-online",
      title: "Avviare un Business Online",
      subtitle: "Dalla validazione dell'idea al primo cliente pagante",
      description:
        "Una guida pratica per validare un'idea di business, costruire un'offerta chiara e trovare i primi clienti online, senza budget di marketing enormi.",
      priceCents: 89700,
      level: "INTERMEDIATE",
      category: "Business",
      published: true,
      featured: true,
      imageUrl: null,
      modules: {
        create: [
          {
            title: "Validare l'idea",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Perché la maggior parte delle idee fallisce",
                  order: 0,
                  type: "TEXT",
                  isFreePreview: true,
                  durationMin: 5,
                  content:
                    "La maggior parte delle idee di business fallisce non per mancanza di esecuzione, ma perché risolvono un problema che nessuno ha davvero.",
                },
              ],
            },
          },
          {
            title: "I primi clienti",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Trovare i primi 10 clienti",
                  order: 0,
                  type: "VIDEO",
                  durationMin: 18,
                  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Corsi pronti: ${webDevCourse.title}, ${businessCourse.title}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
