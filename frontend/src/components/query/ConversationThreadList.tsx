import { useState } from "react";
import { useQueryStore, type ConversationThread } from "@/store/query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ConversationThreadListProps {
  threads: ConversationThread[];
  activeThreadId: string | null;
  isLoading?: boolean;
}

export default function ConversationThreadList({
  threads,
  activeThreadId,
  isLoading = false,
}: ConversationThreadListProps) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [threadTitle, setThreadTitle] = useState("");

  // Get direct store access for thread operations
  const { updateConversationThread, deleteConversationThread } =
    useQueryStore.getState();

  // Function to handle thread renaming
  const handleRenameThread = async (threadId: string) => {
    if (!threadTitle.trim()) return;

    try {
      await updateConversationThread(threadId, {
        title: threadTitle,
      });
      setEditingThreadId(null);
      setThreadTitle("");
    } catch (error) {
      console.error("Failed to rename thread:", error);
    }
  };

  if (!threads || threads.length === 0) {
    return null;
  }

  return (
    <div className="glass-card shadow-lg px-6 py-6 sm:rounded-lg sm:p-8">
      <h3 className="text-lg font-medium gradient-text">Your Conversations</h3>
      <p className="mt-2 text-sm text-slate-400">
        View and continue your previous conversations
      </p>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="medium" color="text-blue-500" />
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.thread_id}
              className={`p-4 rounded-lg border ${
                thread.thread_id === activeThreadId
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-dark-300/30 bg-dark-700/30 hover:bg-dark-700/50"
              } transition-colors cursor-pointer`}
              onClick={() => {
                // Use the store's setThreadId function which now also loads conversation history
                useQueryStore.getState().setThreadId(thread.thread_id);
              }}
            >
              <div className="flex justify-between items-center">
                {editingThreadId === thread.thread_id ? (
                  <div className="flex-1 mr-2">
                    <input
                      type="text"
                      value={threadTitle}
                      onChange={(e) => setThreadTitle(e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded border border-dark-300 bg-dark-800/80 text-white"
                      placeholder="Enter thread title"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleRenameThread(thread.thread_id);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <h4 className="font-medium text-white">
                    {thread.title ||
                      `Conversation from ${new Date(
                        thread.created_at
                      ).toLocaleDateString()}`}
                  </h4>
                )}

                <div className="flex gap-2">
                  {editingThreadId === thread.thread_id ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameThread(thread.thread_id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Save"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingThreadId(null);
                          setThreadTitle("");
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Cancel"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingThreadId(thread.thread_id);
                          setThreadTitle(thread.title || "");
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Rename conversation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversationThread(thread.thread_id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete conversation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-300 mt-2">
                Last active:{" "}
                {new Date(thread.last_activity_at).toLocaleString()}
              </p>

              {thread.messages && thread.messages.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-slate-400">
                    Latest message:
                  </span>
                  <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                    {thread.messages[thread.messages.length - 1].content}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
