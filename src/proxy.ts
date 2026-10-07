import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { academyPathname } from "@/lib/academy-routing";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = academyPathname(nextUrl.pathname);
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthPage =
    pathname === "/login" || pathname === "/registrati" || pathname === "/richiedi-accesso";

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/academy/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/academy/dashboard", nextUrl));
    }
  }

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/academy/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/academy/admin" : "/academy/dashboard", nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
