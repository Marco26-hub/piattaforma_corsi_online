import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non autorizzato");
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, approved: true } });
  if (user?.role !== "ADMIN" || !user.approved) throw new Error("Non autorizzato");
  return session;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Devi effettuare l'accesso");
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { approved: true } });
  if (!user?.approved) {
    throw new Error("Accesso non ancora approvato");
  }
  return session;
}
