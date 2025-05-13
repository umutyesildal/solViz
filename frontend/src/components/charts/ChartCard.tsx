import { useState } from "react";
import { VegaLite } from "react-vega";
import { Chart } from "@/store/charts";

interface ChartCardProps {
  chart: Chart;
  onDelete?: (chartId: number) => void;
  onEdit?: (chartId: number) => void;
  isOwner?: boolean;
}

export default function ChartCard({
  chart,
  onDelete,
  onEdit,
  isOwner = false,
}: ChartCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete?.(chart.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleEdit = () => {
    onEdit?.(chart.id);
  };

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {chart.title}
          </h3>

          {isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-gray-500"
                title="Edit chart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>

              <button
                onClick={handleDelete}
                className={`${
                  confirmDelete
                    ? "text-red-600"
                    : "text-gray-400 hover:text-gray-500"
                }`}
                title={
                  confirmDelete
                    ? "Click again to confirm deletion"
                    : "Delete chart"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {chart.description && (
          <p className="mt-2 text-sm text-gray-500">{chart.description}</p>
        )}

        <div className="mt-4">
          <div className="w-full h-64">
            <VegaLite spec={chart.vega_spec} data={{ table: chart.data }} />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                chart.is_public
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {chart.is_public ? "Public" : "Private"}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {formatDate(chart.created_at)}
            </span>
          </div>

          <button
            onClick={toggleDetails}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Natural Language Query
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {chart.natural_language_query}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Generated Query
                </h4>
                <div className="mt-1 bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {chart.query}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Data Provider
                </h4>
                <p className="mt-1 text-sm text-gray-600">{chart.provider}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
