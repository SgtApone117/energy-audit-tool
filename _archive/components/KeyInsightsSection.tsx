import type { Insight } from "@/lib/insights/auditInsights";

interface KeyInsightsSectionProps {
  insights: Insight[];
}

export default function KeyInsightsSection({ insights }: KeyInsightsSectionProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights & Highlights</h3>
      <ul className="space-y-4">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p
              className="text-base text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: insight.text.replace(/\*\*(.*?)\*\*/g, "<strong class='text-gray-900 font-semibold'>$1</strong>"),
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
