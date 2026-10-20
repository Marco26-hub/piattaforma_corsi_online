"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/guards";
import { enrollPaidCourse } from "@/lib/enrollments";
import { saveFreeEnrollment } from "@/lib/enrollment-store";
import { isCompletedCoursePayment } from "@/lib/checkout-session";
import { getAppUrl } from "@/lib/app-url";

export async function checkoutWithSupport(
  courseId: string,
  _previousState: { error: string } | null,
  formData: FormData,
) {
  try {
    await startCheckout(courseId, formData);
    return null;
  } catch (error) {
    unstable_rethrow(error);
    console.error('[Academy checkout] unable to start payment');
    return { error: 'Non è stato possibile completare la richiesta di acquisto. Se l’addebito è incerto, contatta SWA prima di ripagare.' };
  }
}

export async function startCheckout(courseId: string, formData: FormData) {
  const session = await requireUser();
  if (typeof courseId !== "string" || !courseId) throw new Error("Corso non valido");
  if (formData.get("consenso") !== "on") throw new Error("Accetta i termini prima di procedere");
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) throw new Error("Corso non disponibile");
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) redirect(`/dashboard/corsi/${course.slug}`);
  if (course.priceCents === 0) {
    const enrollment = await saveFreeEnrollment(session.user.id, courseId);
    if (!enrollment) throw new Error("Accesso revocato: contatta SWA");
    redirect(`/dashboard/corsi/${course.slug}`);
  }
  const appUrl = getAppUrl();
  const hasValidImage = course.imageUrl?.startsWith("https://");
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment", payment_method_types: ["card"], locale: "it",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: course.currency, unit_amount: course.priceCents,
        product_data: {
          name: course.title, description: course.subtitle ?? undefined,
          images: hasValidImage ? [course.imageUrl!] : undefined,
        },
      },
    }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/academy/dashboard/corsi/${course.slug}?acquisto=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/corsi/${course.slug}?acquisto=annullato`,
    customer_email: session.user.email ?? undefined,
    metadata: { courseId: course.id, userId: session.user.id },
  });
  if (!checkoutSession.url) throw new Error("Impossibile creare la sessione di pagamento");
  redirect(checkoutSession.url);
}

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
