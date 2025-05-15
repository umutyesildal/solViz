import { useEffect } from "react";
import { useChartsStore, Chart } from "@/store/charts";
import ChartCard from "./ChartCard";

interface ChartGridProps {
  showPublic?: boolean;
  title?: string;
  emptyMessage?: string;
}

export default function ChartGrid({
  showPublic = false,
  title = "My Charts",
  emptyMessage = "You haven't created any charts yet",
}: ChartGridProps) {
  const {
    charts,
    publicCharts,
    isLoading,
    error,
    fetchCharts,
    fetchPublicCharts,
    deleteChart,
  } = useChartsStore();

  const displayedCharts: Chart[] = showPublic ? publicCharts : charts;

  useEffect(() => {
    if (showPublic) {
      fetchPublicCharts();
    } else {
      fetchCharts();
    }
  }, [fetchCharts, fetchPublicCharts, showPublic]);

  const handleDelete = async (chartId: number) => {
    try {
      await deleteChart(chartId);
    } catch (error) {
      console.error("Failed to delete chart:", error);
    }
  };

  const handleEdit = (chartId: number) => {
    // Redirect to edit page or open edit modal
    window.location.href = `/charts/${chartId}/edit`;
  };

  return (
    <div>
      <div className="pb-6 border-b border-dark-300/30">
        <h3 className="text-xl leading-6 font-medium text-white">{title}</h3>
        <p className="mt-2 max-w-4xl text-sm text-slate-400">
          {showPublic
            ? "Explore charts shared by the SolViz Studio community."
            : "View and manage your saved charts and visualizations."}
        </p>
      </div>

      {isLoading && (
        <div className="my-8 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-dark-400 border-t-primary-500"></div>
          <p className="mt-3 text-sm text-slate-400">Loading charts...</p>
        </div>
      )}

      {error && (
        <div className="my-5 glass-card bg-red-900/20 border border-red-800/30 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && displayedCharts.length === 0 && (
        <div className="my-10 text-center py-16 glass-card backdrop-blur-md rounded-lg border border-dark-300/30">
          <div className="bg-gradient-to-br from-primary-600/10 to-primary-800/10 p-4 rounded-full inline-flex">
            <svg
              className="mx-auto h-14 w-14 text-primary-400/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="mt-4 text-lg font-medium text-white">{emptyMessage}</p>
          {!showPublic && (
            <p className="mt-2 text-sm text-slate-400">
              Go to the{" "}
              <a
                href="/query"
                className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                Query page
              </a>{" "}
              to create your first chart.
            </p>
          )}
        </div>
      )}

      {!isLoading && !error && displayedCharts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {displayedCharts.map((chart) => (
            <ChartCard
              key={chart.id}
              chart={chart}
              onDelete={handleDelete}
              onEdit={handleEdit}
              isOwner={!showPublic} // Only show edit/delete for user's own charts
            />
          ))}
        </div>
      )}
    </div>
  );
}
