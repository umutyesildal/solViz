import { useState, useEffect } from "react";
import { useQueryStore } from "@/store/query";
import { useChartsStore } from "@/store/charts";
import { VegaLite } from "react-vega";

const providers = [
  { id: "flipside", name: "Flipside Crypto" },
  { id: "helius", name: "Helius API" },
  // Add other providers as they're implemented
];

export default function NaturalLanguageQuery() {
  const {
    naturalLanguageQuery,
    provider,
    result,
    isLoading,
    error,
    setQuery,
    setProvider,
    executeQuery,
  } = useQueryStore();

  const { createChart } = useChartsStore();

  const [chartTitle, setChartTitle] = useState("");
  const [chartDescription, setChartDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Clear any save messages after a delay
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvider(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await executeQuery();
    } catch (error) {
      // Error is handled by the store and displayed in the UI
    }
  };

  const handleSaveChart = async () => {
    if (!result) return;

    setIsSaving(true);

    try {
      await createChart({
        title: chartTitle || `Chart from "${naturalLanguageQuery}"`,
        description: chartDescription,
        query: result.query,
        natural_language_query: naturalLanguageQuery,
        provider,
        data: result.data,
        vega_spec: result.vega_spec,
        is_public: isPublic,
      });

      setSaveMessage("Chart saved successfully!");
      setChartTitle("");
      setChartDescription("");
    } catch (error: any) {
      setSaveMessage(`Failed to save chart: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium text-gray-900">
              Query in Natural Language
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Ask about Solana blockchain data in plain English. Our AI will
              convert your question to the appropriate query and fetch the data.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label
                    htmlFor="query"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Question
                  </label>
                  <textarea
                    id="query"
                    name="query"
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="E.g., What was the daily transaction volume on Solana over the past week?"
                    value={naturalLanguageQuery}
                    onChange={handleQueryChange}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Be specific about the time period, metrics, and any
                    constraints.
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="provider"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Data Provider
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={provider}
                    onChange={handleProviderChange}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={isLoading || !naturalLanguageQuery}
                  >
                    {isLoading ? "Processing..." : "Get Results"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
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
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium text-gray-900">Results</h3>
              <p className="mt-1 text-sm text-gray-500">
                Here's the visualization based on your query. You can save this
                chart to your dashboard.
              </p>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">
                  Generated Query
                </h4>
                <div className="mt-2 bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs overflow-auto">{result.query}</pre>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">
                  Save this chart
                </h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <label
                      htmlFor="chart-title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Chart Title
                    </label>
                    <input
                      type="text"
                      id="chart-title"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      placeholder="Give your chart a title"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="chart-description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="chart-description"
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={chartDescription}
                      onChange={(e) => setChartDescription(e.target.value)}
                      placeholder="Add a description"
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="is-public"
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="is-public"
                        className="font-medium text-gray-700"
                      >
                        Make this chart public
                      </label>
                      <p className="text-gray-500">
                        Public charts are visible to all users of SolViz Studio
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveChart}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Chart"}
                  </button>

                  {saveMessage && (
                    <p
                      className={`text-sm ${
                        saveMessage.includes("Failed")
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {saveMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="bg-white overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="aspect-w-16 aspect-h-9">
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Render the visualization using Vega-Lite */}
                      <VegaLite
                        spec={result.vega_spec}
                        data={{ table: result.data }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
