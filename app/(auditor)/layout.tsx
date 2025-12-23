import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy Auditor | On-Site Audit Tool',
  description: 'Professional on-site energy audit tool for auditors and contractors.',
};

export default function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
