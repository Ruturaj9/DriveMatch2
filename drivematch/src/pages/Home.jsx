import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCcw } from "lucide-react";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000000);
  const [loading, setLoading] = useState(true);

  // ───────────────────────────────────────
  // Fetch trending vehicles
  // ───────────────────────────────────────
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicles/trending")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error fetching vehicles:", err))
      .finally(() => setLoading(false));
  }, []);

  // ───────────────────────────────────────
  // Apply filters (memoized for performance)
  // ───────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.brand.toLowerCase().includes(search.toLowerCase());

      const matchesType = type === "all" || v.type === type;

      const matchesPrice =
        v.price >= minPrice && v.price <= maxPrice;

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [vehicles, search, type, minPrice, maxPrice]);

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setType("all");
    setMinPrice(0);
    setMaxPrice(20000000);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  // ───────────────────────────────────────
  // UI Starts Here
  // ───────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 transition-colors">

      {/* 🌠 HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-50 via-blue-60 to-purple-60 text-neutral-98 py-20 text-center shadow-lg">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Find Your Perfect Ride
          </h2>
          <p className="text-neutral-95 text-lg">
            Explore trending vehicles, compare specs instantly, and discover your ideal match.
          </p>
        </div>
      </section>

      {/* 🎛️ Filter Box */}
      <section className="-mt-12 relative z-10 px-4">
        <div
          className="
            max-w-7xl mx-auto bg-white/70 dark:bg-neutral-20/70 backdrop-blur-xl
            border border-neutral-85 dark:border-neutral-40 
            rounded-2xl shadow-xl p-6 md:p-8
            flex flex-wrap gap-6 items-center justify-between
          "
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-neutral-50" size={18} />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                pl-10 pr-4 py-2 w-60 rounded-lg 
                bg-neutral-98 dark:bg-neutral-20 
                border border-neutral-80 dark:border-neutral-40 
                focus:ring-2 focus:ring-blue-60 outline-none
              "
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-neutral-50" size={18} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="
                px-4 py-2 rounded-lg border 
                bg-neutral-98 dark:bg-neutral-20
                border-neutral-80 dark:border-neutral-40 
                focus:ring-2 focus:ring-blue-60 outline-none
              "
            >
              <option value="all">All Types</option>
              <option value="car">Cars</option>
              <option value="bike">Bikes</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="flex flex-col">
            <label className="text-sm text-neutral-50 dark:text-neutral-60 mb-1">
              Price Range (₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="accent-blue-60"
              />
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-blue-60"
              />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="
              flex items-center gap-2 px-4 py-2 
              bg-blue-60 text-white rounded-lg 
              hover:bg-blue-70 transition 
            "
          >
            <RefreshCcw size={16} /> Reset
          </button>
        </div>
      </section>

      {/* 🚗 VEHICLE LIST */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h3 className="text-2xl font-semibold mb-8 flex items-center gap-2">
          <span className="text-3xl">🔥</span> Trending Vehicles
        </h3>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-90 dark:bg-neutral-30 h-56 rounded-xl"></div>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <p className="text-center text-neutral-50 dark:text-neutral-70 text-lg">
            No vehicles found for selected filters.
          </p>
        ) : (
          <AnimatePresence>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredVehicles.map((v) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  className="
                    bg-white dark:bg-neutral-20 border 
                    border-neutral-85 dark:border-neutral-40
                    rounded-2xl shadow-md hover:shadow-xl 
                    transition p-4 flex flex-col
                  "
                >
                  <img
                    src={v.image || "/placeholder.jpg"}
                    onError={handleImageError}
                    className="w-full h-40 object-cover rounded-xl"
                    alt={v.name}
                  />

                  <h4 className="text-lg font-bold text-neutral-20 dark:text-neutral-90 mt-3">
                    {v.name}
                  </h4>

                  <p className="text-neutral-40 dark:text-neutral-60 text-sm">
                    {v.brand}
                  </p>

                  <p className="text-blue-60 dark:text-blue-40 text-lg font-semibold mt-1">
                    ₹{v.price?.toLocaleString()}
                  </p>

                  <Link
                    to={`/vehicle/${v._id}`}
                    className="
                      mt-4 bg-blue-60 hover:bg-blue-70 
                      text-white text-center py-2 rounded-lg
                      transition font-medium
                    "
                  >
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>

      {/* ⚙️ Footer */}
      <footer className="text-center py-6 border-t border-neutral-85 dark:border-neutral-40 text-sm text-neutral-50 dark:text-neutral-70">
        © {new Date().getFullYear()}{" "}
        <span className="text-blue-60 font-semibold">DriveMatch</span>. All Rights Reserved.
      </footer>

      {/* Toast anim */}
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

export default Home;
