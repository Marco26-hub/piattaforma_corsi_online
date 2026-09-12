import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    if (courseId && userId) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {
          stripeSessionId: session.id,
          amountPaidCents: session.amount_total ?? 0,
        },
        create: {
          userId,
          courseId,
          amountPaidCents: session.amount_total ?? 0,
          stripeSessionId: session.id,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
