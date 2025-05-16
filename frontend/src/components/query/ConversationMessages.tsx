import { useRef, useEffect } from "react";
import { type ConversationMessage } from "@/store/query";

interface ConversationMessagesProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
}

export default function ConversationMessages({
  messages,
  isLoading = false,
}: ConversationMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex justify-center items-center h-32 text-gray-400">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mx-auto mb-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          <p>No conversation history yet. Start by asking a question.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {messages.map((message, idx) => (
        <div
          key={message.id || `msg-${idx}`}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-3 rounded-lg max-w-[80%] ${
              message.role === "user"
                ? "bg-blue-600/30 border border-blue-500/30 text-white"
                : "bg-dark-700/50 border border-dark-300/30 text-slate-200"
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            {message.created_at && (
              <div className="text-xs text-slate-400 mt-1 text-right">
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="px-4 py-3 rounded-lg max-w-[80%] bg-dark-700/50 border border-dark-300/30 text-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
