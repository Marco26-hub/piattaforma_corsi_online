import { after, afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { getStripe } from "../src/lib/stripe";
import { enrollPaidCourse } from "../src/lib/enrollments";
import { revokeCheckoutEnrollment, revokeCourseEnrollment, saveFreeEnrollment, savePaidEnrollment } from "../src/lib/enrollment-store";
import { POST } from "../src/app/api/webhooks/stripe/route";

const database = new URL(process.env.DATABASE_URL ?? "http://missing");
if (!['localhost', '127.0.0.1'].includes(database.hostname) || !database.pathname.endsWith('_test')) {
  throw new Error("Integration tests require an explicit local database ending in _test");
}
process.env.STRIPE_SECRET_KEY = "sk_test_local_fixture_only";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_local_fixture_only";

let userId: string;
let courseId: string;
const sessionA = "cs_test_original";
const sessionB = "cs_test_duplicate";
const current = () => prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
const paid = (id = sessionA) => ({
  id, mode: "payment", status: "complete", payment_status: "paid", amount_total: 4900,
  currency: "eur", payment_intent: "pi_test_original", metadata: { userId, courseId },
} as const);

function mockCharge(amountRefunded = 0) {
  return mock.method(getStripe().paymentIntents, "retrieve", async () => ({
    id: "pi_test_original", status: "succeeded",
    latest_charge: { id: "ch_test_original", paid: true, amount_refunded: amountRefunded },
  }));
}

async function webhook(type: string, object: object, invalid = false) {
  const payload = JSON.stringify({ id: `evt_${randomUUID()}`, type, data: { object } });
  const signature = getStripe().webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET! });
  return POST(new Request("http://localhost/academy/api/webhooks/stripe", {
    method: "POST", body: payload, headers: { "stripe-signature": invalid ? "invalid" : signature },
  }));
}

beforeEach(async () => {
  const id = randomUUID();
  const user = await prisma.user.create({ data: { email: `test-${id}@example.invalid`, passwordHash: "not-a-real-password" } });
  const course = await prisma.course.create({ data: { slug: `test-${id}`, title: "Test course", description: "Local fixture", priceCents: 4900, published: true } });
  userId = user.id;
  courseId = course.id;
});
afterEach(async () => {
  mock.restoreAll();
  await prisma.enrollmentRevocation.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.course.delete({ where: { id: courseId } });
});
after(() => prisma.$disconnect());

test("replaying the same paid checkout creates exactly one enrollment", async () => {
  mockCharge();
  const first = await enrollPaidCourse(paid());
  const second = await enrollPaidCourse(paid());
  assert.equal(first?.id, second?.id);
  assert.equal(await prisma.enrollment.count({ where: { userId } }), 1);
});

test("refunding a duplicate leaves the original paid access untouched", async () => {
  const original = await savePaidEnrollment(userId, courseId, sessionA, 4900);
  assert.equal(await savePaidEnrollment(userId, courseId, sessionB, 4900), null);
  mock.method(getStripe().checkout.sessions, "list", async () => ({ data: [paid(sessionB)] }));
  assert.equal((await webhook("charge.refunded", { payment_intent: "pi_test_duplicate" })).status, 200);
  assert.equal((await current())?.id, original?.id);
  assert.equal((await current())?.stripeSessionId, sessionA);
});

test("manual revocation survives reopening the same paid checkout", async () => {
  mockCharge();
  const original = await enrollPaidCourse(paid());
  await revokeCourseEnrollment(userId, courseId, original!.id);
  assert.equal(await enrollPaidCourse(paid()), null);
  assert.equal(await current(), null);
});

test("refund delivered before checkout completion blocks later grant", async () => {
  await revokeCheckoutEnrollment(userId, courseId, sessionA, "refund");
  assert.equal(await savePaidEnrollment(userId, courseId, sessionA, 4900), null);
  assert.equal(await current(), null);
});

test("a fresh purchase remains possible after revocation, old refunds cannot delete it", async () => {
  const old = await savePaidEnrollment(userId, courseId, sessionA, 4900);
  await revokeCourseEnrollment(userId, courseId, old!.id);
  const fresh = await savePaidEnrollment(userId, courseId, sessionB, 4900);
  await revokeCheckoutEnrollment(userId, courseId, sessionA, "refund");
  assert.equal((await current())?.id, fresh?.id);
});

test("a duplicate receipt cannot become valid after the original is revoked", async () => {
  const old = await savePaidEnrollment(userId, courseId, sessionA, 4900);
  await savePaidEnrollment(userId, courseId, sessionB, 4900);
  await revokeCourseEnrollment(userId, courseId, old!.id);
  assert.equal(await savePaidEnrollment(userId, courseId, sessionB, 4900), null);
});

test("concurrent grants are idempotent at the database boundary", async () => {
  const results = await Promise.all(Array.from({ length: 8 }, () => savePaidEnrollment(userId, courseId, sessionA, 4900)));
  assert.equal(new Set(results.map(row => row?.id)).size, 1);
  assert.equal(await prisma.enrollment.count({ where: { userId } }), 1);
});

test("concurrent grant and refund always end with revoked access", async () => {
  await Promise.all([
    savePaidEnrollment(userId, courseId, sessionA, 4900),
    revokeCheckoutEnrollment(userId, courseId, sessionA, "refund"),
    savePaidEnrollment(userId, courseId, sessionA, 4900),
  ]);
  assert.equal(await current(), null);
});

test("revoked free access is not automatically recreated", async () => {
  const free = await saveFreeEnrollment(userId, courseId);
  await revokeCourseEnrollment(userId, courseId, free!.id);
  assert.equal(await saveFreeEnrollment(userId, courseId), null);
});

test("stale admin action cannot revoke a different new enrollment", async () => {
  const old = await savePaidEnrollment(userId, courseId, sessionA, 4900);
  await revokeCourseEnrollment(userId, courseId, old!.id);
  const fresh = await savePaidEnrollment(userId, courseId, sessionB, 4900);
  await assert.rejects(revokeCourseEnrollment(userId, courseId, old!.id), /Iscrizione cambiata/);
  assert.equal((await current())?.id, fresh?.id);
});

test("a refunded charge blocks access even before the refund webhook arrives", async () => {
  mockCharge(4900);
  assert.equal(await enrollPaidCourse(paid()), null);
  assert.equal(await current(), null);
});

test("partial refunds retain the existing revoke-on-refund policy", async () => {
  mockCharge(1000);
  assert.equal(await enrollPaidCourse(paid()), null);
});

test("invalid signatures cannot mutate enrollments", async () => {
  assert.equal((await webhook("checkout.session.completed", paid(), true)).status, 400);
  assert.equal(await current(), null);
});

test("Stripe lookup failure returns retryable error without granting access", async () => {
  mock.method(getStripe().paymentIntents, "retrieve", async () => { throw new Error("Simulated Stripe outage"); });
  assert.equal((await webhook("checkout.session.completed", paid())).status, 500);
  assert.equal(await current(), null);
});

test("signed completion and repeated refund events remain idempotent", async () => {
  mockCharge();
  mock.method(getStripe().checkout.sessions, "list", async () => ({ data: [paid()] }));
  assert.equal((await webhook("checkout.session.async_payment_succeeded", paid())).status, 200);
  assert.ok(await current());
  assert.equal((await webhook("charge.refunded", { payment_intent: "pi_test_original" })).status, 200);
  assert.equal((await webhook("charge.refunded", { payment_intent: "pi_test_original" })).status, 200);
  assert.equal((await webhook("checkout.session.completed", paid())).status, 200);
  assert.equal(await current(), null);
});

test("revocation preserves lesson progress", async () => {
  const courseModule = await prisma.module.create({ data: { courseId, title: "Module" } });
  const lesson = await prisma.lesson.create({ data: { moduleId: courseModule.id, title: "Lesson" } });
  await prisma.progress.create({ data: { userId, lessonId: lesson.id, completed: true } });
  const enrollment = await savePaidEnrollment(userId, courseId, sessionA, 4900);
  await revokeCourseEnrollment(userId, courseId, enrollment!.id);
  assert.equal(await prisma.progress.count({ where: { userId } }), 1);
});
