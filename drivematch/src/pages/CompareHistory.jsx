import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trophy, MessageSquareText, Trash2, Eye } from "lucide-react";
import { CompareContext } from "../context/CompareContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const CompareHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addVehicleToRoom, createNewRoom } = useContext(CompareContext);
  const { theme } = useContext(ThemeContext);

  const navigate = useNavigate();

  // Toast
  const toast = (msg, error = false) => {
    const t = document.createElement("div");
    t.textContent = msg;
    t.className = `
      fixed bottom-6 right-6 px-4 py-2 rounded-lg text-white shadow-lg z-[9999]
      animate-fade-in-out text-sm
      ${error ? "bg-red-600" : "bg-blue-600"}
    `;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  // Fetch history
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/compare/history/guest")
      .then((res) => setHistory(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Delete single item
  const deleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/compare/history/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
      toast("Deleted from history");
    } catch (err) {
      toast("Delete failed", true);
    }
  };

  // Clear all
  const clearAll = async () => {
    try {
      await axios.delete("http://localhost:5000/api/compare/history");
      setHistory([]);
      toast("All history cleared");
    } catch (err) {
      toast("Failed to clear", true);
    }
  };

  // View comparison again
  const viewAgain = (entry) => {
    if (!Array.isArray(entry.vehicles)) {
      toast("Old entry - No vehicles saved", true);
      return;
    }

    const newRoom = createNewRoom();
    entry.vehicles.forEach((v) => addVehicleToRoom(newRoom, v));

    navigate("/compare");
  };

  return (
    <div
      className={`
        min-h-screen px-6 py-10 transition-colors
        ${theme === "dark" ? "bg-neutral-10 text-neutral-90" : "bg-neutral-98 text-neutral-20"}
      `}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            📜 Compare History
          </h1>

          {history.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20 text-neutral-50 dark:text-neutral-60">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-neutral-50 dark:text-neutral-60 text-lg mt-12">
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
                  className={`
                    rounded-2xl border shadow-md p-5 transition
                    ${theme === "dark"
                      ? "bg-neutral-20 border-neutral-40"
                      : "bg-white border-neutral-85"}
                  `}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Trophy size={18} /> Room {entry.roomNumber}
                    </h3>

                    <p className="text-xs flex items-center gap-1 opacity-70">
                      <Clock size={14} />
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Vehicle list */}
                  {Array.isArray(entry.vehicles) ? (
                    <div className="flex gap-4 mb-4">
                      {entry.vehicles.map((v) => (
                        <div
                          key={v._id}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl border
                            ${theme === "dark"
                              ? "bg-neutral-30 border-neutral-50"
                              : "bg-neutral-95 border-neutral-80"}
                          `}
                        >
                          <img
                            src={v.image || "/placeholder.jpg"}
                            className="w-16 h-12 object-cover rounded-lg"
                            alt={v.name}
                          />
                          <div>
                            <p className="font-semibold">{v.name}</p>
                            <p className="text-xs opacity-70">{v.brand}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic opacity-70 mb-4">
                      (Old entry — No vehicle details stored)
                    </p>
                  )}

                  {/* Verdict */}
                  <div
                    className={`
                      rounded-xl flex items-start gap-3 text-sm p-4 mb-3
                      ${theme === "dark"
                        ? "bg-blue-900/20 border border-blue-700/40 text-blue-300"
                        : "bg-blue-600/10 border border-blue-600/40 text-blue-700"}
                    `}
                  >
                    <MessageSquareText size={18} className="mt-0.5" />
                    <span>{entry.verdict}</span>
                  </div>

                  {/* Winner */}
                  {entry.winnerId && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                      🏆 Winner:{" "}
                      {entry.vehicles?.find((v) => v._id === entry.winnerId)?.name ||
                        "Unknown"}
                    </p>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 mt-4">
                    {/* View Again */}
                    <button
                      onClick={() => viewAgain(entry)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 text-sm"
                    >
                      <Eye size={16} /> View Again
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteOne(entry._id)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center gap-2 hover:bg-red-700 text-sm"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

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
