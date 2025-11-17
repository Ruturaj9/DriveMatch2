// src/pages/VehicleDetails.jsx
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CompareContext } from "../context/CompareContext";
import { AuthContext } from "../context/AuthContext"; // ⭐ added
import ReviewsSection from "../components/ReviewsSection";
import { Fuel, Gauge, Settings, Sparkles, Zap, Heart } from "lucide-react";
import VehicleCard from "../components/VehicleCard";

const VehicleDetails = () => {
  const { id } = useParams();
  const { addVehicleToRoom, rooms } = useContext(CompareContext);
  const { isAuthenticated, favorites, toggleFavorite } = useContext(AuthContext); // ⭐ added

  const [vehicle, setVehicle] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI selected room
  const [selectedRoom, setSelectedRoom] = useState("1");

  // ⭐ Toast helper
  const showToast = (msg, error = false) => {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999] ${
      error ? "bg-red-600" : "bg-blue-600"
    } text-white`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  // ⭐ Check if vehicle is favorited (safe if favorites is undefined)
  const isFav = (vid) =>
    Array.isArray(favorites) && favorites.some((v) => String(v._id) === String(vid));

  // ⭐ Click handler for favorite button (wired to AuthContext.toggleFavorite)
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      showToast("Login to save favorites", true);
      return;
    }

    try {
      const res = await toggleFavorite(vehicle._id);
      // toggleFavorite returns { success: boolean, loginRequired?: boolean } in AuthContext
      if (res?.loginRequired) {
        showToast("Login required to manage favorites", true);
        return;
      }
      if (res?.success) {
        // After toggleFavorite, AuthContext.loadFavorites refreshes favorites;
        // isFav may update shortly after — show a best-effort message.
        showToast(isFav(vehicle._id) ? "Removed from favorites" : "Added to favorites");
      } else {
        showToast("Failed to update favorites", true);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
      showToast("Error updating favorite", true);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [veh, sim] = await Promise.all([
          axios.get(`http://localhost:5000/api/vehicles/${id}`),
          axios.get(`http://localhost:5000/api/vehicles/similar/${id}`),
        ]);

        setVehicle(veh.data);
        setSimilar(sim.data?.similar || []);
      } catch (err) {
        console.error("Error fetching vehicle data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  // Add to compare
  const handleAddToCompare = () => {
    if (!vehicle) return;

    const result = addVehicleToRoom(String(selectedRoom), vehicle);

    if (!result.ok) {
      if (result.error === "TYPE_MISMATCH") {
        const existing = rooms[selectedRoom]?.[0]?.type?.toUpperCase() || "Unknown";
        showToast(
          `❌ Cannot add. "${vehicle.type}" cannot be compared with "${existing}".`,
          true
        );
      } else {
        showToast("Failed to add vehicle.", true);
      }
      return;
    }

    showToast(`${vehicle.name} added to Room ${selectedRoom}`);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  // Room compatibility
  const isRoomCompatible = (roomVehicles) => {
    if (!roomVehicles || roomVehicles.length === 0) return true;
    return roomVehicles[0].type?.toLowerCase() === vehicle?.type?.toLowerCase();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        Loading...
      </div>
    );

  if (!vehicle)
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        Vehicle not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* IMAGE + MAIN */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col md:flex-row gap-10 mb-12"
        >
          <img
            src={vehicle.image || "/placeholder.jpg"}
            onError={handleImageError}
            alt={vehicle.name}
            className="w-full md:w-1/2 h-80 object-cover rounded-2xl shadow-lg bg-[var(--color-text)]/15"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-600 mb-1">
              {vehicle.name}
            </h1>

            <p className="opacity-80 text-lg">
              {vehicle.brand} • {vehicle.type?.toUpperCase()}
            </p>

            <p className="text-2xl font-bold text-green-600 mt-2 mb-6">
              ₹{vehicle.price?.toLocaleString()}
            </p>

            {/* SPECS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6">
              <Spec icon={Sparkles} label="Engine" value={vehicle.engine} />
              <Spec icon={Fuel} label="Fuel" value={vehicle.fuelType} />
              <Spec icon={Settings} label="Transmission" value={vehicle.transmission} />
              <Spec icon={Gauge} label="Mileage" value={vehicle.mileage} />
              <Spec icon={Zap} label="Performance" value={vehicle.performanceScore} />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3 mt-4">
              {/* Compare */}
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="border border-[var(--color-text)]/30 bg-[var(--color-bg)] rounded-lg px-3 py-2 text-sm"
              >
                {Object.keys(rooms).map((r) => {
                  const roomVehicles = rooms[r];
                  const first = roomVehicles[0];
                  const typeLabel = first ? first.type.toUpperCase() : "Empty";
                  const disabled = !isRoomCompatible(roomVehicles);

                  return (
                    <option key={r} value={r} disabled={disabled}>
                      Room {r} ({typeLabel})
                      {disabled ? " - Not compatible" : ""}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={handleAddToCompare}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition font-medium"
              >
                + Add to Compare
              </button>

              {/* ⭐ FAVORITE BUTTON (only show if logged in) */}
              {isAuthenticated && (
                <button
                  onClick={handleFavorite}
                  className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  aria-label={isFav(vehicle._id) ? "Remove favorite" : "Add favorite"}
                  title={isFav(vehicle._id) ? "Remove favorite" : "Add favorite"}
                >
                  <Heart
                    size={24}
                    className={
                      isFav(vehicle._id)
                        ? "text-red-500 fill-red-500"
                        : "text-neutral-500 dark:text-neutral-300"
                    }
                  />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* SIMILAR VEHICLES */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Compare with Similar Vehicles</h2>

          {similar.length === 0 ? (
            <p>No similar vehicles found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {similar.map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </div>
          )}
        </div>

        {/* COMPARISON TABLE */}
        {similar.length > 0 && (
          <ComparisonTable vehicle={vehicle} similar={similar} />
        )}

        {/* REVIEWS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-xl font-semibold mb-4">User Reviews & Ratings</h2>

          <div className="rounded-2xl border border-[var(--color-text)]/30 bg-[var(--color-bg)]/40 shadow-lg p-6 transition">
            <ReviewsSection vehicleId={vehicle._id} />
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-6 mt-12 opacity-70 text-sm">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-blue-600">DriveMatch</span>. All Rights Reserved.
      </footer>
    </div>
  );
};

/* ------------------------------------------
   SMALL SPEC CELL
-------------------------------------------- */
const Spec = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon size={16} className="text-blue-600" /> {label}: {value || "N/A"}
  </div>
);

/* ------------------------------------------
   COMPARISON TABLE
-------------------------------------------- */
const ComparisonTable = ({ vehicle, similar }) => {
  const fields = [
    ["Brand", "brand"],
    ["Type", "type"],
    ["Price", "price", (v) => `₹${v?.toLocaleString()}`],
    ["Engine", "engine"],
    ["Engine Power", "enginePower"],
    ["Torque", "torque"],
    ["Mileage", "mileage"],
    ["Transmission", "transmission"],
    ["Performance Score", "performanceScore"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16"
    >
      <h2 className="text-xl font-semibold mb-4">Detailed Comparison Table</h2>

      <div className="overflow-x-auto rounded-2xl shadow-xl border border-[var(--color-text)]/30 bg-[var(--color-bg)]/40">
        <table className="min-w-[950px] w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-text)]/10">
              <th className="py-3 px-4 font-semibold w-48">Spec</th>
              <th className="py-3 px-4 font-semibold text-blue-600">{vehicle.name}</th>

              {similar.map((v) => (
                <th key={v._id} className="py-3 px-4 font-semibold text-blue-600">
                  {v.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {fields.map(([label, key, format]) => (
              <tr key={key} className="hover:bg-[var(--color-text)]/5 transition">
                <td className="py-3 px-4 font-semibold">{label}</td>

                <td className="py-3 px-4">
                  {format ? format(vehicle[key]) : vehicle[key] || "N/A"}
                </td>

                {similar.map((v) => (
                  <td key={v._1d} className="py-3 px-4">
                    {format ? format(v[key]) : v[key] || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default VehicleDetails;
