"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";

export type ActionState = { error?: string; success?: string } | undefined;

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const explicitCallbackUrl = formData.get("callbackUrl") as string | null;

  const safeCallbackUrl = explicitCallbackUrl?.startsWith("/") && !explicitCallbackUrl.startsWith("//") && !explicitCallbackUrl.includes("\\")
    ? explicitCallbackUrl : null;
  const targetUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true, approved: true },
  });
  if (targetUser && !targetUser.approved) {
    return { error: "La richiesta di accesso è ancora in attesa di approvazione." };
  }
  let destination = safeCallbackUrl || "/dashboard";
  if (!safeCallbackUrl || safeCallbackUrl === "/dashboard") {
    destination = targetUser?.role === "ADMIN" ? "/admin" : "/dashboard";
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: destination.startsWith("/academy/") ? destination : `/academy${destination}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o password non corrette" };
    }
    throw error;
  }
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi" };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Esiste già un account con questa email" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "CUSTOMER",
      approved: false,
    },
  });

  return { success: "Richiesta inviata. Potrai accedere dopo l’approvazione dell’amministratore." };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/academy/" });
}
