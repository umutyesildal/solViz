import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  isVisible,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-500 border border-dark-200 p-6 rounded-md shadow-lg flex flex-col items-center">
        <LoadingSpinner size="large" color="text-blue-500" />
        <p className="mt-3 text-white">{message}</p>
      </div>
    </div>
  );
}
