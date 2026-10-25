import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";
const statuses = new Set(["awaiting_payment","paid","processing","shipped","delivered","cancelled","returned"]);
export async function PATCH(request: NextRequest, context: { params: Promise<{id:string}> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "دسترسی غیرمجاز است." }, { status: 401 });
  try {
    const { id } = await context.params;
    const body = await request.json();
    const orderStatus = String(body.order_status || "");
    const trackingCode = String(body.tracking_code || "").trim();
    const carrier = String(body.carrier || "").trim();
    if (!statuses.has(orderStatus)) return NextResponse.json({ error: "وضعیت سفارش معتبر نیست." }, { status: 400 });
    if (orderStatus === "shipped" && !trackingCode) return NextResponse.json({ error: "برای وضعیت ارسال‌شده باید کد رهگیری مرسوله وارد شود." }, { status: 400 });
    const rows = await supabaseRest(`orders?id=eq.${encodeURIComponent(id)}&select=id,order_code,order_status,tracking_code,carrier`, {
      method: "PATCH", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ order_status: orderStatus, tracking_code: trackingCode || null, carrier: carrier || null, updated_at: new Date().toISOString() }),
    }) as Array<Record<string, unknown>>;
    if (!rows.length) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    return NextResponse.json({ order: rows[0] });
  } catch (error) {
    console.error("Admin order update failed", error);
    return NextResponse.json({ error: "به‌روزرسانی سفارش انجام نشد." }, { status: 503 });
  }
}
