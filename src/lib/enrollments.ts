import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { isCompletedCoursePayment } from "@/lib/checkout-session";
import { getStripe } from "@/lib/stripe";
import { revokeCheckoutEnrollment, savePaidEnrollment } from "@/lib/enrollment-store";

type CourseCheckout = Pick<Stripe.Checkout.Session,
  "id" | "mode" | "status" | "payment_status" | "metadata" | "amount_total" | "currency" | "payment_intent">;

export async function enrollPaidCourse(checkout: CourseCheckout) {
  if (!isCompletedCoursePayment(checkout)) return null;
  const userId = checkout.metadata!.userId;
  const courseId = checkout.metadata!.courseId;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { currency: true } });
  if (!course || course.currency.toLowerCase() !== checkout.currency?.toLowerCase()) {
    throw new Error("Corso o valuta del pagamento non validi");
  }
  if (checkout.amount_total! > 0) {
    const intentId = typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
    if (!intentId) throw new Error("Riferimento al pagamento mancante");
    const intent = await getStripe().paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
    const charge = typeof intent.latest_charge === "string"
      ? await getStripe().charges.retrieve(intent.latest_charge) : intent.latest_charge;
    if (intent.status !== "succeeded" || !charge?.paid) throw new Error("Pagamento non confermato");
    // Checkout remains paid after a refund; check the current charge as well.
    if (charge.amount_refunded > 0) {
      await revokeCheckoutEnrollment(userId, courseId, checkout.id, "refund");
      return null;
    }
  }
  return savePaidEnrollment(userId, courseId, checkout.id, checkout.amount_total!);
}
