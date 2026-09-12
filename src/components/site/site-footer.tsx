import Link from "next/link";
import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="container-app grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/">
            <Logo className="text-lg" />
          </Link>
          <p className="mt-4 text-sm text-foreground/60">
            La piattaforma per creare, vendere e seguire corsi online.
            Contenuti chiari, progressi tracciati, nessuna distrazione.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Esplora</h3>
          <ul className="mt-4 space-y-3 text-sm text-foreground/60">
            <li>
              <Link href="/corsi" className="hover:text-foreground">
                Catalogo corsi
              </Link>
            </li>
            <li>
              <Link href="/registrati" className="hover:text-foreground">
                Crea un account
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-foreground">
                Accedi
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Assistenza</h3>
          <ul className="mt-4 space-y-3 text-sm text-foreground/60">
            <li>Pagamenti sicuri con Stripe</li>
            <li>Accesso immediato dopo l&apos;acquisto</li>
            <li>Supporto via email</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle py-6">
        <p className="container-app text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} Formia. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}
