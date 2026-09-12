import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { BookOpen, Users, Euro, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Admin" };

async function getStats() {
  const [totalCourses, publishedCourses, totalStudents, revenue, totalEnrollments, recentEnrollments] =
    await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.enrollment.aggregate({ _sum: { amountPaidCents: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true, email: true } }, course: { select: { title: true, slug: true } } },
      }),
    ]);

  return {
    totalCourses,
    publishedCourses,
    totalStudents,
    revenueCents: revenue._sum.amountPaidCents ?? 0,
    totalEnrollments,
    recentEnrollments,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Corsi pubblicati",
      value: `${stats.publishedCourses}/${stats.totalCourses}`,
      icon: BookOpen,
    },
    { label: "Studenti", value: stats.totalStudents, icon: Users },
    { label: "Ricavi totali", value: formatPrice(stats.revenueCents), icon: Euro },
    { label: "Iscrizioni totali", value: stats.totalEnrollments, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-medium">Dashboard</h1>
        <p className="mt-1 text-foreground/60">Panoramica della piattaforma.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <card.icon className="size-5 text-brand-400" />
            <p className="mt-3 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-sm text-foreground/60">{card.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Ultime iscrizioni</h2>
        {stats.recentEnrollments.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/50">Nessuna iscrizione ancora.</p>
        ) : (
          <div className="mt-4 divide-y divide-border-subtle">
            {stats.recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {enrollment.user.name ?? enrollment.user.email}
                  </p>
                  <Link
                    href={`/admin/corsi/${enrollment.courseId}`}
                    className="truncate text-foreground/50 hover:text-brand-400 hover:underline"
                  >
                    {enrollment.course.title}
                  </Link>
                </div>
                <span className="shrink-0 text-xs text-foreground/40">
                  {formatDistanceToNow(enrollment.createdAt, { addSuffix: true, locale: it })}
                </span>
                <span className="shrink-0 font-medium">
                  {formatPrice(enrollment.amountPaidCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
