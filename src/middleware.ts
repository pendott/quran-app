import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedMatchers = [/^\/admin(\/|$)/, /^\/teacher(\/|$)/, /^\/students(\/|$)/, /^\/checkout(\/|$)/];

function isProtectedPath(pathname: string) {
  return protectedMatchers.some((re) => re.test(pathname));
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
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/students/:path*", "/checkout/:path*"],
};
