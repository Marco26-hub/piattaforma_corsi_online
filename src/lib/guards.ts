import "server-only";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
  return session;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Devi effettuare l'accesso");
  }
  return session;
}
