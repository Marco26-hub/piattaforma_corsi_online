import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const FREE_ENROLLMENT = "free";

async function withEnrollmentLock<T>(userId: string, courseId: string, action: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    // Checkout, refunds and manual revocations must serialize for the same access.
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${JSON.stringify(["academy", userId, courseId])}, 0))`;
    return action(tx);
  });
}

export async function savePaidEnrollment(userId: string, courseId: string, checkoutSessionId: string, amountPaidCents: number) {
  return withEnrollmentLock(userId, courseId, async (tx) => {
    const revoked = await tx.enrollmentRevocation.findUnique({
      where: { userId_courseId_checkoutSessionId: { userId, courseId, checkoutSessionId } },
    });
    if (revoked) return null;
    const existing = await tx.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (existing) {
      if (existing.stripeSessionId !== checkoutSessionId) {
        await tx.enrollmentRevocation.create({ data: { userId, courseId, checkoutSessionId, reason: "duplicate" } });
        console.error("[stripe] Pagamento duplicato da verificare e rimborsare", { userId, courseId, checkoutSessionId });
        return null;
      }
      return existing;
    }
    return tx.enrollment.create({ data: { userId, courseId, stripeSessionId: checkoutSessionId, amountPaidCents } });
  });
}

export async function saveFreeEnrollment(userId: string, courseId: string) {
  return withEnrollmentLock(userId, courseId, async (tx) => {
    const revoked = await tx.enrollmentRevocation.findUnique({
      where: { userId_courseId_checkoutSessionId: { userId, courseId, checkoutSessionId: FREE_ENROLLMENT } },
    });
    if (revoked) return null;
    return tx.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } }, update: {},
      create: { userId, courseId, amountPaidCents: 0 },
    });
  });
}

export async function revokeCheckoutEnrollment(userId: string, courseId: string, checkoutSessionId: string, reason: "refund") {
  return withEnrollmentLock(userId, courseId, async (tx) => {
    await tx.enrollmentRevocation.upsert({
      where: { userId_courseId_checkoutSessionId: { userId, courseId, checkoutSessionId } },
      update: {}, create: { userId, courseId, checkoutSessionId, reason },
    });
    return tx.enrollment.deleteMany({ where: { userId, courseId, stripeSessionId: checkoutSessionId } });
  });
}

export async function revokeCourseEnrollment(userId: string, courseId: string, enrollmentId: string) {
  return withEnrollmentLock(userId, courseId, async (tx) => {
    const existing = await tx.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (!existing) return;
    if (existing.id !== enrollmentId) throw new Error("Iscrizione cambiata: ricarica la pagina prima di revocare");
    const checkoutSessionId = existing.stripeSessionId ?? FREE_ENROLLMENT;
    await tx.enrollmentRevocation.upsert({
      where: { userId_courseId_checkoutSessionId: { userId, courseId, checkoutSessionId } },
      update: {}, create: { userId, courseId, checkoutSessionId, reason: "manual" },
    });
    await tx.enrollment.delete({ where: { id: existing.id } });
  });
}
