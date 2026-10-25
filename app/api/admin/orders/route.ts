import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "دسترسی غیرمجاز است." }, { status: 401 });
  try {
    const orders = await supabaseRest("orders?select=id,order_code,customer_name,phone,province,city,address,postal_code,payment_method,payment_status,order_status,items,subtotal,shipping_cost,total,carrier,tracking_code,created_at,updated_at&order=created_at.desc");
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders read failed", error);
    return NextResponse.json({ error: "دریافت سفارش‌ها ناموفق بود." }, { status: 503 });
  }
}
