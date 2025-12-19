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
              <div className="flex items-center gap-4">
                <img
                  src="/hd_(3).png"
                  alt="ASAP Tech Systems Logo"
                  className="h-12 w-auto"
                />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Energy Audit Tool</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-6 py-10">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <span>Powered by</span>
                <a
                  href="https://www.asaptechsys.com/clients"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ASAP Tech Systems
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

