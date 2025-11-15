// src/pages/VehicleDetails.jsx
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CompareContext } from "../context/CompareContext";
import ReviewsSection from "../components/ReviewsSection";
import { Fuel, Gauge, Settings, Sparkles, Zap } from "lucide-react";
import VehicleCard from "../components/VehicleCard";

const VehicleDetails = () => {
  const { id } = useParams();
  const { addVehicleToRoom } = useContext(CompareContext);

  const [vehicle, setVehicle] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(1);

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

  const handleAddToCompare = () => {
    if (!vehicle) return;

    addVehicleToRoom(selectedRoom, vehicle);

    const toast = document.createElement("div");
    toast.textContent = `${vehicle.name} added to Room ${selectedRoom}`;
    toast.className =
      "fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999]";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col items-center justify-center gap-4 px-6">
        <div className="animate-pulse bg-[var(--color-text)]/20 w-2/3 h-10 rounded-lg" />
        <div className="animate-pulse bg-[var(--color-text)]/20 w-1/2 h-6 rounded-lg" />
        <div className="animate-pulse bg-[var(--color-text)]/20 w-2/3 h-80 rounded-2xl" />
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

        {/* IMAGE + MAIN DETAILS */}
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

            <p className="text-[var(--color-text)]/70 text-lg">
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

            {/* COMPARE */}
            <div className="mt-3 flex items-center gap-3">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(Number(e.target.value))}
                className="border border-[var(--color-text)]/30 bg-[var(--color-bg)] rounded-lg px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    Room {r}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddToCompare}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm transition font-medium"
              >
                + Add to Compare
              </button>
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
        © {new Date().getFullYear()} <span className="font-semibold text-blue-600">DriveMatch</span>. All Rights Reserved.
      </footer>
    </div>
  );
};

/* ------------------------------------------
   SMALL SPEC CELL COMPONENT
-------------------------------------------- */
const Spec = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon size={16} className="text-blue-600" /> {label}: {value || "N/A"}
  </div>
);

/* ------------------------------------------
   COMPARISON TABLE COMPONENT
-------------------------------------------- */
const ComparisonTable = ({ vehicle, similar }) => {
  const fields = [
    ["Brand", "brand"],
    ["Type", "type"],
    ["Variant", "variant"],
    ["Model Year", "modelYear"],
    ["Price", "price", (v) => `₹${v?.toLocaleString()}`],
    ["On-Road Price", "onRoadPrice", (v) => (v ? `₹${v.toLocaleString()}` : "N/A")],
    ["Engine", "engine"],
    ["Engine Power", "enginePower"],
    ["Torque", "torque"],
    ["Fuel Type", "fuelType"],
    ["Mileage", "mileage"],
    ["Transmission", "transmission"],
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
    ["Performance Score", "performanceScore"],
    ["Eco Score", "ecoScore"],
    ["Status", "availabilityStatus"],
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
              <th className="py-3 px-4 font-semibold w-48">Specification</th>
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
                  <td key={v._id} className="py-3 px-4">
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
