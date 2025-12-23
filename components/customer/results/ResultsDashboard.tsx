'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Alert, Accordion, AccordionItem } from '@/components/ui';
import { Share2, RefreshCw, Home, Info } from 'lucide-react';
import { useCalculations } from '@/lib/customer/hooks/useCalculations';
import { CustomerAssessmentForm } from '@/lib/customer/types';
import { prepareAISummaryInput } from '@/lib/ai/aiExecutiveSummary';
import { EnergyProfile } from './EnergyProfile';
import { BenchmarkComparison } from './BenchmarkComparison';
import { QuickWins } from './QuickWins';
import { SavingsOpportunities } from './SavingsOpportunities';
import { ActionPlanBuilder } from './ActionPlanBuilder';
import { AIExecutiveSummary } from './AIExecutiveSummary';

interface ResultsDashboardProps {
  formData: CustomerAssessmentForm | null;
}

export function ResultsDashboard({ formData }: ResultsDashboardProps) {
  const { results, isReady } = useCalculations(formData);
  const [copied, setCopied] = useState(false);

  // Loading state
  if (!formData) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Alert variant="warning">
          No assessment data found. Please complete the assessment first.
        </Alert>
        <Link href="/assessment">
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Assessment
          </Button>
        </Link>
      </div>
    );
  }

  if (!isReady || !results) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-600 mx-auto animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900">Analyzing your data...</p>
            <p className="text-gray-500">This will just take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  const monthsOfData = formData.utilityBills.filter(
    (b) => b.electricityKwh !== null && b.electricityCost !== null
  ).length;

  const handleShare = async () => {
    const shareText = `Energy Assessment Results for ${formData.businessName}
Annual Energy Cost: $${results.annualCost.toLocaleString()}
Energy Score: ${results.energyScore}
Potential Annual Savings: $${results.ecmRecommendations.reduce((sum, r) => sum + r.savingsRange.typical, 0).toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      alert('Share link:\n\n' + shareText);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formData.businessName}
          </h1>
          <p className="text-gray-600">Energy Assessment Results</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Link href="/assessment">
            <Button variant="ghost">
              <Home className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Energy Profile */}
      <EnergyProfile
        annualCost={results.annualCost}
        annualUsage={results.annualUsage}
        costPerSqFt={results.costPerSqFt}
        energyScore={results.energyScore}
        confidence={results.confidence}
        monthsOfData={monthsOfData}
        hasEquipmentData={results.hasEquipmentData}
      />

      {/* Smart Summary */}
      <AIExecutiveSummary
        inputData={prepareAISummaryInput(
          {
            businessName: formData.businessName,
            businessType: formData.businessType,
            squareFootage: formData.squareFootage || 0,
            zipCode: formData.zipCode,
            state: formData.state,
          },
          results
        )}
      />

      {/* Benchmark Comparison */}
      <BenchmarkComparison
        yourEUI={results.yourEUI}
        typicalEUI={results.typicalEUI}
        efficientEUI={results.efficientEUI}
        percentile={results.percentile}
        businessType={formData.businessType}
      />

      {/* Insights */}
      {results.insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Key Insights
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.severity === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : insight.severity === 'opportunity'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className={`font-medium ${
                  insight.severity === 'warning'
                    ? 'text-yellow-900'
                    : insight.severity === 'opportunity'
                    ? 'text-green-900'
                    : 'text-blue-900'
                }`}>
                  {insight.message}
                </p>
                <p className={`text-sm mt-1 ${
                  insight.severity === 'warning'
                    ? 'text-yellow-700'
                    : insight.severity === 'opportunity'
                    ? 'text-green-700'
                    : 'text-blue-700'
                }`}>
                  {insight.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      <QuickWins quickWins={results.quickWins} totalAnnualCost={results.annualCost} />

      {/* Savings Opportunities */}
      <SavingsOpportunities recommendations={results.ecmRecommendations} />

      {/* Action Plan Builder */}
      <ActionPlanBuilder
        recommendations={results.ecmRecommendations}
        businessName={formData.businessName}
      />

      {/* Educational Content */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Learn More</h2>
        <Accordion>
          <AccordionItem title="How We Calculate These Estimates">
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Our estimates are based on industry-standard methodologies and benchmarks from
                ENERGY STAR, ASHRAE, and the Department of Energy.
              </p>
              <p>
                We use your utility bill data to calculate your actual Energy Use Intensity (EUI)
                and compare it to typical buildings of your type in your climate zone.
              </p>
              <p>
                Savings estimates for efficiency measures are based on typical performance data
                adjusted for your building type and location.
              </p>
            </div>
          </AccordionItem>
          <AccordionItem title="Why Ranges, Not Exact Numbers?">
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Actual savings depend on many factors we cannot measure remotely, including:
                equipment condition, installation quality, occupant behavior, and weather.
              </p>
              <p>
                By showing ranges, we give you a realistic picture of potential outcomes rather
                than false precision.
              </p>
            </div>
          </AccordionItem>
          <AccordionItem title="Understanding Payback Period">
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                Payback period is how long it takes for annual savings to equal the implementation
                cost. A 2-year payback means the measure pays for itself in 2 years.
              </p>
              <p>
                Shorter paybacks are generally better, but longer payback measures may still be
                worthwhile for their other benefits.
              </p>
            </div>
          </AccordionItem>
          <AccordionItem title="Next Steps">
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Review the Quick Wins and implement any that apply to your situation today.</p>
              <p>2. Use the Action Plan Builder to prioritize efficiency measures.</p>
              <p>3. Get quotes from qualified contractors for the measures you select.</p>
              <p>4. Check with your utility for available rebates and incentives.</p>
              <p>5. Consider a professional energy audit for detailed recommendations.</p>
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Important Note</p>
        <p>
          This assessment provides estimates based on the information you provided and industry
          benchmarks. Actual savings will vary based on your specific equipment, building
          conditions, and implementation. We recommend consulting with qualified energy
          professionals for detailed analysis and implementation.
        </p>
      </div>
    </div>
  );
}
