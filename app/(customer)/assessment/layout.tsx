import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy Assessment - Energy Audit Tool',
  description: 'Complete your free business energy assessment',
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
