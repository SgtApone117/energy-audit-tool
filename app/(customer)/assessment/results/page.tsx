'use client';

import { useState, useEffect } from 'react';
import { ResultsDashboard } from '@/components/customer/results';
import { CustomerAssessmentForm } from '@/lib/customer/types';

export default function ResultsPage() {
  const [formData, setFormData] = useState<CustomerAssessmentForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get form data from sessionStorage
    const savedData = sessionStorage.getItem('assessment-results-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing assessment data:', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ResultsDashboard formData={formData} />
    </div>
  );
}
