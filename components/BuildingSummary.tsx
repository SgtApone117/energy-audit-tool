import type { FormData } from "@/lib/types";

interface BuildingSummaryProps {
  data: FormData;
}

export default function BuildingSummary({ data }: BuildingSummaryProps) {
  return (
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Building Summary</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-700">Building Name:</dt>
          <dd className="mt-1 text-sm text-gray-900">{data.buildingName || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-700">Business Type:</dt>
          <dd className="mt-1 text-sm text-gray-900">{data.businessType || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-700">Floor Area:</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {data.floorArea ? `${data.floorArea} sq ft` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-700">ZIP Code:</dt>
          <dd className="mt-1 text-sm text-gray-900">{data.zipCode || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-700">Construction Year:</dt>
          <dd className="mt-1 text-sm text-gray-900">{data.constructionYear || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-700">Primary Heating Fuel:</dt>
          <dd className="mt-1 text-sm text-gray-900">{data.primaryHeatingFuel || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

