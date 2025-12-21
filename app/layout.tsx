import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Energy Audit Tool - Free Business Energy Assessment",
  description: "Discover your business energy savings with our free, anonymous energy assessment tool. Compare to similar businesses and get actionable recommendations.",
  keywords: ["energy audit", "business energy", "energy savings", "utility bills", "energy efficiency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
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

