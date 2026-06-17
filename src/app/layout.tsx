import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { mr } from "@/lib/i18n/mr";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "विहीर सुरक्षा | Open Well Safety",
  description: "धोकादायक उघड्या विहिरींची तक्रार करा — अपघात टाळा.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr">
      <body className={devanagari.className}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-brand-dark">
              <span className="text-xl">🛟</span>
              <span>{mr.appName}</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/map" className="text-slate-600 hover:text-brand-dark">
                {mr.nav.map}
              </Link>
              <Link
                href="/report"
                className="rounded-lg bg-brand px-3 py-1.5 text-white"
              >
                {mr.nav.report}
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-4">{children}</main>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
