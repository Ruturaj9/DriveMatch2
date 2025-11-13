import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, SendHorizonal, Trash2, X, MessageCircle } from "lucide-react";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("drivematch_chat");
    return saved
      ? JSON.parse(saved)
      : [
          {
            sender: "bot",
            text: "👋 Hi! I’m DriveMatch AI — ask me anything about vehicles.",
          },
        ];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Save messages + auto-scroll
  useEffect(() => {
    localStorage.setItem("drivematch_chat", JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-clear after 24 hours
  useEffect(() => {
    const lastSaved = localStorage.getItem("drivematch_chat_timestamp");
    const now = Date.now();
    if (!lastSaved || now - parseInt(lastSaved) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("drivematch_chat");
    }
    localStorage.setItem("drivematch_chat_timestamp", now);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/advisor", {
        query: input,
      });

      const reply = res.data;
      let botResponse = `🤖 ${reply.message || "Here’s what I found!"}`;

      if (reply.reasoning?.length) {
        botResponse +=
          "\n\n🧠 **Reasoning:**\n" +
          reply.reasoning.map((r) => `- ${r}`).join("\n");
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: botResponse,
            results: reply.results || [],
          },
        ]);
        setIsTyping(false);
      }, 1000 + Math.random() * 800);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Something went wrong. Please try again.",
        },
      ]);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("drivematch_chat");
    setMessages([
      { sender: "bot", text: "🧹 Chat cleared. Start a new conversation!" },
    ]);
  };

  return (
    <>
      {/* FAB Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-blue-60 text-white rounded-full w-14 h-14 shadow-[0_8px_20px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-blue-70 transition-all"
      >
        <MessageCircle className="w-7 h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 w-96 h-[520px] rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl border border-neutral-80 dark:border-neutral-30 bg-[rgba(255,255,255,0.60)] dark:bg-[rgba(15,15,15,0.60)] z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-60 text-white">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Bot className="w-5 h-5" />
                DriveMatch AI
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="hover:text-yellow-50 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:text-red-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-70 dark:scrollbar-thumb-neutral-40">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-[75%] p-3 rounded-xl text-sm whitespace-pre-line
                      ${
                        msg.sender === "user"
                          ? "bg-blue-60 text-white rounded-br-none"
                          : "bg-neutral-90 dark:bg-neutral-20 text-neutral-20 dark:text-neutral-90 rounded-bl-none"
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-neutral-40 dark:text-neutral-70 ml-2">
                  <Bot className="w-4 h-4" />
                  <span className="animate-pulse">Typing...</span>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="p-3 border-t border-neutral-80 dark:border-neutral-30 flex gap-2 bg-neutral-98 dark:bg-neutral-10"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-80 dark:border-neutral-40 bg-white dark:bg-neutral-20 focus:outline-blue-60"
                placeholder="Ask something about vehicles..."
              />

              <button
                type="submit"
                className="bg-blue-60 hover:bg-blue-70 text-white px-4 py-2 rounded-lg flex items-center gap-1"
              >
                <SendHorizonal className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
