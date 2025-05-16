import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import LogViewer from "./LogViewer";
import SystemInfo from "./SystemInfo";
import { debugAPI } from "@/utils/api"; // Use the debug API client
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DebugPanel() {
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState<string[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState(100);

  const { user } = useAuthStore();

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await debugAPI.getLogs(lineCount);
      setLogs(data);
      console.log("Fetched logs:", data); // Add debugging
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError(
        err.response?.data?.detail || `Failed to fetch logs: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await debugAPI.getSystemInfo();
      setSystemInfo(data);
      console.log("Fetched system info:", data); // Add debugging
    } catch (err: any) {
      console.error("Error fetching system info:", err);
      setError(
        err.response?.data?.detail ||
          `Failed to fetch system information: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "system") {
      fetchSystemInfo();
    }
  }, [activeTab, lineCount]);

  return (
    <div className="glass-card shadow-lg rounded-lg border border-dark-300">
      <div className="border-b border-dark-300">
        <nav className="flex space-x-4 px-6 py-4" aria-label="Debug navigation">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === "logs"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Log Viewer
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === "system"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            System Info
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-900/20 border border-red-800/30 p-5 rounded-lg mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">Error</h3>
                <div className="mt-2 text-sm text-red-200">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" color="text-blue-500" />
          </div>
        ) : activeTab === "logs" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="lineCount" className="text-white text-sm">
                  Line count:
                </label>
                <select
                  id="lineCount"
                  value={lineCount}
                  onChange={(e) => setLineCount(Number(e.target.value))}
                  className="mt-0 block bg-dark-700/50 text-white border border-dark-300/50 rounded-lg shadow-md py-1 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-400 sm:text-sm"
                >
                  <option value={50}>50 lines</option>
                  <option value={100}>100 lines</option>
                  <option value={200}>200 lines</option>
                  <option value={500}>500 lines</option>
                </select>
              </div>
              <button
                onClick={fetchLogs}
                className="inline-flex items-center px-3 py-2 border border-blue-500 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none rounded-md"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
            <LogViewer logs={logs} />
          </>
        ) : (
          <SystemInfo info={systemInfo} onRefresh={fetchSystemInfo} />
        )}
      </div>
    </div>
  );
}
