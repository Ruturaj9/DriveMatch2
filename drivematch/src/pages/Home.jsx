// src/pages/Home.jsx
import { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCcw } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

/**
 * Home.jsx
 * - Double-range slider (A)
 * - Trending shown only when NO filters active
 * - Recommended ALWAYS visible when no filters (excludes trending vehicles)
 * - Filtered Results shown when any filter active (pagination)
 */

const MAX_PRICE = 20000000; // keep high default

const Home = () => {
  const { theme } = useContext(ThemeContext);

  // Data
  const [trending, setTrending] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // loading & pagination state
  const [loading, setLoading] = useState(true);
  const vehiclesPerPage = 8;

  // pages
  const [trendingPage, setTrendingPage] = useState(1);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trRes, allRes] = await Promise.all([
          axios.get("http://localhost:5000/api/vehicles/trending"),
          axios.get("http://localhost:5000/api/vehicles"),
        ]);
        setTrending(Array.isArray(trRes.data) ? trRes.data : []);
        setAllVehicles(Array.isArray(allRes.data) ? allRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Determine whether any filter is active
  const filtersActive = useMemo(() => {
    return (
      search.trim().length > 0 ||
      type !== "all" ||
      Number(minPrice) > 0 ||
      Number(maxPrice) < MAX_PRICE
    );
  }, [search, type, minPrice, maxPrice]);

  // ---------- FILTERED VEHICLES (applies only when filtersActive) ----------
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allVehicles.filter((v) => {
      if (!v) return false;
      const matchesSearch =
        !q ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.brand && v.brand.toLowerCase().includes(q));
      const matchesType = type === "all" || v.type === type;
      const price = typeof v.price === "number" ? v.price : Number(v.price) || 0;
      const matchesPrice = price >= Number(minPrice) && price <= Number(maxPrice);
      return matchesSearch && matchesType && matchesPrice;
    });
  }, [allVehicles, search, type, minPrice, maxPrice]);

  // ---------- RECOMMENDED LIST (shuffle of allVehicles excluding trending) ----------
  const recommendedAll = useMemo(() => {
    const trendingIds = new Set(trending.map((t) => t._id));
    const pool = allVehicles.filter((v) => !trendingIds.has(v._id));
    // simple shuffle (Fisher-Yates)
    const arr = [...pool];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [allVehicles, trending]);

  // ---------- Pagination helpers ----------
  const paginate = (items, page) => {
    const total = Math.ceil(items.length / vehiclesPerPage) || 1;
    const safePage = Math.min(Math.max(1, page), total);
    const start = (safePage - 1) * vehiclesPerPage;
    const slice = items.slice(start, start + vehiclesPerPage);
    return { slice, total, safePage };
  };

  // trending pagination (only used when filters NOT active)
  const { slice: trendingSlice, total: trendingTotal } = paginate(trending, trendingPage);

  // recommended pagination (always used when trending visible; recommendedAll length can be > 10)
  const { slice: recommendedSlice, total: recommendedTotal } = paginate(
    recommendedAll,
    recommendedPage
  );

  // filtered pagination (shown only when filtersActive)
  const { slice: filteredSlice, total: filteredTotal } = paginate(filteredVehicles, filteredPage);

  // reset filters
  const resetFilters = () => {
    setSearch("");
    setType("all");
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setFilteredPage(1);
    setTrendingPage(1);
    setRecommendedPage(1);
  };

  const handleImageError = (e) => (e.target.src = "/placeholder.jpg");

  // double-range handlers (A)
  const onMinRangeChange = (val) => {
    const newMin = Number(val);
    if (newMin <= maxPrice) setMinPrice(newMin);
    else setMinPrice(maxPrice);
    setFilteredPage(1);
  };
  const onMaxRangeChange = (val) => {
    const newMax = Number(val);
    if (newMax >= minPrice) setMaxPrice(newMax);
    else setMaxPrice(minPrice);
    setFilteredPage(1);
  };

  // when filters are changed, ensure trending/recommended hide and move to page 1 of filtered
  useEffect(() => {
    if (filtersActive) {
      // ensure the filtered page resets
      setFilteredPage(1);
    }
  }, [filtersActive]);

  // helper for going to page and scrolling
  const goTo = (setPage, p) => {
    setPage(p);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-neutral-98 dark:bg-neutral-10 transition-colors duration-300">
      {/* HERO */}
      <section
        className={`py-20 text-center shadow-lg transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 text-white"
            : "bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 text-neutral-900"
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

      {/* FILTERS */}
      <section className="-mt-12 relative z-10 px-4">
        <div className="max-w-7xl mx-auto bg-white/70 dark:bg-neutral-20/70 backdrop-blur-xl border border-neutral-85 dark:border-neutral-40 rounded-2xl shadow-xl p-6 md:p-8 flex flex-wrap gap-6 items-center justify-between">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-neutral-50 dark:text-neutral-70" size={18} />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilteredPage(1);
                // when user types, we want to hide trending automatically due to filtersActive derived state
              }}
              className="pl-10 pr-4 py-2 w-64 rounded-lg bg-neutral-98 dark:bg-neutral-20 border border-neutral-80 dark:border-neutral-40 focus:ring-2 focus:ring-blue-60 outline-none"
            />
          </div>

          {/* TYPE */}
          <div className="flex items-center gap-2">
            <Filter className="text-neutral-50 dark:text-neutral-70" size={18} />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setFilteredPage(1);
              }}
              className="px-4 py-2 rounded-lg border bg-neutral-98 dark:bg-neutral-20 border-neutral-80 dark:border-neutral-40 focus:ring-2 focus:ring-blue-60 outline-none"
            >
              <option value="all">All Types</option>
              <option value="car">Cars</option>
              <option value="bike">Bikes</option>
            </select>
          </div>

          {/* DOUBLE-RANGE SLIDER (A) */}
          <div className="flex flex-col w-80">
            <label className="text-sm text-neutral-50 dark:text-neutral-60 mb-2">
              Price Range
            </label>

            <div className="relative w-full">
              {/* Visual bar */}
              <div className="h-2 rounded-full bg-neutral-90 dark:bg-neutral-30 w-full absolute top-2"></div>

              {/* filled range between handles */}
              <div
                className="h-2 rounded-full bg-blue-60 absolute top-2"
                style={{
                  left: `${(minPrice / MAX_PRICE) * 100}%`,
                  right: `${100 - (maxPrice / MAX_PRICE) * 100}%`,
                }}
              />

              {/* two range inputs stacked */}
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="50000"
                value={minPrice}
                onChange={(e) => onMinRangeChange(e.target.value)}
                className="appearance-none pointer-events-auto w-full bg-transparent relative z-20"
              />
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="50000"
                value={maxPrice}
                onChange={(e) => onMaxRangeChange(e.target.value)}
                className="appearance-none pointer-events-auto w-full bg-transparent relative z-10 -mt-1"
              />
            </div>

            <div className="flex justify-between mt-2 text-sm text-neutral-50 dark:text-neutral-70">
              <div>₹{minPrice.toLocaleString()}</div>
              <div>₹{maxPrice.toLocaleString()}</div>
            </div>
          </div>

          {/* RESET */}
          <div>
            <button
              onClick={() => {
                resetFilters();
                // also restore pages
                setTrendingPage(1);
                setRecommendedPage(1);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-60 text-white rounded-lg hover:bg-blue-70 transition"
            >
              <RefreshCcw size={16} /> Reset
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS LAYOUT
          - If filtersActive -> show only Filtered Results (paginated)
          - If not -> show Trending (paginated) then Recommended (paginated)
      */}

      {/* FILTERED RESULTS (only visible when any filter active) */}
      {filtersActive ? (
        <section className="max-w-7xl mx-auto px-6 py-14">
          <h3 className="text-2xl font-semibold mb-6">
            🔎 Filtered Results ({filteredVehicles.length})
          </h3>

          <VehicleGrid loading={loading} vehicles={filteredSlice} handleImageError={handleImageError} />

          {filteredTotal > 1 && (
            <Pagination totalPages={filteredTotal} currentPage={filteredPage} setPage={(p) => goTo(setFilteredPage, p)} />
          )}
        </section>
      ) : (
        <>
          {/* TRENDING (only when no filters active) */}
          <section className="max-w-7xl mx-auto px-6 py-14">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-3xl">🔥</span> Trending Vehicles
            </h3>

            <VehicleGrid loading={loading} vehicles={trendingSlice} handleImageError={handleImageError} />

            {trendingTotal > 1 && (
              <Pagination totalPages={trendingTotal} currentPage={trendingPage} setPage={(p) => goTo(setTrendingPage, p)} />
            )}
          </section>

          {/* RECOMMENDED (always visible when no filters; uses full set excluding trending) */}
          <section className="max-w-7xl mx-auto px-6 pb-14">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-3xl">⭐</span> Recommended for You
            </h3>

            <VehicleGrid loading={loading} vehicles={recommendedSlice} handleImageError={handleImageError} />

            {recommendedTotal > 1 && (
              <Pagination totalPages={recommendedTotal} currentPage={recommendedPage} setPage={(p) => goTo(setRecommendedPage, p)} />
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

// VEHICLE GRID (reusable)
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
            className="bg-white dark:bg-neutral-20 border border-neutral-85 dark:border-neutral-40 rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col"
          >
            <img src={v.image || "/placeholder.jpg"} onError={handleImageError} className="w-full h-40 object-cover rounded-xl" alt={v.name} />

            <h4 className="text-lg font-bold text-neutral-20 dark:text-neutral-90 mt-3">{v.name}</h4>
            <p className="text-neutral-40 dark:text-neutral-60">{v.brand}</p>

            <p className="text-blue-60 dark:text-blue-40 font-semibold text-lg mt-1">₹{v.price?.toLocaleString()}</p>

            <Link to={`/vehicle/${v._id}`} className="mt-4 bg-blue-60 hover:bg-blue-70 text-white py-2 rounded-lg text-center">
              View Details
            </Link>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};

// PAGINATION component
const Pagination = ({ totalPages, currentPage, setPage }) => {
  if (!totalPages || totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);

  return (
    <div className="flex justify-center mt-10 gap-3">
      <button
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg text-sm border ${currentPage === 1 ? "opacity-40 cursor-not-allowed border-neutral-60" : "hover:bg-blue-60 hover:text-white border-neutral-80 dark:border-neutral-40"}`}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-2 rounded-lg text-sm border transition ${currentPage === p ? "bg-blue-60 text-white border-blue-60" : "border-neutral-80 dark:border-neutral-40 hover:bg-neutral-90 dark:hover:bg-neutral-30"}`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg text-sm border ${currentPage === totalPages ? "opacity-40 cursor-not-allowed border-neutral-60" : "hover:bg-blue-60 hover:text-white border-neutral-80 dark:border-neutral-40"}`}
      >
        Next
      </button>
    </div>
  );
};

export default Home;
