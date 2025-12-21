'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const isAssessment = pathname?.includes('/assessment');

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Energy Audit Tool</h1>
              {!isAssessment && (
                <p className="text-xs text-gray-500">Free Business Energy Assessment</p>
              )}
            </div>
          </Link>

          {isAssessment && (
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Start Over
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
