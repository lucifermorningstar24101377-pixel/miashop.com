import { NextResponse } from "next/server";
import { supabaseRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await supabaseRest("products?select=id,name,sku,category,brand,price,old_price,stock,image_url,description,published&published=eq.true&order=created_at.desc");
    const products = (rows as Array<Record<string, unknown>>).map((p) => ({
      id: Number(p.id), name: p.name, sku: p.sku, category: p.category, brand: p.brand,
      price: Number(p.price), old: p.old_price == null ? undefined : Number(p.old_price),
      stock: Number(p.stock), imageUrl: p.image_url, description: p.description,
      cat: p.category === "مراقبت پوست" ? "پوست" : p.category === "عطر و رایحه" ? "عطر" : p.category === "آرایش" ? "آرایش" : p.category,
      tone: "cat-skin", mark: "✧", type: "bottle",
    }));
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Public catalog read failed", error);
    return NextResponse.json({ error: "کاتالوگ در حال حاضر در دسترس نیست." }, { status: 503 });
  }
}
