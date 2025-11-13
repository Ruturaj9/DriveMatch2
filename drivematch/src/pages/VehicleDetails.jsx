import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CompareContext } from "../context/CompareContext";
import ReviewsSection from "../components/ReviewsSection";
import { Fuel, Gauge, Settings, Sparkles, Zap } from "lucide-react";
import VehicleCard from "../components/VehicleCard"; // ← using unified card

const VehicleDetails = () => {
  const { id } = useParams();
  const { addVehicleToRoom } = useContext(CompareContext);

  const [vehicle, setVehicle] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(1);

  // Fetch main vehicle + similar vehicles
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

  // Add to compare with toast feedback
  const handleAddToCompare = () => {
    if (!vehicle) return;

    addVehicleToRoom(selectedRoom, vehicle);

    // Small toast
    const toast = document.createElement("div");
    toast.textContent = `${vehicle.name} added to Room ${selectedRoom}`;
    toast.className =
      "fixed bottom-6 right-6 bg-blue-60 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999]";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 flex flex-col items-center justify-center gap-4 px-6">
        <div className="animate-pulse bg-neutral-90 dark:bg-neutral-20 w-2/3 h-10 rounded-lg" />
        <div className="animate-pulse bg-neutral-90 dark:bg-neutral-20 w-1/2 h-6 rounded-lg" />
        <div className="animate-pulse bg-neutral-90 dark:bg-neutral-20 w-2/3 h-80 rounded-2xl" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-40 dark:text-neutral-70">
        Vehicle not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-6">

        {/* ----------------------- */}
        {/* 🖼 IMAGE + MAIN DETAILS */}
        {/* ----------------------- */}
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
            className="w-full md:w-1/2 h-80 object-cover rounded-2xl shadow-lg bg-neutral-90 dark:bg-neutral-30"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-60 dark:text-blue-40 mb-1">
              {vehicle.name}
            </h1>

            <p className="text-neutral-40 dark:text-neutral-70 text-lg">
              {vehicle.brand} • {vehicle.type?.toUpperCase()}
            </p>

            <p className="text-2xl font-bold text-green-60 mt-2 mb-6">
              ₹{vehicle.price?.toLocaleString()}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6 text-neutral-20 dark:text-neutral-90">
              <div className="flex items-center gap-2"><Sparkles size={16} /> Engine: {vehicle.engine || "N/A"}</div>
              <div className="flex items-center gap-2"><Fuel size={16} /> Fuel: {vehicle.fuelType || "N/A"}</div>
              <div className="flex items-center gap-2"><Settings size={16} /> Transmission: {vehicle.transmission || "N/A"}</div>
              <div className="flex items-center gap-2"><Gauge size={16} /> Mileage: {vehicle.mileage || "N/A"}</div>
              <div className="flex items-center gap-2"><Zap size={16} /> Performance: {vehicle.performanceScore ?? "N/A"}</div>
            </div>

            {/* Compare Button */}
            <div className="mt-3 flex items-center gap-3">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(Number(e.target.value))}
                className="border border-neutral-80 dark:border-neutral-40 bg-white dark:bg-neutral-20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-60"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>Room {r}</option>
                ))}
              </select>

              <button
                onClick={handleAddToCompare}
                className="bg-blue-60 hover:bg-blue-70 text-white px-5 py-2 rounded-lg text-sm transition font-medium"
              >
                + Add to Compare
              </button>
            </div>
          </div>
        </motion.div>

        {/* ----------------------- */}
        {/* ⭐ FEATURES */}
        {/* ----------------------- */}
        {vehicle.features?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-neutral-20 dark:text-neutral-90 mb-3">
              Key Features
            </h2>

            <ul className="list-disc list-inside text-neutral-40 dark:text-neutral-70 grid sm:grid-cols-2 gap-x-6">
              {vehicle.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ----------------------- */}
        {/* 🚘 SIMILAR VEHICLES */}
        {/* ----------------------- */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-20 dark:text-neutral-90 mb-6">
            Compare with Similar Vehicles
          </h2>

          {similar.length === 0 ? (
            <p className="text-neutral-50 dark:text-neutral-70">
              No similar vehicles found.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {similar.map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </div>
          )}
        </div>

        {/* ----------------------- */}
        {/* ⭐ REVIEWS SECTION */}
        {/* ----------------------- */}
        <ReviewsSection vehicleId={vehicle._id} />
      </div>

      {/* Toast Animation */}
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

export default VehicleDetails;
