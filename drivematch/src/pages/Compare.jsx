import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CompareContext } from "../context/CompareContext";
import {
  Car,
  Fuel,
  Zap,
  Settings,
  DollarSign,
  Trophy,
  MessageSquareText,
  Gauge,
} from "lucide-react";

const parseNumber = (val) => {
  if (val == null) return NaN;
  if (typeof val === "number") return val;
  const s = String(val).replace(/[, ]+/g, "").match(/[\d.]+/);
  return s ? parseFloat(s[0]) : NaN;
};

const Compare = () => {
  const { rooms, removeVehicleFromRoom, clearRoom } = useContext(CompareContext);
  const [backendVerdicts, setBackendVerdicts] = useState({});
  const [loadingRooms, setLoadingRooms] = useState({});

  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className =
      "fixed bottom-6 right-6 bg-blue-60 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999]";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  const highlight = (vehicles, key, lower = false) => {
    const nums = vehicles.map((v) => parseNumber(v[key]));
    const valid = nums.filter((x) => Number.isFinite(x));
    if (!valid.length) return () => "";

    const best = lower ? Math.min(...valid) : Math.max(...valid);

    return (val) => (parseNumber(val) === best ? "text-green-60 font-semibold" : "");
  };

  // 🧠 Local fallback (only used if backend fails)
  const analyzeLocally = (vehicles) => {
    const parsed = vehicles.map((v) => ({
      id: v._id,
      name: v.name,
      price: parseNumber(v.price),
      mileage: parseNumber(v.mileage),
      perf: parseNumber(v.performanceScore),
    }));

    const maxM = Math.max(...parsed.map((p) => p.mileage || 0));
    const maxPerf = Math.max(...parsed.map((p) => p.perf || 0));
    const minPrice = Math.min(...parsed.map((p) => p.price || Infinity));

    parsed.forEach((v) => {
      const score =
        (v.mileage / maxM) * 0.4 +
        (v.perf / maxPerf) * 0.4 +
        (minPrice / v.price) * 0.2;
      v.score = score;
    });

    const best = parsed.reduce((a, b) => (b.score > a.score ? b : a), parsed[0]);

    return {
      verdict: `💬 Based on mileage, performance, and value, ${best.name} offers the best overall balance.`,
      winnerId: best.id,
    };
  };

  const fetchVerdict = async (roomNumber, vehicles) => {
    try {
      setLoadingRooms((p) => ({ ...p, [roomNumber]: true }));
      const res = await axios.post("http://localhost:5000/api/compare/ai-verdict", {
        vehicles,
      });

      setBackendVerdicts((p) => ({
        ...p,
        [roomNumber]: {
          verdict: res.data.verdict,
          winnerId: res.data.winnerId,
        },
      }));

      await axios.post("http://localhost:5000/api/compare/save", {
        roomNumber,
        vehicles,
        verdict: res.data.verdict,
        winnerId: res.data.winnerId,
        userId: "guest",
      });
    } catch (err) {
      console.error("AI verdict failed:", err);
      setBackendVerdicts((p) => ({
        ...p,
        [roomNumber]: analyzeLocally(vehicles),
      }));
    } finally {
      setLoadingRooms((p) => ({ ...p, [roomNumber]: false }));
    }
  };

  // Trigger verdict when vehicles change
  useEffect(() => {
    for (const key of Object.keys(rooms)) {
      const vehicles = rooms[key];
      if (vehicles.length >= 2 && !backendVerdicts[key]) {
        fetchVerdict(key, vehicles);
      }
    }
  }, [rooms]);

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-60 dark:text-blue-40 text-center mb-10">
          ⚖️ Compare Vehicles
        </h1>

        {Object.keys(rooms).map((room) => {
          const vehicles = rooms[room];
          const verdict = backendVerdicts[room]?.verdict || "";
          const winnerId = backendVerdicts[room]?.winnerId;

          const priceH = highlight(vehicles, "price", true);
          const mileageH = highlight(vehicles, "mileage");
          const perfH = highlight(vehicles, "performanceScore");

          return (
            <div key={room} className="mb-14">

              {/* Room Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-neutral-20 dark:text-neutral-90">
                  Room {room}
                </h2>

                <button
                  onClick={() => {
                    clearRoom(room);
                    showToast(`Cleared Room ${room}`);
                  }}
                  className="text-red-60 hover:text-red-70 text-sm font-medium"
                >
                  🗑 Clear Room
                </button>
              </div>

              {/* Empty Room */}
              {vehicles.length === 0 ? (
                <div className="text-center py-14 rounded-xl border border-dashed border-neutral-85 dark:border-neutral-40 text-neutral-40 dark:text-neutral-70">
                  No vehicles added in this room.
                </div>
              ) : (
                <>
                  {/* Cards */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    {vehicles.map((v) => (
                      <div
                        key={v._id}
                        className={`rounded-2xl p-4 shadow-md border transition hover:shadow-lg ${
                          v._id === winnerId
                            ? "border-yellow-60 bg-yellow-60/10"
                            : "border-neutral-85 dark:border-neutral-40 bg-white dark:bg-neutral-20"
                        }`}
                      >
                        <button
                          className="absolute right-4 top-3 text-red-60 hover:text-red-70"
                          onClick={() => {
                            removeVehicleFromRoom(room, v._id);
                            showToast(`Removed ${v.name}`);
                          }}
                        >
                          ✖
                        </button>

                        <img
                          src={v.image || "/placeholder.jpg"}
                          onError={handleImageError}
                          className="w-full h-40 object-cover rounded-xl mb-3"
                        />

                        <h3 className="text-lg font-bold text-neutral-20 dark:text-neutral-90">
                          {v.name}
                        </h3>
                        <p className="text-neutral-40 dark:text-neutral-70">{v.brand}</p>
                        <p className="text-blue-60 dark:text-blue-40 font-semibold mt-1">
                          ₹{v.price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Table */}
                  {vehicles.length > 1 && (
                    <div className="overflow-x-auto rounded-xl border border-neutral-85 dark:border-neutral-40 bg-white dark:bg-neutral-20 shadow-md">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-90 dark:bg-neutral-30">
                          <tr>
                            <th className="p-3 text-left">Specification</th>
                            {vehicles.map((v) => (
                              <th key={v._id} className="p-3 text-center">
                                {v.name}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {/* Winner Row */}
                          <tr className="bg-yellow-60/10">
                            <td className="p-3 font-medium text-yellow-70 flex items-center gap-2">
                              <Trophy size={16} /> Winner
                            </td>
                            {vehicles.map((v) => (
                              <td className="p-3 text-center" key={v._id}>
                                {v._id === winnerId ? (
                                  <Trophy className="text-yellow-60" size={18} />
                                ) : (
                                  "—"
                                )}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2"><Car size={16}/> Brand</td>
                            {vehicles.map((v)=>(
                              <td key={v._id} className="p-3 text-center">{v.brand}</td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2"><DollarSign size={16}/> Price</td>
                            {vehicles.map((v)=>(
                              <td key={v._id} className={`p-3 text-center ${priceH(v.price)}`}>
                                ₹{v.price?.toLocaleString()}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2"><Fuel size={16}/> Mileage</td>
                            {vehicles.map((v)=>(
                              <td key={v._id} className={`p-3 text-center ${mileageH(v.mileage)}`}>
                                {v.mileage}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2"><Zap size={16}/> Performance</td>
                            {vehicles.map((v)=>(
                              <td key={v._id} className={`p-3 text-center ${perfH(v.performanceScore)}`}>
                                {v.performanceScore}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2"><Settings size={16}/> Transmission</td>
                            {vehicles.map((v)=>(
                              <td key={v._id} className="p-3 text-center">{v.transmission}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Verdict Section */}
                  {loadingRooms[room] ? (
                    <div className="mt-4 text-center text-neutral-40 dark:text-neutral-70">
                      ⏳ Generating AI verdict...
                    </div>
                  ) : verdict ? (
                    <div className="mt-4 bg-blue-60/10 border border-blue-60/40 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-70 dark:text-blue-40">
                      <MessageSquareText size={18} />
                      <span>{verdict}</span>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}

        {/* Toast animation */}
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
    </div>
  );
};

export default Compare;
