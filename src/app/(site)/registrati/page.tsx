import Link from "next/link";
import { Layers } from "lucide-react";
import { RegisterForm } from "@/components/site/register-form";
import { Logo } from "@/components/site/logo";

export const metadata = { title: "Crea un account" };

export default function RegisterPage() {
  return (
    <div className="container-app grid min-h-[calc(100vh-4rem)] items-center py-12 lg:grid-cols-2 lg:gap-16">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface p-12">
          <Layers className="size-10 text-brand-400" />
          <h2 className="mt-8 font-serif text-3xl font-medium leading-snug">
            Crea il tuo account e inizia a imparare oggi stesso.
          </h2>
          <span className="accent-rule mt-4" />
          <p className="mt-4 text-foreground/65">
            Gratis, senza carta di credito. Sblocca l&apos;accesso ai corsi
            acquistati in qualsiasi momento.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block lg:hidden">
          <Logo className="text-lg" />
        </Link>

        <h1 className="font-serif text-2xl font-medium">Crea il tuo account</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Bastano trenta secondi per iniziare.
        </p>

        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
