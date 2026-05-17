import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { shouldUseSecureAuthCookies } from "@/lib/auth-cookies";
import { getDashboardHomeForRole } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";

const protectedMatchers = [/^\/admin(\/|$)/, /^\/teacher(\/|$)/, /^\/students(\/|$)/, /^\/checkout(\/|$)/];

function isProtectedPath(pathname: string) {
  return protectedMatchers.some((re) => re.test(pathname));
}

function roleMayAccessPath(role: UserRole, pathname: string) {
  if (pathname.startsWith("/admin")) return role === "ADMIN";
  if (pathname.startsWith("/teacher")) return role === "TEACHER";
  if (pathname.startsWith("/students")) return role === "PARENT" || role === "STUDENT";
  if (pathname.startsWith("/checkout")) return true;
  return true;
}

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("middleware: AUTH_SECRET or NEXTAUTH_SECRET is not set");
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: shouldUseSecureAuthCookies(),
  });

  if (!token?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token.role as UserRole | undefined) ?? "STUDENT";
  if (!roleMayAccessPath(role, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(getDashboardHomeForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/students/:path*", "/checkout/:path*"],
};
