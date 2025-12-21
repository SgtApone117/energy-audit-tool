'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

// Placeholder - will be replaced in Phase 4
export default function ResultsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Placeholder Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Energy Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Results dashboard coming in Phase 4</p>
              <p className="text-sm">This will include energy profile, benchmarks, usage patterns, and savings recommendations.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
