import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { PWARegister } from "@/components/shared/PWARegister";

export const metadata: Metadata = {
  title: "Energy Audit Tool - Free Business Energy Assessment",
  description: "Discover your business energy savings with our free, anonymous energy assessment tool. Compare to similar businesses and get actionable recommendations.",
  keywords: ["energy audit", "business energy", "energy savings", "utility bills", "energy efficiency"],
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  icons: {
    icon: "/hd_(3).png",
    apple: "/hd_(3).png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <PWARegister />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

