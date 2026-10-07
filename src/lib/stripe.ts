import Stripe from "stripe";

let client: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY mancante nelle variabili d'ambiente");
  client ??= new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" });
  return client;
}
