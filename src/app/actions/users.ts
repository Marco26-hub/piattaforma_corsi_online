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
