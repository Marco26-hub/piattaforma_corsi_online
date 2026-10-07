import type Stripe from "stripe";

type CoursePayment = Pick<Stripe.Checkout.Session, "mode" | "status" | "payment_status" | "metadata" | "amount_total">;

export function isCompletedCoursePayment(
  session: CoursePayment,
  expected?: { userId: string; courseId: string },
) {
  return session.mode === "payment" && session.status === "complete" &&
    (session.payment_status === "paid" || session.payment_status === "no_payment_required") &&
    typeof session.metadata?.userId === "string" && !!session.metadata.userId &&
    typeof session.metadata?.courseId === "string" && !!session.metadata.courseId &&
    typeof session.amount_total === "number" && session.amount_total >= 0 &&
    (!expected || (session.metadata.userId === expected.userId && session.metadata.courseId === expected.courseId));
}
