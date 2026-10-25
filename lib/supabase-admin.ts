import { timingSafeEqual } from "node:crypto";

export function isAdminRequest(request: Request) {
  const expected = process.env.ADMIN_SESSION_TOKEN;
  const cookie = request.headers.get("cookie") ?? "";
  const actual = cookie.match(/(?:^|;\s*)mia_admin_session=([^;]+)/)?.[1];
  if (!expected || !actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yesojugjdxyjlznelmll.supabase.co").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return { url, key };
}

export async function supabaseRest(path: string, init: RequestInit = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase REST ${response.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : null;
}
