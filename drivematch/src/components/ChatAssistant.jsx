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

  // Save messages
  useEffect(() => {
    localStorage.setItem("drivematch_chat", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    const t = setTimeout(() => {
      if (chatEndRef.current) {
        try {
          chatEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        } catch {
          chatEndRef.current.scrollIntoView();
        }
      }
    }, 60);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  // Auto-clear after 24 hours
  useEffect(() => {
    const lastSaved = localStorage.getItem("drivematch_chat_timestamp");
    const now = Date.now();

    if (!lastSaved || now - parseInt(lastSaved) > 86400000) {
      localStorage.removeItem("drivematch_chat");
      setMessages([
        {
          sender: "bot",
          text: "👋 Hi! I’m DriveMatch AI — ask me anything about vehicles.",
        },
      ]);
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
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        className="
          fixed bottom-6 right-6 
          bg-blue-600 text-white 
          rounded-full w-14 h-14 
          shadow-[0_8px_20px_rgba(0,0,0,0.2)] 
          flex items-center justify-center 
          hover:bg-blue-700 transition-all
        "
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
            className="
              fixed bottom-24 right-6 
              w-96 h-[520px] rounded-2xl shadow-xl 
              overflow-hidden backdrop-blur-xl 
              border border-[var(--color-text)]/25
              bg-[var(--color-bg)]/80 
              z-50
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Bot className="w-5 h-5" /> DriveMatch AI
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="hover:text-yellow-100 transition"
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
            <div
              className="
                flex-1 overflow-y-auto p-4 space-y-4
                scrollbar-thin 
                scrollbar-thumb-[var(--color-text)]/30
              "
            >
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
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-[var(--color-bg)] text-[var(--color-text)] rounded-bl-none border border-[var(--color-text)]/15"
                      }
                    `}
                  >
                    {msg.text}

                    {/* results list + APPLY ALL BUTTON */}
                    {msg.results?.length > 0 && (
                      <div className="mt-2 border-t border-[var(--color-text)]/20 pt-2">
                        <p className="font-medium mb-1 text-[var(--color-text)]">
                          Matching Vehicles:
                        </p>

                        {/* apply all button */}
                        <a
                          href={`/?ids=${msg.results
                            .map((x) => x._id)
                            .join(",")}`}
                          className="
                            inline-block mb-2 px-3 py-1 rounded-md 
                            bg-blue-600 text-white text-xs 
                            hover:bg-blue-700 transition
                          "
                        >
                          Show All {msg.results.length} Vehicles →
                        </a>

                        <ul className="space-y-1">
                          {msg.results.map((v) => (
                            <li key={v._id}>
                              <a
                                href={`/?ids=${v._id}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                              >
                                {v.name} — ₹{v.price?.toLocaleString()}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-[var(--color-text)]/70 ml-2">
                  <Bot className="w-4 h-4" />
                  <span className="animate-pulse">Typing...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="
                p-3 border-t border-[var(--color-text)]/20 
                flex gap-2 
                bg-[var(--color-bg)]
              "
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="
                  flex-1 px-3 py-2 rounded-lg 
                  border border-[var(--color-text)]/25
                  bg-[var(--color-bg)] text-[var(--color-text)]
                  focus:outline-blue-600
                "
                placeholder="Ask something about vehicles..."
              />

              <button
                type="submit"
                className="
                  bg-blue-600 hover:bg-blue-700 
                  text-white px-4 py-2 rounded-lg 
                  flex items-center gap-1
                "
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
