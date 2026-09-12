"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/guards";

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const hasValidImage = course.imageUrl?.startsWith("http");

  const checkoutSession = await stripe.checkout.sessions.create({
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
    success_url: `${appUrl}/dashboard/corsi/${course.slug}?acquisto=ok&session_id={CHECKOUT_SESSION_ID}`,
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
export async function confirmCheckoutSession(sessionId: string, userId: string) {
  let checkoutSession;
  try {
    checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }

  if (checkoutSession.payment_status !== "paid") return null;
  if (checkoutSession.metadata?.userId !== userId) return null;

  const courseId = checkoutSession.metadata?.courseId;
  if (!courseId) return null;

  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: {
      userId,
      courseId,
      amountPaidCents: checkoutSession.amount_total ?? 0,
      stripeSessionId: checkoutSession.id,
    },
  });
}
