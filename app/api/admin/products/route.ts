import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseConfig, supabaseRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

async function uploadImage(file: File) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("حجم تصویر باید حداکثر ۵ مگابایت باشد.");
  if (!allowedTypes.has(file.type)) throw new Error("فرمت تصویر باید JPG، PNG، WebP یا AVIF باشد.");
  const { url, key } = supabaseConfig();
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
  const response = await fetch(`${url}/storage/v1/object/miashop-products/${path}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": file.type, "x-upsert": "false" },
    body: await file.arrayBuffer(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("بارگذاری تصویر در فضای ذخیره‌سازی انجام نشد.");
  return `${url}/storage/v1/object/public/miashop-products/${path}`;
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "دسترسی غیرمجاز است." }, { status: 401 });
  try {
    const products = await supabaseRest("products?select=id,name,sku,category,brand,price,old_price,stock,image_url,description,published,created_at&order=created_at.desc");
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin product read failed", error);
    return NextResponse.json({ error: "دریافت محصولات ناموفق بود. اتصال Supabase را بررسی کنید." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "ابتدا وارد پنل مدیریت شوید." }, { status: 401 });
  try {
    const form = await request.formData();
    const id = String(form.get("id") || "").trim();
    const name = String(form.get("name") || "").trim();
    const sku = String(form.get("sku") || "").trim();
    const category = String(form.get("category") || "مراقبت پوست").trim();
    const brand = String(form.get("brand") || "MiaShop").trim();
    const price = Number(form.get("price"));
    const stock = Number(form.get("stock"));
    const oldPriceValue = String(form.get("old_price") || "").trim();
    const description = String(form.get("description") || "").trim();
    const image = form.get("image");
    if (!name || !sku || !Number.isSafeInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "نام، کد کالا، قیمت و موجودی را صحیح وارد کنید." }, { status: 400 });
    }
    if (oldPriceValue && (!Number.isSafeInteger(Number(oldPriceValue)) || Number(oldPriceValue) < price)) {
      return NextResponse.json({ error: "قیمت قبل از تخفیف باید بزرگ‌تر یا مساوی قیمت فروش باشد." }, { status: 400 });
    }
    const current = id ? await supabaseRest(`products?id=eq.${encodeURIComponent(id)}&select=image_url`) as Array<{image_url:string|null}> : [];
    if (id && !current.length) return NextResponse.json({ error: "محصول برای ویرایش پیدا نشد." }, { status: 404 });
    let imageUrl = current[0]?.image_url ?? null;
    if (image instanceof File && image.size > 0) imageUrl = await uploadImage(image);
    if (!id && !imageUrl) return NextResponse.json({ error: "برای محصول جدید یک تصویر انتخاب کنید." }, { status: 400 });
    const record = {
      name, sku, category, brand, price, stock, image_url: imageUrl,
      old_price: oldPriceValue ? Number(oldPriceValue) : null,
      description: description || null, published: true, updated_at: new Date().toISOString(),
    };
    const result = await supabaseRest(id ? `products?id=eq.${encodeURIComponent(id)}&select=*` : "products?select=*", {
      method: id ? "PATCH" : "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(record),
    });
    return NextResponse.json({ product: Array.isArray(result) ? result[0] : result });
  } catch (error) {
    console.error("Admin product save failed", error);
    const message = error instanceof Error ? error.message : "ذخیره محصول ناموفق بود.";
    return NextResponse.json({ error: message.includes("SUPABASE_SERVICE_ROLE_KEY") ? "متغیر SUPABASE_SERVICE_ROLE_KEY در Vercel تنظیم نشده است." : message }, { status: 503 });
  }
}
