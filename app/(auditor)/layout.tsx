import type { Metadata } from 'next';
import { Header, Footer } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Energy Auditor | On-Site Audit Tool',
  description: 'Professional on-site energy audit tool for auditors and contractors.',
};

export default function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
