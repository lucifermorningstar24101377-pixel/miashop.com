import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const COOKIE = "mia_admin_session";
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;
  if (!username || !password || !sessionToken) {
    return NextResponse.json({ error: "ورود مدیر هنوز پیکربندی نشده است. متغیرهای امن پنل در Vercel تنظیم نشده‌اند." }, { status: 503 });
  }
  let body: { username?: unknown; password?: unknown; next?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 }); }

  if (typeof body.username !== "string" || typeof body.password !== "string" ||
      !safeEqual(body.username, username) || !safeEqual(body.password, password)) {
    return NextResponse.json({ error: "نام کاربری یا رمز عبور صحیح نیست." }, { status: 401 });
  }
  const next = typeof body.next === "string" && body.next.startsWith("/admin") && !body.next.startsWith("//") ? body.next : "/admin";
  const response = NextResponse.json({ ok: true, next });
  response.cookies.set(COOKIE, sessionToken, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: 60 * 60 * 8,
  });
  return response;
}
