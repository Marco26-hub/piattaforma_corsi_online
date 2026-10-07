"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/guards";
import { enrollPaidCourse } from "@/lib/enrollments";
import { isCompletedCoursePayment } from "@/lib/checkout-session";

export async function checkoutWithSupport(courseId: string, _previousState: { error: string } | null) {
  void _previousState;
  try {
    await startCheckout(courseId);
    return null;
  } catch (error) {
    unstable_rethrow(error);
    console.error('[Academy checkout] unable to start payment');
    return { error: 'Non è stato possibile completare la richiesta di acquisto. Se l’addebito è incerto, contatta SWA prima di ripagare.' };
  }
}

export async function startCheckout(courseId: string) {
  const session = await requireUser();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    throw new Error("Corso non disponibile");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    redirect(`/dashboard/corsi/${course.slug}`);
  }

  if (course.priceCents === 0) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: {},
      create: { userId: session.user.id, courseId, amountPaidCents: 0 },
    });
    redirect(`/dashboard/corsi/${course.slug}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("URL pubblico non configurato");
  const hasValidImage = course.imageUrl?.startsWith("http");

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    locale: "it",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: course.currency,
          unit_amount: course.priceCents,
          product_data: {
            name: course.title,
            description: course.subtitle ?? undefined,
            images: hasValidImage ? [course.imageUrl!] : undefined,
          },
        },
      },
    ],
    allow_promotion_codes: true,
    success_url: `${appUrl}/academy/dashboard/corsi/${course.slug}?acquisto=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/corsi/${course.slug}?acquisto=annullato`,
    customer_email: session.user.email ?? undefined,
    metadata: { courseId: course.id, userId: session.user.id },
  });

  if (!checkoutSession.url) {
    throw new Error("Impossibile creare la sessione di pagamento");
  }

  redirect(checkoutSession.url);
}

/**
 * Il webhook Stripe crea l'iscrizione in modo asincrono: se l'utente atterra sulla
 * pagina del corso prima che il webhook sia arrivato, verifichiamo qui la sessione
 * e creiamo l'iscrizione in modo idempotente, così l'accesso è immediato.
 */
export async function confirmCheckoutSession(sessionId: string, courseId: string) {
  const session = await requireUser();
  const userId = session.user.id;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_") || typeof courseId !== "string") return null;
  let checkoutSession;
  try {
    checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }

  if (!isCompletedCoursePayment(checkoutSession, { userId, courseId })) return null;
  return enrollPaidCourse(checkoutSession);
}
