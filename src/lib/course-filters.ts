import type { Prisma } from "@prisma/client";

export type CourseFilters = { q: string; category: string; status: "all" | "draft" | "published" | "archived"; sort: "updated" | "title" | "price"; page: number };
type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] || "" : value || "";

export function parseCourseFilters(params: SearchParams): CourseFilters {
  const status = first(params.status), sort = first(params.sort), page = first(params.page);
  return {
    q: first(params.q).trim().slice(0, 200), category: first(params.category).trim().slice(0, 100),
    status: ["draft", "published", "archived"].includes(status) ? status as CourseFilters["status"] : "all",
    sort: ["title", "price"].includes(sort) ? sort as CourseFilters["sort"] : "updated",
    page: /^\d+$/.test(page) ? Math.max(1, Math.min(10000, Number(page))) : 1,
  };
}

export function courseFilterHref(filters: Partial<CourseFilters> = {}): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.sort && filters.sort !== "updated") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return `/admin/corsi${params.size ? `?${params}` : ""}`;
}

export function courseFilterWhere(filters: CourseFilters): Prisma.CourseWhereInput {
  return {
    ...(filters.status === "archived" ? { archivedAt: { not: null } }
      : filters.status === "published" ? { published: true, archivedAt: null }
      : filters.status === "draft" ? { published: false, archivedAt: null } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.q ? { OR: ["title", "subtitle", "description"].map(field => ({ [field]: { contains: filters.q, mode: "insensitive" } })) } : {}),
  };
}
