// src/pages/Home.jsx
import { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCcw, Heart } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated, favorites, toggleFavorite } = useContext(AuthContext);
  const location = useLocation();

  // Toast
  const showToast = (msg) => {
    const t = document.createElement("div");
    t.textContent = msg;
    t.className =
      "fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out text-sm z-[9999]";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  // Parse assistant IDs
  const urlParams = new URLSearchParams(location.search);
  const assistantIds = urlParams.get("ids") ? urlParams.get("ids").split(",") : [];

  // DATA
  const [trending, setTrending] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // FILTER STATES
  const [MAX_PRICE, setMaxPriceLimit] = useState(20000000);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // UI STATES
  const [loading, setLoading] = useState(true);
  const vehiclesPerPage = 8;
  const [trendingPage, setTrendingPage] = useState(1);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);

  /* ---------------- FETCH VEHICLES ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [tr, all] = await Promise.all([
          axios.get("http://localhost:5000/api/vehicles/trending"),
          axios.get("http://localhost:5000/api/vehicles"),
        ]);

        const allData = Array.isArray(all.data) ? all.data : [];
        setTrending(Array.isArray(tr.data) ? tr.data : []);
        setAllVehicles(allData);

        if (allData.length > 0) {
          const prices = allData.map((v) => Number(v.price) || 0);
          const highest = Math.max(...prices);
          const limit = Math.round(highest + highest * 0.1);
          setMaxPriceLimit(limit);
          setMaxPrice(limit);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------------- ASSISTANT SELECTION ---------------- */
  const assistantVehicles = useMemo(() => {
    if (!assistantIds.length) return [];
    return allVehicles.filter((v) => assistantIds.includes(v._id));
  }, [assistantIds, allVehicles]);

  /* ---------------- FILTER MODE ---------------- */
  const filtersActive = useMemo(() => {
    if (assistantIds.length) return true;
    return (
      search.trim() ||
      type !== "all" ||
      Number(minPrice) > 0 ||
      Number(maxPrice) < MAX_PRICE
    );
  }, [assistantIds, search, type, minPrice, maxPrice, MAX_PRICE]);

  /* ---------------- FILTER RESULTS ---------------- */
  const filteredVehicles = useMemo(() => {
    if (assistantIds.length) return assistantVehicles;

    const q = search.toLowerCase();

    return allVehicles.filter((v) => {
      if (!v) return false;

      const matchesSearch =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q);

      const matchesType = type === "all" || v.type === type;

      const price = Number(v.price) || 0;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [assistantIds, assistantVehicles, allVehicles, search, type, minPrice, maxPrice]);

  /* ---------------- RECOMMENDED ---------------- */
  const recommendedAll = useMemo(() => {
    const trendingIds = new Set(trending.map((t) => t._id));
    const pool = allVehicles.filter((v) => !trendingIds.has(v._id));
    return [...pool].sort(() => Math.random() - 0.5);
  }, [allVehicles, trending]);

  /* ---------------- PAGINATION ---------------- */
  const paginate = (arr, page) => {
    const total = Math.max(1, Math.ceil(arr.length / vehiclesPerPage));
    const safe = Math.min(Math.max(1, page), total);
    const start = (safe - 1) * vehiclesPerPage;
    return { slice: arr.slice(start, start + vehiclesPerPage), total };
  };

  const { slice: trendingSlice, total: trendingTotal } = paginate(trending, trendingPage);
  const { slice: recommendedSlice, total: recommendedTotal } = paginate(
    recommendedAll,
    recommendedPage
  );
  const { slice: filteredSlice, total: filteredTotal } = paginate(
    filteredVehicles,
    filteredPage
  );

  /* ---------------- RESET ---------------- */
  const resetFilters = () => {
    window.history.replaceState({}, "", "/");
    setSearch("");
    setType("all");
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  /* ---------------- MIN/MAX PRICE ---------------- */
  const onMinChange = (v) => {
    const value = Number(v);
    setMinPrice(value <= maxPrice ? value : maxPrice);
  };

  const onMaxChange = (v) => {
    const value = Number(v);
    setMaxPrice(value >= minPrice ? value : minPrice);
  };

  /* =====================================================
     PAGE UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 transition-colors duration-300">

      {/* ---------------- HERO ---------------- */}
      <section
        className={`py-20 text-center shadow-lg rounded-b transition-colors ${
          theme === "dark"
            ? "bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 text-white"
            : "bg-gradient-to-r from-blue-100/60 via-blue-200/60 to-cyan-200/60 text-neutral-900"
        }`}
      >
        <h1 className="text-5xl font-extrabold tracking-tight">Find Your Perfect Ride</h1>
        <p className="mt-3 text-lg opacity-90">
          Explore trending vehicles, compare specs, and discover your ideal match.
        </p>
      </section>

      {/* ---------------- FILTERS ---------------- */}
      <section className="-mt-12 relative z-10 px-4">
        <div
          className="
            max-w-7xl mx-auto rounded-2xl shadow-xl backdrop-blur-xl
            p-6 md:p-8 flex flex-wrap gap-6 items-center justify-between
            bg-indigo-50/80 border border-indigo-200
            dark:bg-neutral-900/60 dark:border-neutral-700
          "
        >
          {/* SEARCH */}
          <div className="relative w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 dark:text-neutral-300"
            />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                pl-10 pr-4 py-2 w-full rounded-lg bg-white
                text-indigo-700 border border-indigo-300 placeholder-indigo-400
                dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600
                focus:ring-2 focus:ring-blue-60 outline-none
              "
            />
          </div>

          {/* TYPE FILTER */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-700 dark:text-neutral-300" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="
                px-4 py-2 rounded-lg border bg-white text-indigo-700
                border-indigo-300 dark:bg-neutral-800 dark:text-neutral-200 
                dark:border-neutral-600 focus:ring-2 focus:ring-blue-60
              "
            >
              <option value="all">All Types</option>
              <option value="car">Cars</option>
              <option value="bike">Bikes</option>
            </select>
          </div>

          {/* PRICE SLIDERS (BLOCK B) */}
          <PriceSliders
            MIN={minPrice}
            MAX={maxPrice}
            MAX_LIMIT={MAX_PRICE}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />

          {/* RESET */}
          <button
            onClick={resetFilters}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white 
              hover:bg-blue-600 border border-blue-700
              dark:bg-blue-500 dark:text-neutral-900
              dark:hover:bg-blue-600 dark:border-neutral-500 transition
            "
          >
            <RefreshCcw size={16} /> Reset
          </button>
        </div>
      </section>

      {/* ---------------- VEHICLE LISTS ---------------- */}
      {filtersActive ? (
        <Section
          title={`🔎 Filtered Results (${filteredVehicles.length})`}
          vehicles={filteredSlice}
          loading={loading}
          favorites={favorites}
          isAuthenticated={isAuthenticated}
          toggleFavorite={toggleFavorite}
          showToast={showToast}
          handleImageError={handleImageError}
        >
          <Pagination
            totalPages={filteredTotal}
            currentPage={filteredPage}
            setPage={setFilteredPage}
          />
        </Section>
      ) : (
        <>
          <Section
            title="🔥 Trending Vehicles"
            vehicles={trendingSlice}
            loading={loading}
            favorites={favorites}
            isAuthenticated={isAuthenticated}
            toggleFavorite={toggleFavorite}
            showToast={showToast}
            handleImageError={handleImageError}
          >
            <Pagination
              totalPages={trendingTotal}
              currentPage={trendingPage}
              setPage={setTrendingPage}
            />
          </Section>

          <Section
            title="⭐ Recommended for You"
            vehicles={recommendedSlice}
            loading={loading}
            favorites={favorites}
            isAuthenticated={isAuthenticated}
            toggleFavorite={toggleFavorite}
            showToast={showToast}
            handleImageError={handleImageError}
          >
            <Pagination
              totalPages={recommendedTotal}
              currentPage={recommendedPage}
              setPage={setRecommendedPage}
            />
          </Section>
        </>
      )}

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-neutral-300 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} <span className="text-blue-600 font-semibold">DriveMatch</span>
      </footer>
    </div>
  );
};

/* =====================================================
   PRICE SLIDER B
===================================================== */
const PriceSliders = ({ MIN, MAX, MAX_LIMIT, onMinChange, onMaxChange }) => (
  <div className="flex flex-col w-80 gap-6">
    {/* MIN */}
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-neutral-600 dark:text-neutral-400">Min</span>
        <span className="text-sm font-semibold text-indigo-700 dark:text-neutral-200">
          ₹{MIN.toLocaleString()}
        </span>
      </div>

      <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
        <div
          className="absolute h-full bg-blue-60 rounded-full transition-all"
          style={{ width: `${(MIN / MAX_LIMIT) * 100}%` }}
        />
        <input
          type="range"
          min="0"
          max={MAX_LIMIT}
          step="50000"
          value={MIN}
          onChange={(e) => onMinChange(e.target.value)}
          className="
            absolute inset-0 w-full appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-br
            [&::-webkit-slider-thumb]:from-indigo-600
            [&::-webkit-slider-thumb]:to-blue-500
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-transform
          "
        />
      </div>
    </div>

    {/* MAX */}
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-neutral-600 dark:text-neutral-400">Max</span>
        <span className="text-sm font-semibold text-indigo-700 dark:text-neutral-200">
          ₹{MAX.toLocaleString()}
        </span>
      </div>

      <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
        <div
          className="absolute h-full bg-blue-60 rounded-full transition-all"
          style={{ width: `${(MAX / MAX_LIMIT) * 100}%` }}
        />
        <input
          type="range"
          min="0"
          max={MAX_LIMIT}
          step="50000"
          value={MAX}
          onChange={(e) => onMaxChange(e.target.value)}
          className="
            absolute inset-0 w-full appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-br
            [&::-webkit-slider-thumb]:from-indigo-600
            [&::-webkit-slider-thumb]:to-blue-500
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-transform
          "
        />
      </div>
    </div>
  </div>
);

/* =====================================================
   VEHICLE SECTION WRAPPER
===================================================== */
const Section = ({
  title,
  vehicles,
  loading,
  favorites,
  isAuthenticated,
  toggleFavorite,
  showToast,
  handleImageError,
  children,
}) => (
  <section className="max-w-7xl mx-auto px-6 py-14">
    <h3 className="text-2xl font-semibold mb-6">{title}</h3>

    <VehicleGrid
      loading={loading}
      vehicles={vehicles}
      favorites={favorites}
      isAuthenticated={isAuthenticated}
      toggleFavorite={toggleFavorite}
      showToast={showToast}
      handleImageError={handleImageError}
    />

    {children}
  </section>
);

/* =====================================================
   VEHICLE GRID
===================================================== */
const VehicleGrid = ({
  loading,
  vehicles,
  favorites,
  isAuthenticated,
  toggleFavorite,
  showToast,
  handleImageError,
}) => {

  if (loading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-56 rounded-2xl bg-neutral-90 dark:bg-neutral-20 animate-pulse"
          />
        ))}
      </div>
    );

  if (!vehicles || vehicles.length === 0)
    return (
      <p className="text-center text-neutral-50 dark:text-neutral-70 text-lg">
        No vehicles found.
      </p>
    );

  const isFav = (id) => favorites.some((v) => v._id === id);

  return (
    <AnimatePresence>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {vehicles.map((v) => (
          <motion.div
            key={v._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className="
              bg-neutral-98 dark:bg-neutral-15
              border border-neutral-80 dark:border-neutral-40
              rounded-2xl shadow-md hover:shadow-xl 
              transition p-4 flex flex-col
            "
          >
            {/* Image */}
            <img
              src={v.image || '/placeholder.jpg'}
              onError={handleImageError}
              className="w-full h-40 object-cover rounded-xl"
            />

            {/* Name (2-line clamp) */}
            <h4
              className="
                text-lg font-bold text-neutral-20 dark:text-neutral-90 mt-3 
                line-clamp-2
              "
            >
              {v.name}
            </h4>

            {/* Brand */}
            <p className="text-neutral-50 dark:text-neutral-60">{v.brand}</p>

            {/* Price */}
            <p className="text-blue-60 dark:text-blue-40 font-semibold text-lg mt-1">
              ₹{v.price?.toLocaleString()}
            </p>

            {/* Bottom Buttons — FIXED HEIGHT */}
            <div className="flex items-center justify-between mt-auto pt-4">
              
              {/* VIEW DETAILS BUTTON (Theme Perfect) */}
              <Link
                to={`/vehicle/${v._id}`}
                className="
    px-4 py-2 rounded-lg font-medium text-center w-full
    bg-blue-60 text-white hover:bg-blue-70
    dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-neutral-10
    transition
  "
              >
                View Details
              </Link>

              {/* Favorite button (only if logged in) */}
              {isAuthenticated && (
                <button
                  onClick={() => toggleFavorite(v._id)}
                  className="
                    ml-3 p-2 rounded-lg transition
                    hover:bg-neutral-90 dark:hover:bg-neutral-20
                  "
                >
                  <Heart
                    size={22}
                    className={
                      isFav(v._id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-neutral-500 dark:text-neutral-300'
                    }
                  />
                </button>
              )}
            </div>

          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};


/* =====================================================
   PAGINATION (YOUR ORIGINAL)
===================================================== */
const Pagination = ({ totalPages, currentPage, setPage }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);

  return (
    <nav className="flex justify-center mt-10 gap-3">
      <button
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg text-sm border ${
          currentPage === 1
            ? "opacity-40 cursor-not-allowed border-neutral-60"
            : "hover:bg-blue-60 hover:text-white border-neutral-80 dark:border-neutral-40"
        }`}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-2 rounded-lg text-sm border transition font-medium ${
            currentPage === p
              ? "bg-blue-600 text-white border-blue-600 scale-105 transform shadow-md ring-2 ring-blue-200"
              : "border-neutral-80 dark:border-neutral-40 hover:bg-neutral-90 dark:hover:bg-neutral-30"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg text-sm border ${
          currentPage === totalPages
            ? "opacity-40 cursor-not-allowed border-neutral-60"
            : "hover:bg-blue-60 hover:text-white border-neutral-80 dark:border-neutral-40"
        }`}
      >
        Next
      </button>
    </nav>
  );
};

export default Home;
