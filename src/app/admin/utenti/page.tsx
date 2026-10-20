import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { revokeEnrollment } from "@/app/actions/users";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";
import { UserApprovalToggle } from "@/components/admin/user-approval-toggle";
import { DeleteIconButton } from "@/components/admin/delete-icon-button";

export const metadata = { title: "Utenti" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: {
        orderBy: { createdAt: "desc" },
        include: { course: { select: { id: true, title: true } } },
      },
    },
  });

  return (
    <div className="space-y-6 [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:text-sm [&_button]:leading-5 [&_button]:text-foreground [&_button_svg]:size-4">
      <div>
        <h1 className="text-2xl font-semibold">Utenti</h1>
        <p className="mt-1 text-base text-foreground/80">{users.length} utenti registrati.</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="p-4" role="group" aria-label={`Utente ${user.email}`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="min-w-0 basis-full sm:min-w-48 sm:flex-1 sm:basis-auto">
                <p className="text-base font-semibold leading-6 [overflow-wrap:anywhere]">{user.name ?? "Senza nome"}</p>
                <p className="text-base leading-6 text-foreground/80 [overflow-wrap:anywhere]">{user.email}</p>
              </div>
              <span className="text-sm leading-5 text-foreground/75">
                Registrato {formatDistanceToNow(user.createdAt, { addSuffix: true, locale: it })}
              </span>
              <span className="text-base font-medium">
                {user.enrollments.length === 0 ? "Nessun corso attivo" : `Accesso a ${user.enrollments.length} ${user.enrollments.length === 1 ? "corso" : "corsi"}`}
              </span>
              <Badge variant="outline" className="text-sm normal-case tracking-normal text-foreground">
                {user.role === "ADMIN" ? "Amministratore" : "Cliente"}
              </Badge>
              <Badge variant="outline" className={`text-sm normal-case tracking-normal ${user.approved ? "border-brand-400 text-brand-400" : "text-foreground"}`}>
                {user.approved ? "Accesso consentito" : "Accesso da approvare"}
              </Badge>
              {user.id !== session.user.id && (
                <div className="flex basis-full flex-wrap gap-2 sm:basis-auto">
                  <UserApprovalToggle userId={user.id} approved={user.approved} />
                  <UserRoleToggle userId={user.id} role={user.role} />
                </div>
              )}
            </div>

            {user.enrollments.length > 0 && (
              <ul className="mt-4 divide-y divide-border-subtle border-t border-border-subtle">
                {user.enrollments.map((enrollment) => (
                  <li
                    key={enrollment.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium leading-6 [overflow-wrap:anywhere]">{enrollment.course.title}</p>
                      <p className="mt-1 text-sm leading-5 text-foreground/75">
                        <span className="tabular-nums">{formatPrice(enrollment.amountPaidCents)}</span>
                        {" · "}{formatDistanceToNow(enrollment.createdAt, { addSuffix: true, locale: it })}
                      </p>
                    </div>
                    <DeleteIconButton
                      label="Rimuovi accesso al corso"
                      confirmMessage={`Rimuovere a ${user.email} l'accesso al corso "${enrollment.course.title}"? Usalo dopo aver emesso il rimborso su Stripe.`}
                      action={revokeEnrollment.bind(null, user.id, enrollment.course.id, enrollment.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
