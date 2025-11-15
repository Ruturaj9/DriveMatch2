import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Gauge, Car, Fuel } from "lucide-react";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#e11d48", "#a855f7"];

const Insights = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Fetch ONLY top 100 trending vehicles
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicles/trending?limit=100")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, []);

  // 🧠 Memoized insights
  const {
    avgPriceByBrand,
    fuelDist,
    topPerformance,
    totalVehicles,
    overallAvgPrice,
    mostCommonFuel,
  } = useMemo(() => {
    if (!vehicles.length)
      return {
        avgPriceByBrand: [],
        fuelDist: [],
        topPerformance: [],
        totalVehicles: 0,
        overallAvgPrice: 0,
        mostCommonFuel: "N/A",
      };

    const avgPriceByBrand = Object.values(
      vehicles.reduce((acc, v) => {
        if (!v.brand || !v.price) return acc;
        if (!acc[v.brand]) acc[v.brand] = { brand: v.brand, total: 0, count: 0 };
        acc[v.brand].total += v.price;
        acc[v.brand].count++;
        return acc;
      }, {})
    )
      .map((b) => ({
        brand: b.brand,
        avgPrice: Math.round(b.total / b.count),
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 8);

    const fuelDist = Object.values(
      vehicles.reduce((acc, v) => {
        if (!v.fuelType) return acc;
        acc[v.fuelType] = acc[v.fuelType] || { fuel: v.fuelType, count: 0 };
        acc[v.fuelType].count++;
        return acc;
      }, {})
    );

    const topPerformance = [...vehicles]
      .filter((v) => v.performanceScore)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 8)
      .map((v) => ({
        name: v.name,
        performance: v.performanceScore,
      }));

    const totalVehicles = vehicles.length;

    const overallAvgPrice = Math.round(
      vehicles.reduce((sum, v) => sum + (v.price || 0), 0) / totalVehicles
    );

    const mostCommonFuel =
      fuelDist.sort((a, b) => b.count - a.count)[0]?.fuel || "N/A";

    return {
      avgPriceByBrand,
      fuelDist,
      topPerformance,
      totalVehicles,
      overallAvgPrice,
      mostCommonFuel,
    };
  }, [vehicles]);

  // Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text)] text-lg bg-[var(--color-bg)] transition-colors">
        Loading Insights...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-6 py-10 transition-colors">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-60 dark:text-blue-40 mb-10 text-center">
          📊 Insights on Top 100 Trending Vehicles
        </h1>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12"
        >
          {/* CARD 1 */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-text)]/20 dark:border-neutral-40 rounded-xl shadow-lg p-5 text-center transition">
            <Car className="mx-auto text-blue-60 mb-2" size={28} />
            <p className="opacity-70">Trending Vehicles</p>
            <h3 className="text-3xl font-bold text-blue-60 dark:text-blue-40">
              {totalVehicles}
            </h3>
          </div>

          {/* CARD 2 */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-text)]/20 rounded-xl shadow-lg p-5 text-center transition">
            <Gauge className="mx-auto text-green-60 mb-2" size={28} />
            <p className="opacity-70">Avg Price</p>
            <h3 className="text-3xl font-bold text-green-60">
              ₹{overallAvgPrice.toLocaleString()}
            </h3>
          </div>

          {/* CARD 3 */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-text)]/20 rounded-xl shadow-lg p-5 text-center transition">
            <Fuel className="mx-auto text-orange-60 mb-2" size={28} />
            <p className="opacity-70">Most Common Fuel</p>
            <h3 className="text-2xl font-bold text-orange-60">{mostCommonFuel}</h3>
          </div>
        </motion.div>

        {/* Avg Price by Brand */}
        <section className="bg-[var(--color-bg)] rounded-2xl shadow-lg border border-[var(--color-text)]/20 p-6 mb-12 transition">
          <h2 className="text-xl font-semibold mb-4">💰 Average Price by Brand</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgPriceByBrand}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text)" opacity={0.2} />
              <XAxis dataKey="brand" stroke="var(--color-text)" />
              <YAxis stroke="var(--color-text)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  borderRadius: "10px",
                }}
              />
              <Bar dataKey="avgPrice" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Fuel Distribution */}
        <section className="bg-[var(--color-bg)] rounded-2xl shadow-lg border border-[var(--color-text)]/20 p-6 mb-12 transition">
          <h2 className="text-xl font-semibold mb-4">⛽ Fuel Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fuelDist}
                dataKey="count"
                nameKey="fuel"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {fuelDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  borderRadius: "10px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Top Performance */}
        <section className="bg-[var(--color-bg)] rounded-2xl shadow-lg border border-[var(--color-text)]/20 p-6 mb-12 transition">
          <h2 className="text-xl font-semibold mb-4">🏎️ Top Performance Vehicles</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text)" opacity={0.2} />
              <XAxis dataKey="name" stroke="var(--color-text)" />
              <YAxis stroke="var(--color-text)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  borderRadius: "10px",
                }}
              />
              <Bar dataKey="performance" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

      </div>
    </div>
  );
};

export default Insights;
