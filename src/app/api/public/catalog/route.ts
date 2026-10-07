import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { published: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true, slug: true, title: true, subtitle: true, description: true, imageUrl: true,
      priceCents: true, currency: true, level: true, category: true, updatedAt: true,
      modules: { orderBy: { order: "asc" }, select: {
        title: true, lessons: { orderBy: { order: "asc" }, select: {
          id: true, title: true, durationMin: true, isFreePreview: true,
        } },
      } },
    },
  });
  // Lesson contents, video URLs, enrollments and user data are never public.
  return NextResponse.json({ courses }, { headers: { "Cache-Control": "public, max-age=60" } });
}
