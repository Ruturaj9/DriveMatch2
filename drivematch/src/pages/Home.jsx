// src/pages/Home.jsx
import { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCcw } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

/**
 * Home.jsx
 * - Dynamic price slider system
 * - Trending when no filters
 * - Recommended when no filters
 * - Filtered results when any filter is active
 */

// ❌ Remove old fixed MAX_PRICE
// const MAX_PRICE = 20000000;

// ✅ Dynamic MAX price from API
const Home = () => {
  const { theme } = useContext(ThemeContext);

  // Data
  const [trending, setTrending] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // Dynamic price limit
  const [MAX_PRICE, setMaxPriceLimit] = useState(20000000);

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

  // FETCH DATA + CALCULATE MAX PRICE
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

        // Calculate dynamic MAX_PRICE
        if (allData.length > 0) {
          const prices = allData.map(v => Number(v.price) || 0);
          const highest = Math.max(...prices);
          const dynamicLimit = Math.round(highest + highest * 0.10); // +10%

          setMaxPriceLimit(dynamicLimit);
          setMaxPrice(dynamicLimit); // update slider
        }

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
  }, [search, type, minPrice, maxPrice, MAX_PRICE]);

  // FILTER VEHICLES
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allVehicles.filter((v) => {
      if (!v) return false;
      const matchesSearch =
        !q ||
        (v.name?.toLowerCase().includes(q)) ||
        (v.brand?.toLowerCase().includes(q));

      const matchesType = type === "all" || v.type === type;

      const price = Number(v.price) || 0;
      const matchesPrice = price >= Number(minPrice) && price <= Number(maxPrice);

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [allVehicles, search, type, minPrice, maxPrice]);

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

  // PAGINATION
  const paginate = (items, page) => {
    const total = Math.ceil(items.length / vehiclesPerPage) || 1;
    const safePage = Math.min(Math.max(1, page), total);
    const start = (safePage - 1) * vehiclesPerPage;
    const slice = items.slice(start, start + vehiclesPerPage);
    return { slice, total, safePage };
  };

  const { slice: trendingSlice, total: trendingTotal } = paginate(trending, trendingPage);
  const { slice: recommendedSlice, total: recommendedTotal } = paginate(recommendedAll, recommendedPage);
  const { slice: filteredSlice, total: filteredTotal } = paginate(filteredVehicles, filteredPage);

  // RESET
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

  // SLIDER HANDLERS
  const onMinRangeChange = (val) => {
    const v = Number(val);
    setMinPrice(v <= maxPrice ? v : maxPrice);
    setFilteredPage(1);
  };

  const onMaxRangeChange = (val) => {
    const v = Number(val);
    setMaxPrice(v >= minPrice ? v : minPrice);
    setFilteredPage(1);
  };

  // filter reset effects
  useEffect(() => {
    if (filtersActive) setFilteredPage(1);
  }, [filtersActive]);

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
            ? "bg-gradient-to-r from-zinc-600 via-slate-600 to-slate-800 text-white"
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
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-700 dark:text-neutral-300"
            />

            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setFilteredPage(1); }}
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
              onChange={(e) => { setType(e.target.value); setFilteredPage(1); }}
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

            <label className="text-sm font-semibold text-indigo-700 dark:text-neutral-300">
              Price Range
            </label>

            {/* ------- MIN SLIDER ------- */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Min</span>
                <span className="text-sm font-semibold text-indigo-700 dark:text-neutral-200">
                  ₹{minPrice.toLocaleString()}
                </span>
              </div>

              <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                <div
                  className="absolute h-full bg-blue-60 rounded-full transition-all"
                  style={{ width: `${(minPrice / MAX_PRICE) * 100}%` }}
                ></div>

                <input
                  type="range"
                  min="0"
                  max={MAX_PRICE}
                  step="50000"
                  value={minPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    onMinRangeChange(v <= maxPrice ? v : maxPrice);
                  }}
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
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110
                  "
                />
              </div>
            </div>

            {/* ------- MAX SLIDER ------- */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Max</span>
                <span className="text-sm font-semibold text-indigo-700 dark:text-neutral-200">
                  ₹{maxPrice.toLocaleString()}
                </span>
              </div>

              <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                <div
                  className="absolute h-full bg-blue-60 rounded-full transition-all"
                  style={{ width: `${(maxPrice / MAX_PRICE) * 100}%` }}
                ></div>

                <input
                  type="range"
                  min="0"
                  max={MAX_PRICE}
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    onMaxRangeChange(v >= minPrice ? v : minPrice);
                  }}
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
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110
                  "
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
                bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-400
                dark:bg-blue-60 dark:text-neutral-900 dark:hover:bg-blue-70 dark:border-neutral-600
              "
            >
              <RefreshCcw size={16} /> Reset
            </button>
          </div>

        </div>
      </section>

      {/* RESULTS */}

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
          {/* TRENDING */}
          <section className="max-w-7xl mx-auto px-6 py-14">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="text-3xl">🔥</span> Trending Vehicles
            </h3>

            <VehicleGrid loading={loading} vehicles={trendingSlice} handleImageError={handleImageError} />

            {trendingTotal > 1 && (
              <Pagination totalPages={trendingTotal} currentPage={trendingPage} setPage={(p) => goTo(setTrendingPage, p)} />
            )}
          </section>

          {/* RECOMMENDED */}
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

// VEHICLE GRID
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

// PAGINATION
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
