import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "میاشاپ | زیبایی، با انتخابی هوشمندانه", description: "خرید محصولات آرایشی، مراقبت پوست و عطر از میاشاپ" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fa" dir="rtl"><body>{children}</body></html>; }
