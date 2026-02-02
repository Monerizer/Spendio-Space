import React, { useEffect, useState, useRef } from "react";
import { useSpendio } from "@/context/SpendioContext";
import { AuthPage } from "@/components/AuthPage";
import { Layout } from "@/components/Layout";
import { sendAIMessage, parseTransactionIntent, AIMessage } from "@/services/aiService";
import { voiceService } from "@/services/voiceService";
import { Send, Loader, Trash2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

export default function Advisor() {
  const { user, session, loading } = useSpendio();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem("advisor_chat_history");
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.warn("Failed to load chat history:", error);
    }

    // Check if voice recognition is supported
    setIsVoiceSupported(voiceService.isSupported());
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem("advisor_chat_history", JSON.stringify(messages));
    } catch (error) {
      console.warn("Failed to save chat history:", error);
    }

    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVoiceInput = () => {
    if (isListening) {
      voiceService.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const success = voiceService.start(
      (transcript) => {
        // Add the voice transcript as input
        setInputMessage(transcript);
        setIsListening(false);
        // Optionally auto-send the message
        setTimeout(() => {
          handleSendVoiceMessage(transcript);
        }, 500);
      },
      (error) => {
        toast.error(`Voice input error: ${error}`);
        setIsListening(false);
      }
    );

    if (!success) {
      toast.error("Voice recognition not available");
      setIsListening(false);
    }
  };

  const handleSendVoiceMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMsg: AIMessage = {
      id: Math.random().toString(16).slice(2),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    const { isAdjustment } = parseTransactionIntent(message);

    try {
      const result = await sendAIMessage(message, user, messages);

      if (result.success && result.response) {
        const assistantMsg: AIMessage = {
          id: Math.random().toString(16).slice(2),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Speak the response aloud when using voice
        if ("speechSynthesis" in window) {
          voiceService.speak(result.response);
        }

        if (isAdjustment) {
          toast.info("💡 To make these changes, visit the Financial Data page");
        }
      } else {
        toast.error(result.error || "Failed to get response from AI");
      }
    } catch (err) {
      toast.error("Error communicating with AI");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e5e5e5] border-t-[#1db584] rounded-full mx-auto mb-4" />
          <p className="text-[#666666]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <AuthPage />;
  }

  const handleClearChat = () => {
    setMessages([]);
    setInputMessage("");
    setShowClearConfirm(false);
    localStorage.removeItem("advisor_chat_history");
    toast.success("Chat cleared!");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg: AIMessage = {
      id: Math.random().toString(16).slice(2),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    // Detect if user is asking for transaction adjustments
    const { isAdjustment } = parseTransactionIntent(inputMessage);

    try {
      const result = await sendAIMessage(inputMessage, user, messages);

      if (result.success && result.response) {
        const assistantMsg: AIMessage = {
          id: Math.random().toString(16).slice(2),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // If transaction adjustment was detected, show a reminder
        if (isAdjustment) {
          toast.info("⚠️ Go to Financial Data page to make actual changes");
        }
      } else {
        toast.error(result.error || "Failed to get response from AI");
      }
    } catch (err) {
      toast.error("Error communicating with AI");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout currentPage="advisor">
      <div className="max-w-2xl mx-auto px-4 py-6 h-screen flex flex-col">
        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#1a1a1a]">Clear Chat History?</h2>
              <p className="text-[#666666]">This will permanently delete all messages in this conversation. This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-[#e5e5e5] text-[#1a1a1a] font-semibold rounded-lg hover:bg-[#f3f3f3] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-[#1a1a1a]">🤖 Copilot</h1>
            {messages.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear
              </button>
            )}
          </div>
          <p className="text-sm text-[#666666]">
            Get personalized financial advice based on your data. Ask questions, get recommendations, or request help with your finances.
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Welcome to AI Guide</h3>
              <p className="text-[#666666] max-w-sm">
                Ask me anything about your finances. I have access to all your financial data and can provide personalized advice.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                <button
                  onClick={() => setInputMessage("What's my financial health score and how can I improve it?")}
                  className="text-left px-4 py-2 border border-[#e5e5e5] rounded-lg hover:bg-[#f3f3f3] transition text-sm text-[#666666]"
                >
                  📊 Check my financial health
                </button>
                <button
                  onClick={() => setInputMessage("What are my top spending categories and how can I reduce expenses?")}
                  className="text-left px-4 py-2 border border-[#e5e5e5] rounded-lg hover:bg-[#f3f3f3] transition text-sm text-[#666666]"
                >
                  💰 How to reduce spending
                </button>
                <button
                  onClick={() => setInputMessage("What should be my savings and investing targets?")}
                  className="text-left px-4 py-2 border border-[#e5e5e5] rounded-lg hover:bg-[#f3f3f3] transition text-sm text-[#666666]"
                >
                  🎯 Suggest savings targets
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-[#1db584] text-white rounded-br-none"
                        : "bg-[#f3f3f3] text-[#1a1a1a] rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#f3f3f3] text-[#1a1a1a] px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 shadow-sm">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask me anything about your finances..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading || isListening}
              className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg focus:ring-2 focus:ring-[#1db584] focus:border-transparent outline-none transition disabled:opacity-50"
            />
            {isVoiceSupported && (
              <button
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`p-2 rounded-lg transition ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
                } disabled:opacity-50`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-[#1db584] text-white rounded-lg hover:bg-[#0f8a56] transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-[#999999] mt-2">
            💡 Tip: Ask me to analyze your spending, suggest targets, or provide financial advice.
            {isVoiceSupported && " You can also use the microphone button for voice input."}
          </p>
        </div>
      </div>
    </Layout>
  );
}
