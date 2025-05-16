import { useState, useRef, useEffect } from "react";
import { VegaLite } from "react-vega";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { queryAPI } from "@/utils/api";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  vegaSpec?: any;
  data?: any;
}

export default function ConversationalQuery() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) setShowIntro(false);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Call backend to get AI response and possibly a visualization
      const aiResponse = await queryAPI.processQuery({
        query: input,
        provider: "flipside",
        thread_id: threadId,
      });
      // aiResponse: { assistant_message, vega_spec, data, thread_id }
      setThreadId(aiResponse.thread_id);
      setMessages((msgs) => [
        ...msgs,
        {
          role: "ai",
          content: aiResponse.assistant_message || "Here's your result:",
          vegaSpec: aiResponse.vega_spec,
          data: aiResponse.data,
        },
      ]);
    } catch (err: any) {
      setMessages((msgs) => [
        ...msgs,
        { role: "ai", content: err.message || "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full border-gray-300 rounded-lg shadow-soft">
      {showIntro && (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold gradient-text mb-2">
            SolViz Studio AI
          </h2>
          <p className="text-slate-300">
            Ask about Solana blockchain data in plain English. The AI will guide
            you, clarify your intent, and generate interactive visualizations.
          </p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-lg shadow-soft ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-dark-700/80 text-white"
              }`}
            >
              <div>{msg.content}</div>
              {msg.vegaSpec && msg.data && (
                <div className="w-full h-[400px] bg-[#212121] rounded-lg p-4 flex items-center justify-center">
                  <VegaLite
                    spec={msg.vegaSpec}
                    data={{ table: msg.data }}
                    actions={false}
                    renderer="canvas"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-lg bg-dark-700/80 text-white flex items-center">
              <LoadingSpinner size="small" color="text-blue-500" />
              <span className="ml-2">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t border-gray-300 bg-dark-800/50 px-4 py-3 flex items-end rounded-b-lg">
        <textarea
          className="flex-1 resize-none bg-transparent text-white p-2 rounded-md focus:outline-none"
          rows={1}
          placeholder="Type your question and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={loading}
        />
        <button
          className="ml-2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
