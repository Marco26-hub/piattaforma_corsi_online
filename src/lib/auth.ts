import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/academy/api/auth",
  cookies: {
    sessionToken: { name: "swa-academy.session-token", options: { httpOnly: true, sameSite: "lax", path: "/academy", secure: process.env.NODE_ENV === "production" } },
    csrfToken: { name: "swa-academy.csrf-token", options: { httpOnly: true, sameSite: "lax", path: "/academy", secure: process.env.NODE_ENV === "production" } },
    callbackUrl: { name: "swa-academy.callback-url", options: { sameSite: "lax", path: "/academy", secure: process.env.NODE_ENV === "production" } },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/academy/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        if (!user || !user.approved) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CUSTOMER";
      }
      return session;
    },
  },
});
