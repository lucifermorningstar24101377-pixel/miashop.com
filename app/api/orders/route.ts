import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutItem = { id: number; quantity: number };
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerName = String(body.customerName || "").trim();
    const phone = String(body.phone || "").replace(/[\s-]/g, "");
    const province = String(body.province || "").trim();
    const city = String(body.city || "").trim();
    const address = String(body.address || "").trim();
    const postalCode = String(body.postalCode || "").replace(/\s/g, "");
    const paymentMethod = String(body.paymentMethod || "").trim();
    const carrier = String(body.carrier || "").trim();
    const itemsInput = Array.isArray(body.items) ? body.items as CheckoutItem[] : [];
    if (customerName.length < 3 || !/^09\d{9}$/.test(phone) || !province || !city || address.length < 8 || !/^\d{10}$/.test(postalCode)) {
      return NextResponse.json({ error: "نام، موبایل، استان، شهر، نشانی کامل و کد پستی ۱۰ رقمی را بررسی کنید." }, { status: 400 });
    }
    if (!["درگاه بانکی (پرداخت در مرحله بعد)", "پرداخت اقساطی (نیازمند فعال‌سازی)"].includes(paymentMethod)) {
      return NextResponse.json({ error: "روش پرداخت معتبر نیست." }, { status: 400 });
    }
    if (!["پست ایران", "تی‌باکس"].includes(carrier) || !itemsInput.length || itemsInput.length > 50) {
      return NextResponse.json({ error: "روش ارسال یا اقلام سبد خرید معتبر نیست." }, { status: 400 });
    }
    const quantities = new Map<number, number>();
    for (const item of itemsInput) {
      if (!Number.isSafeInteger(item.id) || item.id <= 0 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        return NextResponse.json({ error: "تعداد یا شناسه یکی از محصولات معتبر نیست." }, { status: 400 });
      }
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
    }
    const ids = [...quantities.keys()];
    const rows = await supabaseRest(`products?select=id,name,sku,price,stock,image_url,published&id=in.(${ids.join(",")})`) as Array<{id:number;name:string;sku:string;price:number|string;stock:number;image_url:string|null;published:boolean}>;
    if (rows.length !== ids.length) return NextResponse.json({ error: "یک یا چند محصول دیگر در دسترس نیستند؛ سبد خرید را تازه‌سازی کنید." }, { status: 409 });
    const orderItems = rows.map(p => {
      const quantity = quantities.get(Number(p.id)) || 0;
      if (!p.published || quantity > Number(p.stock)) throw new Error(`موجودی محصول «${p.name}» کافی نیست.`);
      return { product_id: Number(p.id), sku: p.sku, name: p.name, quantity, unit_price: Number(p.price), image_url: p.image_url };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal < 0) return NextResponse.json({ error: "مبلغ سفارش معتبر نیست." }, { status: 400 });
    const orderCode = `MIA-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const saved = await supabaseRest("orders?select=id,order_code,order_status,payment_status,total,created_at", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        order_code: orderCode, customer_name: customerName, phone, province, city, address,
        postal_code: postalCode, payment_method: paymentMethod, payment_status: "pending",
        order_status: "awaiting_payment", items: orderItems, subtotal, shipping_cost: 0, total: subtotal, carrier,
      }),
    }) as Array<Record<string, unknown>>;
    const order = saved[0];
    return NextResponse.json({ order: { id: order.id, orderCode: order.order_code, status: order.order_status, paymentStatus: order.payment_status, total: order.total, createdAt: order.created_at }, message: "سفارش ثبت شد؛ پرداخت هنوز انجام نشده و هزینه ارسال پس از تأیید روش ارسال مشخص می‌شود." }, { status: 201 });
  } catch (error) {
    console.error("Order creation failed", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("موجودی محصول")) return NextResponse.json({ error: message }, { status: 409 });
    return NextResponse.json({ error: message.includes("SUPABASE_SERVICE_ROLE_KEY") ? "ثبت سفارش موقتاً غیرفعال است؛ تنظیمات امن سرور کامل نشده است." : "ثبت سفارش انجام نشد؛ دوباره تلاش کنید." }, { status: 503 });
  }
}
