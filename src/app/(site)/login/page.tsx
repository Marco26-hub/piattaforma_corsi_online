import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/components/site/login-form";
import { Logo } from "@/components/site/logo";

export const metadata = { title: "Accedi" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="container-app grid min-h-[calc(100vh-4rem)] items-center py-12 lg:grid-cols-2 lg:gap-16">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface p-12">
          <GraduationCap className="size-10 text-brand-400" />
          <h2 className="mt-8 font-serif text-3xl font-medium leading-snug">
            Bentornato. I tuoi corsi ti stanno aspettando.
          </h2>
          <span className="accent-rule mt-4" />
          <p className="mt-4 text-foreground/65">
            Accedi per continuare da dove avevi lasciato, tenere traccia dei
            progressi e sbloccare nuovi contenuti.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block lg:hidden">
          <Logo className="text-lg" />
        </Link>

        <h1 className="font-serif text-2xl font-medium">Accedi al tuo account</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Inserisci le tue credenziali per continuare.
        </p>

        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl ?? "/dashboard"} />
        </div>
      </div>
    </div>
  );
}
