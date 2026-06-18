import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DomainDeals — Cheap & Free Domain Tracker",
  description:
    "Track the cheapest and free domain deals from Porkbun, Namecheap, Cloudflare, GoDaddy, and more. Updated in real-time.",
  keywords: "cheap domains, free domains, domain deals, domain discounts, domain promo, .com deals",
  openGraph: {
    title: "DomainDeals — Cheap & Free Domain Tracker",
    description: "Find the best domain deals from top registrars",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
