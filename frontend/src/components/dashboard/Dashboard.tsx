import { useEffect } from "react";
import { useChartsStore } from "@/store/charts";
import { useAuthStore } from "@/store/auth";
import ChartGrid from "@/components/charts/ChartGrid";

export default function Dashboard() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { charts, fetchCharts } = useChartsStore();

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-primary-600"
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Charts
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {totalCharts}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-green-600"
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Data Providers Used
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {totalProviders}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-secondary-600"
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Solana Network
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-green-600">
                      Active
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome to SolViz Studio
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Generate custom visualizations from Solana blockchain data using
            natural language.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">
            Get started by creating a new query or exploring existing
            visualizations.
          </p>

          <div className="mt-5">
            <a
              href="/query"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              New Query
            </a>
            <a
              href="/charts"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              My Charts
            </a>
            <a
              href="/charts/public"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              Public Charts
            </a>
          </div>
        </div>
      </div>

      {recentCharts.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Charts
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {recentCharts.map((chart) => (
              <ChartCard
                key={chart.id}
                chart={chart}
                isOwner={true}
                onDelete={(id) => {
                  /* Handle delete */
                }}
                onEdit={(id) => {
                  /* Handle edit */
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Import the ChartCard component to prevent circular dependencies
import ChartCard from "@/components/charts/ChartCard";
