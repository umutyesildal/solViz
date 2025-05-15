import { useState, useEffect } from "react";
import { useQueryStore } from "@/store/query";
import { useChartsStore } from "@/store/charts";
import { VegaLite } from "react-vega";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

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
    } catch (err) {
      // Error is handled by the store and displayed in the UI
      console.error("Query execution failed:", err);
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
    } catch (error: unknown) {
      const err = error as Error;
      setSaveMessage(`Failed to save chart: ${err.message}`);
      console.error("Failed to save chart:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Show loading overlay when saving a chart */}
      <LoadingOverlay isVisible={isSaving} message="Saving your chart..." />

      <div className="glass-card shadow-lg px-6 py-6 sm:rounded-lg sm:p-8">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium gradient-text">
              Query in Natural Language
            </h3>
            <p className="mt-2 text-sm text-slate-400">
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
                    className="block text-sm font-medium text-white"
                  >
                    Your Question
                  </label>
                  <textarea
                    id="query"
                    name="query"
                    rows={4}
                    className="mt-2 block w-full border border-dark-300/50 rounded-lg shadow-md py-3 px-4 bg-dark-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 sm:text-sm"
                    placeholder="E.g., What was the daily transaction volume on Solana over the past week?"
                    value={naturalLanguageQuery}
                    onChange={handleQueryChange}
                    required
                  />
                  <p className="mt-2 text-sm text-slate-400">
                    Be specific about the time period, metrics, and any
                    constraints.
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor="provider"
                    className="block text-sm font-medium text-white"
                  >
                    Data Provider
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    className="mt-2 block w-full bg-dark-700/50 text-white border border-dark-300/50 rounded-lg shadow-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-400 sm:text-sm"
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

                <div className="col-span-6 mt-2">
                  <button
                    type="submit"
                    className="inline-flex justify-center items-center py-3 px-6 border border-blue-500 shadow-lg text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 focus:outline-none w-full sm:w-auto"
                    disabled={isLoading || !naturalLanguageQuery}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="small" color="text-white" />
                        <span className="ml-2">Processing query...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Generate Visualization</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card bg-red-900/20 border border-red-800/30 p-5 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
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
            <div className="ml-4">
              <h3 className="text-sm font-medium text-red-300">Error</h3>
              <div className="mt-2 text-sm text-red-200">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="glass-card shadow-lg px-6 py-6 sm:rounded-lg sm:p-8">
          <div className="md:grid md:grid-cols-3 md:gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium gradient-text">Results</h3>
              <p className="mt-2 text-sm text-slate-400">
                Here&apos;s the visualization based on your query. You can save
                this chart to your dashboard.
              </p>

              <div className="mt-8">
                <h4 className="text-sm font-medium text-white/90">
                  Generated Query
                </h4>
                <div className="mt-3 bg-dark-700/50 p-4 rounded-lg border border-dark-300/30">
                  <pre className="text-xs text-slate-300 overflow-auto">
                    {result.query}
                  </pre>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-medium text-white/90">
                  Save this chart
                </h4>
                <div className="mt-3 space-y-4">
                  <div>
                    <label
                      htmlFor="chart-title"
                      className="block text-sm font-medium text-white"
                    >
                      Chart Title
                    </label>
                    <input
                      type="text"
                      id="chart-title"
                      className="mt-2 block w-full border border-dark-300/50 rounded-lg shadow-md py-2 px-3 bg-dark-700/50 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-400 sm:text-sm"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      placeholder="Give your chart a title"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="chart-description"
                      className="block text-sm font-medium text-white"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="chart-description"
                      rows={2}
                      className="mt-2 block w-full border border-dark-300/50 rounded-lg shadow-md py-2 px-3 bg-dark-700/50 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-400 sm:text-sm"
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
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 bg-dark-700/70 border-dark-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="is-public"
                        className="font-medium text-white"
                      >
                        Make this chart public
                      </label>
                      <p className="text-slate-400">
                        Public charts are visible to all users of SolViz Studio
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveChart}
                    className="w-full inline-flex justify-center items-center py-3 px-5 border border-blue-500 shadow-lg text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 focus:outline-none"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="small" color="text-white" />
                        <span className="ml-2">Saving chart...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Save Chart</span>
                      </div>
                    )}
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
