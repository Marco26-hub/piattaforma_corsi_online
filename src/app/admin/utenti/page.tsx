import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";

export const metadata = { title: "Utenti" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium">Utenti</h1>
        <p className="mt-1 text-foreground/60">{users.length} account registrati.</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{user.name ?? "Senza nome"}</p>
              <p className="truncate text-sm text-foreground/50">{user.email}</p>
            </div>
            <span className="hidden text-xs text-foreground/40 sm:inline">
              Iscritto {formatDistanceToNow(user.createdAt, { addSuffix: true, locale: it })}
            </span>
            <span className="text-sm text-foreground/50">
              {user._count.enrollments} corsi acquistati
            </span>
            <Badge variant={user.role === "ADMIN" ? "brand" : "neutral"}>{user.role}</Badge>
            {user.id !== session.user.id && (
              <UserRoleToggle userId={user.id} role={user.role} />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
