import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/corsi", label: "Corsi", icon: BookOpen },
  { href: "/admin/utenti", label: "Utenti", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden w-64 shrink-0 border-r border-border-subtle bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border-subtle px-6 font-semibold">
          <ShieldCheck className="size-5 text-brand-400" />
          Admin
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-surface-muted hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-border-subtle p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-surface-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" />
            Vedi il sito
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/70 hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Esci
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-subtle bg-background/90 px-4 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-5 text-brand-400" />
            Admin
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Esci"
              className="flex size-9 items-center justify-center rounded-full hover:bg-surface-muted"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border-subtle bg-background px-4 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-foreground/70 hover:bg-surface-muted"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
