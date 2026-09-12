"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { logoutAction } from "@/app/actions/auth";

type HeaderUser = {
  name?: string | null;
  role: "ADMIN" | "CUSTOMER";
} | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/corsi", label: "Corsi" },
    { href: "/#come-funziona", label: "Come funziona" },
    { href: "/#recensioni", label: "Recensioni" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-lg">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/">
          <Logo className="text-lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                variant="outline"
                size="sm"
              >
                {user.role === "ADMIN" ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <LayoutDashboard className="size-4" />
                )}
                {user.role === "ADMIN" ? "Admin" : "Area personale"}
              </Button>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm">
                  Esci
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Accedi
              </Button>
              <Button href="/registrati" size="sm">
                Inizia ora
              </Button>
            </>
          )}
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-full hover:bg-surface-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Apri menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border-subtle bg-background md:hidden">
          <nav className="container-app flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border-subtle pt-4">
              {user ? (
                <>
                  <Button
                    href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                    variant="outline"
                    className="w-full"
                  >
                    {user.role === "ADMIN" ? "Vai all'admin" : "Area personale"}
                  </Button>
                  <form action={logoutAction}>
                    <Button variant="ghost" className="w-full">
                      Esci
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button href="/login" variant="outline" className="w-full">
                    Accedi
                  </Button>
                  <Button href="/registrati" className="w-full">
                    Inizia ora
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
