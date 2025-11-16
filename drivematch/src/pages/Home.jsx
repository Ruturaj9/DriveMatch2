// src/pages/Home.jsx
import { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCcw } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const Home = () => {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  // Parse ?ids=1,2,3 from Assistant
  const urlParams = new URLSearchParams(location.search);
  const assistantIds = urlParams.get("ids") ? urlParams.get("ids").split(",") : [];

  // DATA
  const [trending, setTrending] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // PRICE SLIDERS
  const [MAX_PRICE, setMaxPriceLimit] = useState(20000000);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // loading + pagination
  const [loading, setLoading] = useState(true);
  const vehiclesPerPage = 8;
  const [trendingPage, setTrendingPage] = useState(1);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trRes, allRes] = await Promise.all([
          axios.get("http://localhost:5000/api/vehicles/trending"),
          axios.get("http://localhost:5000/api/vehicles"),
        ]);

        const allData = Array.isArray(allRes.data) ? allRes.data : [];
        setTrending(Array.isArray(trRes.data) ? trRes.data : []);
        setAllVehicles(allData);

        if (allData.length > 0) {
          const prices = allData.map((v) => Number(v.price) || 0);
          const highest = Math.max(...prices);
          const dynamicLimit = Math.round(highest + highest * 0.1);
          setMaxPriceLimit(dynamicLimit);
          setMaxPrice(dynamicLimit);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Assistant-selected vehicles
  const assistantVehicles = useMemo(() => {
    if (!assistantIds.length) return [];
    return allVehicles.filter((v) => assistantIds.includes(v._id));
  }, [assistantIds, allVehicles]);

  // FILTER MODE (assistant OR normal filters)
  const filtersActive = useMemo(() => {
    if (assistantIds.length) return true;

    return (
      search.trim().length > 0 ||
      type !== "all" ||
      Number(minPrice) > 0 ||
      Number(maxPrice) < MAX_PRICE
    );
  }, [assistantIds, search, type, minPrice, maxPrice, MAX_PRICE]);

  // FILTER VEHICLES
  const filteredVehicles = useMemo(() => {
    if (assistantIds.length) return assistantVehicles;

    const q = search.trim().toLowerCase();

    return allVehicles.filter((v) => {
      if (!v) return false;

      const matchesSearch =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q);

      const matchesType = type === "all" || v.type === type;

      const price = Number(v.price) || 0;
      const matchesPrice = price >= Number(minPrice) && price <= Number(maxPrice);

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [assistantIds, assistantVehicles, allVehicles, search, type, minPrice, maxPrice]);

  // RECOMMENDED LIST
  const recommendedAll = useMemo(() => {
    const trendingIds = new Set(trending.map((t) => t._id));
    const pool = allVehicles.filter((v) => !trendingIds.has(v._id));
    const arr = [...pool];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [allVehicles, trending]);

  // PAGINATION helper (returns slice + total pages + safePage)
  const paginate = (items, page) => {
    const total = Math.max(1, Math.ceil((items?.length || 0) / vehiclesPerPage));
    const safePage = Math.min(Math.max(1, Number(page) || 1), total);
    const start = (safePage - 1) * vehiclesPerPage;
    const slice = (items || []).slice(start, start + vehiclesPerPage);
    return { slice, total, safePage };
  };

  const { slice: trendingSlice, total: trendingTotal } = paginate(trending, trendingPage);
  const { slice: recommendedSlice, total: recommendedTotal } = paginate(recommendedAll, recommendedPage);
  const { slice: filteredSlice, total: filteredTotal } = paginate(filteredVehicles, filteredPage);

  // RESET FILTERS
  const resetFilters = () => {
    // Clear assistant mode
    window.history.replaceState({}, "", "/");

    setSearch("");
    setType("all");
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setFilteredPage(1);
    setTrendingPage(1);
    setRecommendedPage(1);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  const onMinRangeChange = (v) => {
    v = Number(v);
    setMinPrice(v <= maxPrice ? v : maxPrice);
    setFilteredPage(1);
  };

  const onMaxRangeChange = (v) => {
    v = Number(v);
    setMaxPrice(v >= minPrice ? v : minPrice);
    setFilteredPage(1);
  };

  // If filters change, ensure filtered page resets to 1
  useEffect(() => {
    if (filtersActive) setFilteredPage(1);
  }, [filtersActive]);

  // Utility: programmatic page setters (no scroll)
  const setPageWithoutScroll = (setter, p) => {
    // Just set the page. No automatic scrolling.
    setter(Number(p));
  };

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 transition-colors duration-300">
      {/* ---------------- HERO ---------------- */}
      <section
        className={`py-20 text-center shadow-lg transition-colors duration-300 rounded-b ${
          theme === "dark"
            ? "bg-gradient-to-r from-zinc-600/70 via-zinc-800 to-zinc-900 text-white"
            : "bg-gradient-to-r from-blue-100/60 via-blue-200/60 to-cyan-200/60 text-neutral-900"
        }`}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Find Your Perfect Ride
          </h2>
          <p className="text-lg opacity-90">
            Explore trending vehicles, compare specs instantly, and discover your ideal match.
          </p>
        </div>
      </section>

      {/* ---------------- FILTERS ---------------- */}
      <section className="-mt-12 relative z-10 px-4">
        <div
          className="
            max-w-7xl mx-auto
            rounded-2xl shadow-xl backdrop-blur-xl
            p-6 md:p-8 flex flex-wrap gap-6 items-center justify-between
            bg-indigo-50/80 border border-indigo-200
            dark:bg-neutral-900/60 dark:border-neutral-600
          "
        >
          {/* SEARCH */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 dark:text-neutral-300" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilteredPage(1);
              }}
              className="
                pl-10 pr-4 py-2 w-64 rounded-lg
                transition outline-none
                bg-white text-indigo-700 border border-indigo-300 placeholder-indigo-400
                dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:placeholder-neutral-500
                focus:ring-2 focus:ring-blue-60
              "
            />
          </div>

          {/* TYPE */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-700 dark:text-neutral-300" />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setFilteredPage(1);
              }}
              className="
                px-4 py-2 rounded-lg transition outline-none border
                bg-white text-indigo-700 border-indigo-300
                dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600
                focus:ring-2 focus:ring-blue-60
              "
            >
              <option value="all">All Types</option>
              <option value="car">Cars</option>
              <option value="bike">Bikes</option>
            </select>
          </div>

          {/* PRICE SLIDERS */}
          <div className="flex flex-col w-80 gap-6">
            <label className="text-sm font-semibold text-indigo-700 dark:text-neutral-300">Price Range</label>

            {/* MIN SLIDER */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Min</span>
                <span className="text-sm font-semibold text-indigo-700 dark:text-neutral-200">₹{minPrice.toLocaleString()}</span>
              </div>

              <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                <div
                  className="absolute h-full bg-blue-60 rounded-full transition-all"
                  style={{ width: `${(minPrice / MAX_PRICE) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={MAX_PRICE}
                  step="50000"
                  value={minPrice}
                  onChange={(e) => onMinRangeChange(e.target.value)}
                  className="absolute inset-0 w-full appearance-none bg-transparent"
                />
              </div>
            </div>

            {/* MAX SLIDER */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Max</span>
                <span className="text-sm font-semibold text-indigo-700 dark:text-neutral-200">₹{maxPrice.toLocaleString()}</span>
              </div>

              <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                <div
                  className="absolute h-full bg-blue-60 rounded-full transition-all"
                  style={{ width: `${(maxPrice / MAX_PRICE) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={MAX_PRICE}
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => onMaxRangeChange(e.target.value)}
                  className="absolute inset-0 w-full appearance-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* RESET */}
          <div>
            <button
              onClick={() => {
                resetFilters();
                setTrendingPage(1);
                setRecommendedPage(1);
              }}
              className="
                flex items-center gap-2 px-4 py-2 rounded-lg transition
                bg-blue-500 text-white hover:bg-indigo-400 border border-indigo-700 focus:ring-2 focus:ring-zinc-600
                dark:bg-blue-500 dark:text-neutral-900 dark:hover:bg-indigo-700 dark:border-neutral-600 dark:focus:ring-2 dark:focus:ring-white
              "
            >
              <RefreshCcw size={16} /> Reset
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- RESULTS ---------------- */}
      {filtersActive ? (
        <section className="max-w-7xl mx-auto px-6 py-14">
          <h3 className="text-2xl font-semibold mb-6">🔎 Filtered Results ({filteredVehicles.length})</h3>

          <VehicleGrid loading={loading} vehicles={filteredSlice} handleImageError={handleImageError} />

          {filteredTotal > 1 && (
            <Pagination
              totalPages={filteredTotal}
              currentPage={filteredPage}
              setPage={(p) => setPageWithoutScroll(setFilteredPage, p)}
            />
          )}
        </section>
      ) : (
        <>
          {/* TRENDING */}
          <section className="max-w-7xl mx-auto px-6 py-14">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-3xl">🔥</span> Trending Vehicles
            </h3>

            <VehicleGrid loading={loading} vehicles={trendingSlice} handleImageError={handleImageError} />

            {trendingTotal > 1 && (
              <Pagination
                totalPages={trendingTotal}
                currentPage={trendingPage}
                setPage={(p) => setPageWithoutScroll(setTrendingPage, p)}
              />
            )}
          </section>

          {/* RECOMMENDED */}
          <section className="max-w-7xl mx-auto px-6 pb-14">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-3xl">⭐</span> Recommended for You
            </h3>

            <VehicleGrid loading={loading} vehicles={recommendedSlice} handleImageError={handleImageError} />

            {recommendedTotal > 1 && (
              <Pagination
                totalPages={recommendedTotal}
                currentPage={recommendedPage}
                setPage={(p) => setPageWithoutScroll(setRecommendedPage, p)}
              />
            )}
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-neutral-85 dark:border-neutral-40 text-sm text-neutral-50 dark:text-neutral-70">
        © {new Date().getFullYear()} <span className="text-blue-60 font-semibold">DriveMatch</span>. All Rights Reserved.
      </footer>
    </div>
  );
};

// ------------------ VEHICLE GRID ------------------
const VehicleGrid = ({ loading, vehicles, handleImageError }) => {
  if (loading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-neutral-90 dark:bg-neutral-30 h-56 rounded-xl" />
        ))}
      </div>
    );

  if (!vehicles || vehicles.length === 0)
    return <p className="text-center text-neutral-50 dark:text-neutral-70 text-lg">No vehicles found.</p>;

  return (
    <AnimatePresence>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {vehicles.map((v) => (
          <motion.div
            key={v._id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            className="bg-lg dark:bg-neutral-20 border border-neutral-85 dark:border-neutral-40 rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col"
          >
            <img src={v.image || "/placeholder.jpg"} onError={handleImageError} className="w-full h-40 object-cover rounded-xl" alt={v.name} />

            <h4 className="text-lg font-bold text-neutral-20 dark:text-neutral-90 mt-3">{v.name}</h4>
            <p className="text-neutral-40 dark:text-neutral-60">{v.brand}</p>

            <p className="text-blue-60 dark:text-blue-40 font-semibold text-lg mt-1">₹{v.price?.toLocaleString()}</p>

            <Link to={`/vehicle/${v._id}`} className="mt-4 bg-blue-60 hover:bg-blue-70 text-lg py-2 rounded-lg text-center border-2 transition font-medium hover:bg-slate-500">
              View Details
            </Link>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

// ------------------ PAGINATION ------------------
const Pagination = ({ totalPages, currentPage, setPage }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex justify-center mt-10 gap-3">
      <button
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`px-4 py-2 rounded-lg text-sm border ${
          currentPage === 1 ? "opacity-40 cursor-not-allowed border-neutral-60" : "hover:bg-blue-60 hover:text-white border-neutral-80 dark:border-neutral-40"
        }`}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          aria-current={currentPage === p ? "page" : undefined}
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
        aria-label="Next page"
        className={`px-4 py-2 rounded-lg text-sm border ${
          currentPage === totalPages ? "opacity-40 cursor-not-allowed border-neutral-60" : "hover:bg-blue-60 hover:text-white border-neutral-80 dark:border-neutral-40"
        }`}
      >
        Next
      </button>
    </nav>
  );
};

export default Home;
