import type { Metadata, Viewport } from "next";
import { Noto_Sans_Armenian, Noto_Serif_Armenian } from "next/font/google";
import "./globals.css";

const serif = Noto_Serif_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Գայանեի 51-ամյակ — հրավիրատոմս",
  description: "Սիրով հրավիրում ենք Ձեզ Գայանեի անակնկալ ծննդյան տոնին։",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF9F2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
