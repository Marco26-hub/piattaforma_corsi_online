import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { enrollPaidCourse } from "@/lib/enrollments";
import { revokeCheckoutEnrollment } from "@/lib/enrollment-store";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Webhook non configurato" }, { status: 503 });
  }
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await enrollPaidCourse(event.data.object as Stripe.Checkout.Session);
    }
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string"
        ? charge.payment_intent : charge.payment_intent?.id;
      if (paymentIntentId) {
        const sessions = await getStripe().checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
        const session = sessions.data[0];
        if (session?.metadata?.userId && session.metadata.courseId) {
          await revokeCheckoutEnrollment(session.metadata.userId, session.metadata.courseId, session.id, "refund");
        }
      }
    }
  } catch (error) {
    console.error("[stripe/enrollment]", { eventId: event.id, error });
    return NextResponse.json({ error: "Iscrizione non aggiornata" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
