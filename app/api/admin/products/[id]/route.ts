import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, supabaseRest } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "دسترسی غیرمجاز است." }, { status: 401 });
  try {
    const { id } = await context.params;
    const deleted = await supabaseRest(`products?id=eq.${encodeURIComponent(id)}&select=id`, {
      method: "DELETE",
      headers: { Prefer: "return=representation" },
    });
    if (!Array.isArray(deleted) || deleted.length === 0) return NextResponse.json({ error: "محصول پیدا نشد." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin product delete failed", error);
    return NextResponse.json({ error: "حذف محصول انجام نشد. اتصال پایگاه داده را بررسی کنید." }, { status: 503 });
  }
}
