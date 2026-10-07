"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

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
