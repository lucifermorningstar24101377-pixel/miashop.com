import type { Metadata } from "next";
import { Cormorant_Garamond, Estedad, Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-vazirmatn",
});

const estedad = Estedad({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-estedad",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "میاشاپ | زیبایی، با انتخابی هوشمندانه",
  description: "خرید محصولات آرایشی، مراقبت پوست و عطر از میاشاپ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} ${estedad.variable} ${cormorant.variable}`}>
        {children}
      </body>
    </html>
  );
}
