// src/pages/CompareHistory.jsx
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

  const { addVehicleToRoom, createNewRoom, getRooms, rooms: roomsFromContext } =
    useContext(CompareContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

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

  const getRoomsSafe = () => {
    try {
      if (typeof getRooms === "function") return getRooms() || {};
      if (roomsFromContext && typeof roomsFromContext === "object") return roomsFromContext;
      return {};
    } catch {
      return roomsFromContext || {};
    }
  };

  const fetchFullVehicle = async (v) => {
    if (typeof v === "object") return v;
    try {
      const res = await axios.get(`http://localhost:5000/api/vehicles/${v}`);
      return res.data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/compare/history", {
          withCredentials: true,
        });

        const enriched = await Promise.all(
          res.data.map(async (entry) => {
            const vehicles = await Promise.all(entry.vehicles.map(fetchFullVehicle));
            return { ...entry, vehicles: vehicles.filter(Boolean) };
          })
        );

        const seen = new Set();
        const deduped = enriched.filter((entry) => {
          const key = entry.vehicles.map((v) => v._id).sort().join("-");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!cancelled) setHistory(deduped);
      } catch (err) {
        if (err.response?.status === 401) {
          toast("You must be logged in to view history.", true);
          // Optionally redirect:
          // navigate("/login");
        } else {
          toast("Failed to load history", true);
        }
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sameSet = (a = [], b = []) => {
    const A = a.map(String).sort();
    const B = b.map(String).sort();
    return A.length === B.length && A.every((x, i) => x === B[i]);
  };

  const viewAgain = async (entry) => {
    try {
      const vehicles = entry.vehicles;
      if (!vehicles.length) return toast("Invalid history entry", true);

      const ids = vehicles.map((v) => String(v._id));
      const rooms = getRoomsSafe();

      for (const key of Object.keys(rooms)) {
        const roomIds = rooms[key].map((v) => String(v._id));
        if (sameSet(roomIds, ids)) {
          navigate("/compare");
          return;
        }
      }

      for (const key of Object.keys(rooms)) {
        if (rooms[key].length === 0) {
          vehicles.forEach((v) => addVehicleToRoom(key, v, true));
          navigate("/compare");
          return;
        }
      }

      const newRoom = createNewRoom();
      vehicles.forEach((v) => addVehicleToRoom(newRoom, v, true));
      navigate("/compare");
    } catch (err) {
      toast("Failed to restore", true);
    }
  };

  const deleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/compare/history/${id}`, {
        withCredentials: true,
      });
      setHistory((prev) => prev.filter((h) => h._id !== id));
      toast("Deleted");
    } catch {
      toast("Delete failed", true);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete("http://localhost:5000/api/compare/history", {
        withCredentials: true,
      });
      setHistory([]);
      toast("All history cleared");
    } catch {
      toast("Failed to clear", true);
    }
  };

  return (
    <div
      className={`min-h-screen px-6 py-10 transition-colors ${
        theme === "dark" ? "bg-neutral-10 text-neutral-90" : "bg-neutral-98 text-neutral-20"
      }`}
    >
      <div className="max-w-5xl mx-auto">
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
                  className={`rounded-2xl border shadow-md p-5 transition ${
                    theme === "dark"
                      ? "bg-neutral-20 border-neutral-40"
                      : "bg-white border-neutral-85"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Trophy size={18} /> Room {entry.roomNumber}
                    </h3>
                    <p className="text-xs flex items-center gap-1 opacity-70">
                      <Clock size={14} />
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  <div className="flex gap-4 mb-4">
                    {entry.vehicles.map((v, idx) => {
                      const imgSrc =
                        v.image?.startsWith("http") || v.image?.startsWith("/")
                          ? v.image
                          : `http://localhost:5000${v.image || ""}`;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            theme === "dark"
                              ? "bg-neutral-30 border-neutral-50"
                              : "bg-neutral-95 border-neutral-80"
                          }`}
                        >
                          <img
                            src={imgSrc || "/placeholder.jpg"}
                            alt={v.name || "Vehicle"}
                            className="w-16 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                          <div>
                            <p className="font-semibold">{v.name}</p>
                            <p className="text-xs opacity-70">{v.brand}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`rounded-xl flex items-start gap-3 text-sm p-4 mb-3 ${
                      theme === "dark"
                        ? "bg-blue-900/20 border border-blue-700/40 text-blue-300"
                        : "bg-blue-600/10 border border-blue-600/40 text-blue-700"
                    }`}
                  >
                    <MessageSquareText size={18} className="mt-0.5" />
                    <span style={{ whiteSpace: "pre-wrap" }}>{entry.verdict}</span>
                  </div>

                  {entry.winnerId && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                      🏆 Winner:{" "}
                      {
                        entry.vehicles.find(
                          (v) => String(v._id) === String(entry.winnerId)
                        )?.name || "Unknown"
                      }
                    </p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => viewAgain(entry)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 text-sm"
                    >
                      <Eye size={16} /> View Again
                    </button>
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
