import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Layers,
  PlayCircle,
  Smartphone,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/site/course-card";

async function getHomeData() {
  const [courses, publishedCount, studentsCount] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.course.count({ where: { published: true } }),
    prisma.enrollment.count(),
  ]);
  return { courses, publishedCount, studentsCount };
}

const STEPS = [
  {
    icon: PlayCircle,
    title: "Scegli il corso giusto",
    description:
      "Sfoglia il catalogo, guarda l'anteprima gratuita delle prime lezioni e scegli il percorso adatto a te.",
  },
  {
    icon: CreditCard,
    title: "Acquista in sicurezza",
    description:
      "Pagamento protetto con Stripe: carta di credito, accesso immediato, nessun abbonamento nascosto.",
  },
  {
    icon: BarChart3,
    title: "Impara e traccia i progressi",
    description:
      "Guarda le lezioni quando vuoi, da smartphone o desktop, e segna il tuo avanzamento modulo per modulo.",
  },
];

const FEATURES = [
  {
    icon: Smartphone,
    title: "Mobile-first",
    description: "Esperienza pensata prima per lo smartphone: veloce, fluida, sempre a portata di mano.",
  },
  {
    icon: BadgeCheck,
    title: "Accesso a vita",
    description: "Acquisti un corso una sola volta e lo riguardi quando vuoi, senza scadenze.",
  },
  {
    icon: CreditCard,
    title: "Pagamenti sicuri",
    description: "Checkout gestito da Stripe: i tuoi dati di pagamento non passano mai dai nostri server.",
  },
  {
    icon: BarChart3,
    title: "Progressi tracciati",
    description: "Vedi sempre a che punto sei: lezioni completate, moduli finiti, percentuale del corso.",
  },
];

const TESTIMONIALS = [
  {
    name: "Giulia R.",
    role: "Frontend Developer",
    quote:
      "Ho finito il corso in due settimane guardando le lezioni sul telefono durante i trasporti. Struttura chiarissima.",
  },
  {
    name: "Marco T.",
    role: "Freelance",
    quote:
      "Acquisto fatto in un minuto, accesso immediato. Esattamente quello che serve quando vuoi imparare senza frizioni.",
  },
  {
    name: "Sara L.",
    role: "Product Designer",
    quote:
      "Mi piace poter vedere la percentuale di completamento: mi tiene motivata a finire quello che inizio.",
  },
];

export default async function HomePage() {
  const { courses, publishedCount, studentsCount } = await getHomeData();

  return (
    <>
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="container-app">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center animate-fade-up">
            <span className="mb-6 inline-flex items-center gap-2 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-300">
              <Layers className="size-4" />
              Piattaforma corsi online
            </span>

            <h1 className="font-serif text-4xl font-medium leading-tight sm:text-5xl md:text-6xl">
              Impara competenze che contano, al tuo ritmo
            </h1>
            <span className="accent-rule mt-6" />

            <p className="mt-6 max-w-xl text-balance text-lg text-foreground/65">
              Corsi video pratici, acquisto immediato e sicuro, progressi sempre
              sotto controllo. Da smartphone o desktop, ovunque tu sia.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button href="/corsi" size="lg" className="w-full sm:w-auto">
                Esplora i corsi
                <ArrowRight className="size-4" />
              </Button>
              <Button href="/registrati" variant="outline" size="lg" className="w-full sm:w-auto">
                Crea un account gratis
              </Button>
            </div>

            <div className="mt-12 grid w-full grid-cols-3 gap-4 rounded-xl border border-border-subtle bg-surface p-6">
              <div>
                <p className="text-2xl font-bold sm:text-3xl">{publishedCount}+</p>
                <p className="mt-1 text-xs text-foreground/60 sm:text-sm">Corsi disponibili</p>
              </div>
              <div>
                <p className="text-2xl font-bold sm:text-3xl">{studentsCount}+</p>
                <p className="mt-1 text-xs text-foreground/60 sm:text-sm">Iscrizioni attive</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-2xl font-bold sm:text-3xl">
                  4.9 <Star className="size-5 fill-accent-400 text-accent-400" />
                </p>
                <p className="mt-1 text-xs text-foreground/60 sm:text-sm">Valutazione media</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-app">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-medium sm:text-3xl">Corsi in evidenza</h2>
                <p className="mt-2 text-foreground/60">
                  I percorsi più scelti dalla community in questo momento.
                </p>
              </div>
              <Button href="/corsi" variant="ghost" className="self-start sm:self-auto">
                Vedi tutti i corsi
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="come-funziona" className="bg-surface-muted py-16 md:py-24">
        <div className="container-app">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">Come funziona</h2>
            <p className="mt-3 text-foreground/60">
              Tre passaggi tra te e la tua prossima competenza.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative rounded-xl border border-border-subtle bg-surface p-8">
                <span className="absolute -top-4 left-8 flex size-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <step.icon className="mb-4 size-8 text-brand-400" />
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-foreground/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-app">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Tutto quello che serve per imparare bene
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border-subtle p-6 transition-colors hover:border-border-strong"
              >
                <span className="flex size-11 items-center justify-center rounded-md bg-brand-900/50 text-brand-300">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recensioni" className="bg-surface-muted py-16 md:py-24">
        <div className="container-app">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">Chi impara con noi</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="rounded-xl border border-border-subtle bg-surface p-6">
                <div className="mb-3 flex gap-0.5 text-accent-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground/70">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-brand-600 text-sm font-semibold text-white">
                    {testimonial.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-foreground/50">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-brand-900/40 px-6 py-16 text-center sm:px-12">
            <h2 className="font-serif text-3xl font-medium sm:text-4xl">
              Pronto a fare il prossimo passo?
            </h2>
            <span className="accent-rule mx-auto mt-4" />
            <p className="mx-auto mt-4 max-w-xl text-foreground/70">
              Crea un account gratuito, scegli il tuo corso e inizia subito ad
              imparare.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/registrati" size="lg" className="w-full sm:w-auto">
                Registrati gratis
              </Button>
              <Link
                href="/corsi"
                className="text-sm font-medium text-foreground/70 underline-offset-4 hover:underline"
              >
                Oppure guarda prima i corsi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
