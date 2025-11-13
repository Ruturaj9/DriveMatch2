import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trophy, MessageSquareText } from "lucide-react";

const CompareHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = (text) => {
    const toast = document.createElement("div");
    toast.textContent = text;
    toast.className =
      "fixed bottom-6 right-6 bg-blue-60 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999]";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/compare/history/guest")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 px-6 py-10 transition-colors">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-60 dark:text-blue-40 mb-8 text-center">
          📜 Compare History
        </h1>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20 text-neutral-40 dark:text-neutral-70">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-neutral-40 dark:text-neutral-70 text-lg mt-12">
            No saved comparisons yet.
          </p>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {history.map((entry) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border border-neutral-85 dark:border-neutral-40 bg-white dark:bg-neutral-20 rounded-2xl shadow-md p-5 hover:shadow-xl transition"
                >
                  {/* Header: Room + Time */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-neutral-20 dark:text-neutral-90 flex items-center gap-2">
                      <Trophy size={18} /> Room {entry.roomNumber}
                    </h3>

                    <p className="text-xs text-neutral-50 dark:text-neutral-60 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Verdict */}
                  <div className="bg-blue-60/10 border border-blue-60/40 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-70 dark:text-blue-40">
                    <MessageSquareText size={18} className="mt-0.5" />
                    <span>{entry.verdict}</span>
                  </div>

                  {/* Winner */}
                  {entry.winnerId && (
                    <p className="text-sm font-semibold text-green-60 dark:text-green-50 mt-3">
                      🏆 Winner Vehicle ID: {entry.winnerId}
                    </p>
                  )}

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Fade animation */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default CompareHistory;
