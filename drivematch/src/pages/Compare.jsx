import { useContext } from "react";
import { CompareContext } from "../context/CompareContext";
import {
  Car,
  Fuel,
  Zap,
  Settings,
  DollarSign,
  Trophy,
} from "lucide-react";

const parseNumber = (val) => {
  if (val == null) return NaN;
  if (typeof val === "number") return val;
  const s = String(val).replace(/[, ]+/g, "").match(/[\d.]+/);
  return s ? parseFloat(s[0]) : NaN;
};

const Compare = () => {
  const {
    rooms,
    removeVehicleFromRoom,
    clearRoom,
    createNewRoom
  } = useContext(CompareContext);

  const showToast = (msg, error = false) => {
    const t = document.createElement("div");
    t.textContent = msg;
    t.className =
      `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999] ${
        error ? "bg-red-600" : "bg-blue-600"
      } text-white`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  const highlight = (vehicles, key, lower = false) => {
    if (!vehicles?.length) return () => "";
    const nums = vehicles.map((v) => parseNumber(v[key]));
    const valid = nums.filter((n) => Number.isFinite(n));
    if (!valid.length) return () => "";
    const best = lower ? Math.min(...valid) : Math.max(...valid);
    return (val) =>
      parseNumber(val) === best ? "text-green-600 font-semibold" : "";
  };

  const computeWinners = (vehicles) => {
    if (vehicles.length < 2) return null;

    const bestBudget = [...vehicles].sort(
      (a, b) => parseNumber(a.price) - parseNumber(b.price)
    )[0];

    const bestMileage = [...vehicles].sort(
      (a, b) => parseNumber(b.mileage) - parseNumber(a.mileage)
    )[0];

    const bestPerformance = [...vehicles].sort(
      (a, b) =>
        parseNumber(b.performanceScore) - parseNumber(a.performanceScore)
    )[0];

    return {
      bestBudget,
      bestMileage,
      bestPerformance,
    };
  };

  // NEW: Additional fields to extend table
  const extraFields = [
    ["Variant", "variant"],
    ["Model Year", "modelYear"],
    ["Drive Type", "driveType"],
    ["Top Speed", "topSpeed"],
    ["Acceleration", "acceleration"],
    ["Emission Norm", "emissionNorm"],
    ["Charging Time", "chargingTime"],
    ["Battery Capacity", "batteryCapacity"],
    ["Seating Capacity", "seatingCapacity"],
    ["Boot Space", "bootSpace"],
    ["Fuel Tank Capacity", "fuelTankCapacity"],
    ["Kerb Weight", "kerbWeight"],
    ["Ground Clearance", "groundClearance"],
    ["Wheelbase", "wheelbase"],
    ["Body Type", "bodyType"],
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 py-10 transition">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600">
            ⚖️ Compare Vehicles
          </h1>

          <button
            onClick={() => {
              createNewRoom();
              showToast("New room created!");
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Add Room
          </button>
        </div>

        {Object.keys(rooms).map((roomId) => {
          const vehicles = rooms[roomId];
          const winners = computeWinners(vehicles);

          const priceH = highlight(vehicles, "price", true);
          const mileageH = highlight(vehicles, "mileage");
          const perfH = highlight(vehicles, "performanceScore");

          const roomType = vehicles[0]?.type?.toUpperCase() || "Empty";

          return (
            <div key={roomId} className="mb-14">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Room {roomId} •{" "}
                  <span className="opacity-70">({roomType})</span>
                </h2>

                <button
                  onClick={() => {
                    clearRoom(roomId);
                    showToast(`Room ${roomId} cleared`);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  🗑 Clear
                </button>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-xl bg-[var(--color-bg)]/40 opacity-70">
                  Room is empty
                </div>
              ) : (
                <>
                  {winners && (
                    <div className="mb-4 p-4 rounded-lg bg-blue-600/10 border border-blue-600/30 text-sm">
                      <p className="font-semibold mb-1">🏆 Winner Summary</p>

                      <div className="flex flex-wrap gap-3">
                        <p>💰 <b>Budget Winner:</b> {winners.bestBudget?.name}</p>
                        <p>⛽ <b>Mileage Winner:</b> {winners.bestMileage?.name}</p>
                        <p>⚡ <b>Performance Winner:</b> {winners.bestPerformance?.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    {vehicles.map((v) => (
                      <div
                        key={v._id}
                        className="rounded-xl p-4 border bg-[var(--color-bg)] shadow relative"
                      >
                        <button
                          className="absolute right-4 top-3 text-red-500"
                          onClick={() => {
                            removeVehicleFromRoom(roomId, v._id);
                            showToast(`${v.name} removed`);
                          }}
                        >
                          ✖
                        </button>

                        <img
                          src={v.image || "/placeholder.jpg"}
                          onError={handleImageError}
                          className="w-full h-40 object-cover rounded-xl mb-2"
                        />

                        <h3 className="font-bold">{v.name}</h3>
                        <p className="opacity-70">{v.brand}</p>

                        <p className="text-xs mt-1 px-2 py-1 rounded bg-blue-600/10 text-blue-600 inline-block">
                          {v.type?.toUpperCase()}
                        </p>

                        <p className="text-blue-600 font-semibold mt-1">
                          ₹{v.price?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {vehicles.length > 1 && (
                    <div className="overflow-x-auto border rounded-xl bg-[var(--color-bg)] shadow">
                      <table className="w-full text-sm">
                        <thead className="bg-[var(--color-text)]/10">
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
                          {/* ORIGINAL SPECS */}
                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2">
                              <Car size={16} /> Brand
                            </td>
                            {vehicles.map((v) => (
                              <td key={v._id} className="p-3 text-center">
                                {v.brand}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2">
                              <DollarSign size={16} /> Price
                            </td>
                            {vehicles.map((v) => (
                              <td
                                key={v._id}
                                className={`p-3 text-center ${priceH(v.price)}`}
                              >
                                ₹{v.price?.toLocaleString()}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2">
                              <Fuel size={16} /> Mileage
                            </td>
                            {vehicles.map((v) => (
                              <td
                                key={v._id}
                                className={`p-3 text-center ${mileageH(v.mileage)}`}
                              >
                                {v.mileage}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2">
                              <Zap size={16} /> Performance
                            </td>
                            {vehicles.map((v) => (
                              <td
                                key={v._id}
                                className={`p-3 text-center ${perfH(v.performanceScore)}`}
                              >
                                {v.performanceScore}
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="p-3 font-medium flex items-center gap-2">
                              <Settings size={16} /> Transmission
                            </td>
                            {vehicles.map((v) => (
                              <td key={v._id} className="p-3 text-center">
                                {v.transmission}
                              </td>
                            ))}
                          </tr>

                          {/* -----------------------------------------------
                               EXTRA 15 SPECIFICATIONS (ADDED BELOW)
                             ----------------------------------------------- */}
                          {extraFields.map(([label, key]) => (
                            <tr key={key}>
                              <td className="p-3 font-medium">{label}</td>

                              {vehicles.map((v) => (
                                <td key={v._id} className="p-3 text-center">
                                  {v[key] || "N/A"}
                                </td>
                              ))}
                            </tr>
                          ))}

                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

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
