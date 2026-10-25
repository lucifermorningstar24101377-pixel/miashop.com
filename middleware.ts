import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (host === "admin.miashop.com" && request.nextUrl.pathname === "/") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin";
    return NextResponse.rewrite(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
