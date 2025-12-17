import type { FormData } from "@/lib/types";

interface BuildingSummaryProps {
  data: FormData;
}

export default function BuildingSummary({ data }: BuildingSummaryProps) {
  return (
    <div className="mb-8 p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Building Summary</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Building Name</dt>
          <dd className="text-base font-medium text-gray-900">{data.buildingName || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Business Type</dt>
          <dd className="text-base font-medium text-gray-900">{data.businessType || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Floor Area</dt>
          <dd className="text-base font-medium text-gray-900">
            {data.floorArea ? `${parseFloat(data.floorArea).toLocaleString()} sq ft` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ZIP Code</dt>
          <dd className="text-base font-medium text-gray-900">{data.zipCode || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Construction Year</dt>
          <dd className="text-base font-medium text-gray-900">{data.constructionYear || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Primary Heating Fuel</dt>
          <dd className="text-base font-medium text-gray-900">{data.primaryHeatingFuel || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

