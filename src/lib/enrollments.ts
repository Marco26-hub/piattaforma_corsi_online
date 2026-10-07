import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { isCompletedCoursePayment } from "@/lib/checkout-session";

export async function enrollPaidCourse(checkout: Stripe.Checkout.Session) {
  if (!isCompletedCoursePayment(checkout)) return null;
  const userId = checkout.metadata!.userId;
  const courseId = checkout.metadata!.courseId;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { currency: true } });
  if (!course || course.currency.toLowerCase() !== checkout.currency?.toLowerCase()) {
    throw new Error("Corso o valuta del pagamento non validi");
  }
  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId, amountPaidCents: checkout.amount_total!, stripeSessionId: checkout.id },
  });
}
