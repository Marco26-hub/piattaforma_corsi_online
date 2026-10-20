"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { revokeCourseEnrollment } from "@/lib/enrollment-store";

export async function setUserRole(userId: string, role: "ADMIN" | "CUSTOMER") {
  const session = await requireAdmin();

  if (session.user.id === userId) {
    throw new Error("Non puoi modificare il tuo stesso ruolo");
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/utenti");
}

export async function setUserApproval(userId: string, approved: boolean) {
  const session = await requireAdmin();

  if (session.user.id === userId && !approved) {
    throw new Error("Non puoi revocare il tuo stesso accesso");
  }

  await prisma.user.update({ where: { id: userId }, data: { approved } });
  revalidatePath("/admin/utenti");
}

/**
 * Revoca l'accesso di un utente a un corso (rimborso manuale, recesso entro 14
 * giorni, acquisto contestato). I progressi restano, cosi' se l'accesso viene
 * ridato l'utente ritrova il punto in cui era.
 */
export async function revokeEnrollment(userId: string, courseId: string, enrollmentId: string) {
  await requireAdmin();
  await revokeCourseEnrollment(userId, courseId, enrollmentId);
  revalidatePath("/admin/utenti");
  revalidatePath("/admin");
}
