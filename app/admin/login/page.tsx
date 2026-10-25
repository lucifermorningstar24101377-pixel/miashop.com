"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, next: searchParams.get("next") || "/admin" }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "ورود انجام نشد."); return; }
      window.location.assign(result.next || "/admin");
    } catch { setError("ارتباط برقرار نشد؛ دوباره تلاش کنید."); }
    finally { setBusy(false); }
  }

  return (
    <main dir="rtl" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(ellipse at 20% 15%, #d9d0e8 0, transparent 35%), radial-gradient(ellipse at 85% 85%, #e7c5c7 0, transparent 32%), #f7f4ef", color: "#24251f" }}>
      <section style={{ width: "min(100%, 420px)", padding: "clamp(24px, 6vw, 42px)", border: "1px solid #e5dfd6", borderRadius: 24, background: "#fffdf9", boxShadow: "0 24px 80px #28251b18" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
          <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 15, background: "#292c24", color: "#fff", fontSize: 24, fontWeight: 700 }}>M</span>
          <div><strong style={{ display: "block", fontSize: 21 }}>MiaShop</strong><span style={{ fontSize: 11, letterSpacing: 2, color: "#77756d" }}>ADMINISTRATION</span></div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#77756d", fontSize: 13 }}><ShieldCheck size={16}/> پنل امن مدیریت</span>
        <h1 style={{ fontSize: 27, margin: "12px 0 8px" }}>ورود مدیر فروشگاه</h1>
        <p style={{ color: "#77756d", fontSize: 14, lineHeight: 1.9, margin: "0 0 24px" }}>برای مدیریت محصولات و موجودی، اطلاعات ورود مدیر را وارد کنید.</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 15 }}>
          <label style={{ display: "grid", gap: 8, fontSize: 13, fontWeight: 600 }}>نام کاربری<input autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} style={{ minHeight: 48, padding: "0 13px", border: "1px solid #ded9d0", borderRadius: 10, background: "#fff", color: "#24251f", font: "inherit" }} /></label>
          <label style={{ display: "grid", gap: 8, fontSize: 13, fontWeight: 600 }}>رمز عبور<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} style={{ minHeight: 48, padding: "0 13px", border: "1px solid #ded9d0", borderRadius: 10, background: "#fff", color: "#24251f", font: "inherit" }} /></label>
          {error && <p role="alert" style={{ margin: 0, padding: 11, borderRadius: 9, background: "#fff0ef", color: "#a52b25", fontSize: 13, lineHeight: 1.8 }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ minHeight: 49, marginTop: 4, border: 0, borderRadius: 10, background: "#292c24", color: "#fff", font: "inherit", fontWeight: 700, cursor: busy ? "wait" : "pointer", opacity: busy ? .7 : 1 }}>{busy ? "در حال بررسی…" : <><LockKeyhole size={16} style={{ verticalAlign: "middle", marginLeft: 8 }}/>ورود امن</>}</button>
        </form>
        <p style={{ margin: "22px 0 0", color: "#8c887f", fontSize: 11, lineHeight: 1.8 }}>دسترسی پنل فقط با اعتبارنامه‌های سمت سرور امکان‌پذیر است.</p>
      </section>
    </main>
  );
}
