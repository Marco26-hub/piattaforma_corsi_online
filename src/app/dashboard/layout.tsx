import Link from "next/link";
import { BookOpen, LogOut, Compass } from "lucide-react";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/site/theme-toggle";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/90 backdrop-blur-lg">
        <div className="container-app flex h-16 items-center justify-between">
          <Link href="/dashboard">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/dashboard" className="text-foreground/70 hover:text-foreground">
              I miei corsi
            </Link>
            <Link href="/corsi" className="text-foreground/70 hover:text-foreground">
              Catalogo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-foreground/60 sm:inline">
              {session?.user?.name}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex size-9 items-center justify-center rounded-full text-foreground/60 hover:bg-surface-muted hover:text-foreground"
                aria-label="Esci"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-subtle bg-background/95 backdrop-blur-lg md:hidden">
        <Link
          href="/dashboard"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-foreground/60"
        >
          <BookOpen className="size-5" />
          I miei corsi
        </Link>
        <Link
          href="/corsi"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-foreground/60"
        >
          <Compass className="size-5" />
          Scopri
        </Link>
      </nav>
    </div>
  );
}
