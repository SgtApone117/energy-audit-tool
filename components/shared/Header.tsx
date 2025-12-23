'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const isAssessment = pathname?.includes('/assessment');

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <Image
              src="/hd_(3).png"
              alt="ASAP Tech Systems"
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold text-gray-900">Energy Audit Tool</h1>
              {!isAssessment && (
                <p className="text-xs text-secondary-500">Free Business Energy Assessment</p>
              )}
            </div>
          </Link>

          {isAssessment && (
            <Link
              href="/"
              className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Start Over
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
