import React from "react";

interface SystemInfoProps {
  info: any;
  onRefresh: () => void;
}

export default function SystemInfo({ info, onRefresh }: SystemInfoProps) {
  if (!info) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No system information available.</p>
        <button
          onClick={onRefresh}
          className="mt-4 inline-flex items-center px-4 py-2 border border-blue-500 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none rounded-md"
        >
          <svg
            className="h-4 w-4 mr-2"
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
          Load System Info
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={onRefresh}
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

      {/* System Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Card */}
        <div className="bg-dark-700/50 rounded-lg shadow-lg border border-dark-300/50 p-5">
          <h3 className="text-lg font-medium text-blue-400 mb-3">
            Environment
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Environment:</span>
              <span className="text-white font-mono">{info.environment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="text-white font-mono">{info.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Python Version:</span>
              <span className="text-white font-mono">
                {info.python_version?.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* API Keys Card */}
        <div className="bg-dark-700/50 rounded-lg shadow-lg border border-dark-300/50 p-5">
          <h3 className="text-lg font-medium text-green-400 mb-3">
            API Configuration
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">OpenAI API Key:</span>
              <span
                className={
                  info.env_vars?.OPENAI_API_KEY_SET
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {info.env_vars?.OPENAI_API_KEY_SET ? "Configured" : "Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">OpenAI Model:</span>
              <span className="text-white font-mono">{info.openai_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Flipside API Key:</span>
              <span
                className={
                  info.env_vars?.FLIPSIDE_API_KEY_SET
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {info.env_vars?.FLIPSIDE_API_KEY_SET ? "Configured" : "Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Helius API Key:</span>
              <span
                className={
                  info.env_vars?.HELIUS_API_KEY_SET
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {info.env_vars?.HELIUS_API_KEY_SET ? "Configured" : "Missing"}
              </span>
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className="bg-dark-700/50 rounded-lg shadow-lg border border-dark-300/50 p-5">
          <h3 className="text-lg font-medium text-purple-400 mb-3">Database</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Database URL:</span>
              <span
                className={
                  info.env_vars?.DATABASE_URL_SET
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {info.env_vars?.DATABASE_URL_SET ? "Configured" : "Missing"}
              </span>
            </div>
          </div>
        </div>

        {/* Backend Health Card */}
        <div className="bg-dark-700/50 rounded-lg shadow-lg border border-dark-300/50 p-5">
          <h3 className="text-lg font-medium text-amber-400 mb-3">
            Backend Health
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">API Connection:</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Update:</span>
              <span className="text-white font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON Data (for developers) */}
      <div className="mt-8">
        <details>
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-white mb-2">
            Raw System Information
          </summary>
          <pre className="bg-dark-900 p-4 rounded-lg text-xs overflow-auto max-h-96 text-gray-300 font-mono">
            {JSON.stringify(info, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
