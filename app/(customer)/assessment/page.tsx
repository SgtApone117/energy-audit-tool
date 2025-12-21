'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { StepProgress } from '@/components/ui/ProgressBar';
import { ClipboardList } from 'lucide-react';

// Placeholder - will be replaced in Phase 3
export default function AssessmentPage() {
  const steps = ['Business Info', 'Utility Bills', 'Equipment', 'Review'];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <StepProgress currentStep={1} totalSteps={4} steps={steps} />
        </div>

        {/* Placeholder Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Assessment Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Multi-step assessment form coming in Phase 3</p>
              <p className="text-sm">This will include business basics, utility bill entry, and optional equipment inventory.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
