import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "mia_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host === "admin.miashop.com" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_SESSION_TOKEN;
  const actual = request.cookies.get(SESSION_COOKIE)?.value;
  if (!expected || !actual || actual !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/", "/admin/:path*"] };
