import React, { useState, useEffect, useRef } from "react";

interface LogViewerProps {
  logs: string[];
}

// Define log level colors
const logLevelColors: Record<string, string> = {
  INFO: "text-blue-400",
  DEBUG: "text-gray-400",
  ERROR: "text-red-500",
  WARNING: "text-yellow-500",
  CRITICAL: "text-red-600",
};

// Function to colorize log message based on content
const colorizeLog = (log: string) => {
  // Extract log level if present
  const levelMatch = log.match(/- (\w+) - /);
  let logClass = "text-white";

  if (levelMatch && levelMatch[1] && logLevelColors[levelMatch[1]]) {
    logClass = logLevelColors[levelMatch[1]];
  }

  // Highlight API requests in green
  if (log.includes("API Request:")) {
    return <span className="text-green-400">{log}</span>;
  }

  // Highlight API responses in cyan
  if (log.includes("API Response:")) {
    return <span className="text-cyan-400">{log}</span>;
  }

  // Highlight OpenAI requests/responses
  if (log.includes("OpenAI Request:") || log.includes("OpenAI Response")) {
    return <span className="text-purple-400">{log}</span>;
  }

  // Highlight Flipside requests/responses
  if (log.includes("Flipside API")) {
    return <span className="text-amber-400">{log}</span>;
  }

  // Highlight exceptions
  if (log.includes("Exception in") || log.includes("Error")) {
    return <span className="text-red-500">{log}</span>;
  }

  // Default coloring based on log level
  return <span className={logClass}>{log}</span>;
};

export default function LogViewer({ logs }: LogViewerProps) {
  const [filter, setFilter] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Filter logs when filter changes
  useEffect(() => {
    if (!filter.trim()) {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(
        logs.filter((log) => log.toLowerCase().includes(filter.toLowerCase()))
      );
    }
  }, [logs, filter]);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs]);

  return (
    <div>
      <div className="mb-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border border-dark-300/50 rounded-lg shadow-md py-2 px-3 bg-dark-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 sm:text-sm"
          />
        </div>
        <div className="flex mt-2 space-x-2">
          <button
            onClick={() => setFilter("INFO")}
            className="px-2 py-1 bg-blue-600/30 text-blue-400 text-xs rounded border border-blue-600/40"
          >
            INFO
          </button>
          <button
            onClick={() => setFilter("ERROR")}
            className="px-2 py-1 bg-red-600/30 text-red-400 text-xs rounded border border-red-600/40"
          >
            ERROR
          </button>
          <button
            onClick={() => setFilter("API")}
            className="px-2 py-1 bg-green-600/30 text-green-400 text-xs rounded border border-green-600/40"
          >
            API
          </button>
          <button
            onClick={() => setFilter("OpenAI")}
            className="px-2 py-1 bg-purple-600/30 text-purple-400 text-xs rounded border border-purple-600/40"
          >
            OpenAI
          </button>
          <button
            onClick={() => setFilter("Flipside")}
            className="px-2 py-1 bg-amber-600/30 text-amber-400 text-xs rounded border border-amber-600/40"
          >
            Flipside
          </button>
          <button
            onClick={() => setFilter("")}
            className="px-2 py-1 bg-gray-600/30 text-gray-400 text-xs rounded border border-gray-600/40"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={logContainerRef}
        className="bg-dark-700 border border-dark-300/50 rounded-lg p-4 font-mono text-xs overflow-auto"
        style={{ height: "600px" }}
      >
        {filteredLogs.length > 0 ? (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {colorizeLog(log)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {filter ? "No logs match your filter." : "No logs available."}
          </div>
        )}
      </div>
    </div>
  );
}
