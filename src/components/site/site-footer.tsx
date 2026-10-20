import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { COMPANY, LEGAL_LINKS } from "@/lib/legal";

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
          <h3 className="text-sm font-semibold">Informazioni</h3>
          <ul className="mt-4 space-y-3 text-sm text-foreground/60">
            <li>
              <a href={LEGAL_LINKS.termini} target="_blank" rel="noreferrer" className="hover:text-foreground">
                Termini e condizioni
              </a>
            </li>
            <li>
              <a href={LEGAL_LINKS.privacy} target="_blank" rel="noreferrer" className="hover:text-foreground">
                Privacy
              </a>
            </li>
            <li>
              <a href={LEGAL_LINKS.cookie} target="_blank" rel="noreferrer" className="hover:text-foreground">
                Cookie policy
              </a>
            </li>
            <li>
              <a href={LEGAL_LINKS.recesso} target="_blank" rel="noreferrer" className="hover:text-foreground">
                Diritto di recesso
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle py-6">
        <div className="container-app space-y-1 text-center text-xs text-foreground/50">
          <p>© {new Date().getFullYear()} SWA Academy. Tutti i diritti riservati.</p>
          <p>
            {COMPANY.name} · P.IVA {COMPANY.vat} · {COMPANY.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
