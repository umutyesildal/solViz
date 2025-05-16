import { useEffect } from "react";
import { useChartsStore } from "@/store/charts";
import { useAuthStore } from "@/store/auth";
import ChartGrid from "@/components/charts/ChartGrid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Dashboard() {
  const { checkAuth } = useAuthStore();
  const { charts, fetchCharts, isLoading } = useChartsStore();

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (isLoggedIn) {
      fetchCharts();
    }
  }, [checkAuth, fetchCharts]);

  // Create stats for dashboard
  const recentCharts = charts.slice(0, 3);
  const totalCharts = charts.length;
  const uniqueProviders = Array.from(
    new Set(charts.map((chart) => chart.provider))
  );
  const totalProviders = uniqueProviders.length;

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="w-full flex justify-center py-8">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="large" color="text-blue-500" />
            <p className="mt-4 text-gray-400">Loading your dashboard data...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stats cards */}
            <div className="bg-dark-500 border border-dark-200">
              <div className="px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-black border border-blue-500 p-2">
                    <svg
                      className="h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Total Charts
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-white">
                          {totalCharts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-500 border border-dark-200">
              <div className="px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-black border border-blue-500 p-2">
                    <svg
                      className="h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Data Providers Used
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-white">
                          {totalProviders}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-500 border border-dark-200">
              <div className="px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-black border border-blue-500 p-2">
                    <svg
                      className="h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Solana Network
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-blue-500">
                          Active
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-500 border border-dark-200">
            <div className="px-5 py-5 border-b border-dark-300 sm:px-6">
              <h3 className="text-xl leading-6 font-medium text-white">
                Welcome to SolViz Studio
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Generate custom visualizations from Solana blockchain data using
                natural language.
              </p>
            </div>
            <div className="px-5 py-5 sm:p-6">
              <p className="text-sm text-gray-400">
                Get started by creating a new query or exploring existing
                visualizations.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/query"
                  className="inline-flex items-center px-4 py-2 border border-blue-500 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
                >
                  New Query
                </a>
                <a
                  href="/charts"
                  className="inline-flex items-center px-4 py-2 border border-dark-300 text-sm font-medium text-white hover:border-blue-500"
                >
                  My Charts
                </a>
                <a
                  href="/charts/public"
                  className="inline-flex items-center px-4 py-2 border border-dark-300 text-sm font-medium text-white hover:border-blue-500"
                >
                  Public Charts
                </a>
              </div>
            </div>
          </div>

          {recentCharts.length > 0 && (
            <div>
              <h2 className="text-xl font-medium text-white mb-6">
                Recent Charts
              </h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {recentCharts.map((chart) => (
                  <ChartCard
                    key={chart.id}
                    chart={chart}
                    isOwner={true}
                    onDelete={() => {
                      /* Handle delete */
                    }}
                    onEdit={() => {
                      /* Handle edit */
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Import the ChartCard component to prevent circular dependencies
import ChartCard from "@/components/charts/ChartCard";
