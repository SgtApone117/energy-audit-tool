import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Energy Audit Tool",
  description: "AI-assisted energy audit web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-6 py-5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Energy Audit Tool</h1>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-6 py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

