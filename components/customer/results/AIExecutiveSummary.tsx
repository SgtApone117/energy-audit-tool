'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert } from '@/components/ui';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Lightbulb, Target, TrendingUp, CheckCircle } from 'lucide-react';
import type { AIExecutiveSummaryOutput, AIExecutiveSummaryInput } from '@/lib/ai/types';

interface AIExecutiveSummaryProps {
  inputData: AIExecutiveSummaryInput;
}

export function AIExecutiveSummary({ inputData }: AIExecutiveSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<AIExecutiveSummaryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setIsExpanded(true);

    try {
      const response = await fetch('/api/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Smart Summary
          </CardTitle>
          {!isExpanded && (
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize My Results
                </>
              )}
            </Button>
          )}
          {isExpanded && summary && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isExpanded && !isLoading && !summary && (
          <p className="text-sm text-gray-600">
            Get a personalized summary of your energy assessment with key insights and actionable next steps.
          </p>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-indigo-600 mx-auto animate-spin mb-4" />
            <p className="text-gray-600">Creating your personalized summary...</p>
            <p className="text-sm text-gray-500 mt-1">This takes just a few seconds</p>
          </div>
        )}

        {error && (
          <Alert variant="warning">
            {error}
            <Button variant="outline" size="sm" className="mt-2" onClick={handleGenerate}>
              Try Again
            </Button>
          </Alert>
        )}

        {summary && isExpanded && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <p className="text-gray-700 leading-relaxed">{summary.overview}</p>
            </div>

            {/* Energy Performance */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Energy Performance
              </h4>
              <ul className="space-y-2">
                {summary.energyPerformanceSnapshot.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Findings */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                Key Findings
              </h4>
              <ul className="space-y-2">
                {summary.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Areas */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Recommended Focus Areas
              </h4>
              <ul className="space-y-2">
                {summary.recommendedFocusAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Opportunities */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-900 mb-2">Top Opportunities</h4>
              <p className="text-sm text-green-800 leading-relaxed">{summary.topOpportunities}</p>
            </div>

            {/* Business Impact */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Business Impact</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{summary.businessImpactSummary}</p>
            </div>

            {/* Next Steps */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Recommended Next Steps
              </h4>
              <ol className="space-y-2">
                {summary.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 italic pt-4 border-t">{summary.disclaimer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
