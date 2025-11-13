import express from "express";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/* ==========================================================
   🟢 POST: Add new vehicle
   ========================================================== */
router.post("/", async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ==========================================================
   🔵 GET: Get all vehicles (with filters)
   ========================================================== */
router.get("/", async (req, res) => {
  try {
    const { name, brand, minPrice, maxPrice, type } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   🔥 GET: Trending vehicles
   ========================================================== */
router.get("/trending", async (req, res) => {
  try {
    const trendingVehicles = await Vehicle.find({ isTrending: true }).limit(10);
    res.json(trendingVehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   🔍 GET: Single Vehicle Details
   ========================================================== */
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   ⚙️ Helper Functions for Similarity
   ========================================================== */

// Extract numeric value (e.g., "1497cc" → 1497)
function parseNumber(value) {
  if (!value) return 0;
  const num = parseFloat(value.toString().replace(/[^\d.]/g, ""));
  return isNaN(num) ? 0 : num;
}

// Weighted similarity scoring
function calculateSimilarity(base, candidate) {
  let score = 0;

  const basePrice = parseNumber(base.price);
  const candPrice = parseNumber(candidate.price);
  const basePower = parseNumber(base.enginePower);
  const candPower = parseNumber(candidate.enginePower);
  const baseTorque = parseNumber(base.torque);
  const candTorque = parseNumber(candidate.torque);
  const baseMileage = parseNumber(base.mileage);
  const candMileage = parseNumber(candidate.mileage);

  const priceDiff = Math.abs(basePrice - candPrice) / (basePrice || 1);
  const powerDiff = Math.abs(basePower - candPower) / (basePower || 1);
  const torqueDiff = Math.abs(baseTorque - candTorque) / (baseTorque || 1);
  const mileageDiff = Math.abs(baseMileage - candMileage) / (baseMileage || 1);

  // Weighted scoring (100 = identical)
  score += (1 - priceDiff) * 25;
  score += (1 - powerDiff) * 20;
  score += (1 - mileageDiff) * 15;
  score += (1 - torqueDiff) * 10;

  if (base.fuelType === candidate.fuelType) score += 5;
  if (base.transmission === candidate.transmission) score += 5;
  if (base.bodyType === candidate.bodyType) score += 5;

  const perfDiff = Math.abs(base.performanceScore - candidate.performanceScore) / 100;
  const ecoDiff = Math.abs(base.ecoScore - candidate.ecoScore) / 100;
  score += (1 - perfDiff) * 10;
  score += (1 - ecoDiff) * 5;

  return Math.round(score);
}

/* ==========================================================
   🧠 GET: Smart Technical Similar Vehicles (Optimized + Weighted)
   ========================================================== */
router.get("/similar/:id", async (req, res) => {
  try {
    const baseVehicle = await Vehicle.findById(req.params.id);
    if (!baseVehicle)
      return res.status(404).json({ message: "Vehicle not found" });

    const minPrice = baseVehicle.price * 0.85;
    const maxPrice = baseVehicle.price * 1.15;

    // Step 1: Fast filtering (limit to 100 candidates)
    const candidates = await Vehicle.find({
      _id: { $ne: baseVehicle._id },
      type: baseVehicle.type,
      price: { $gte: minPrice, $lte: maxPrice },
      fuelType: baseVehicle.fuelType,
      transmission: baseVehicle.transmission,
    })
      .select(
        "name brand type price enginePower torque mileage fuelType transmission performanceScore ecoScore bodyType"
      )
      .limit(100);

    // Step 2: Compute similarity scores
    const scored = candidates.map((vehicle) => ({
      vehicle,
      score: calculateSimilarity(baseVehicle, vehicle),
    }));

    // Step 3: Sort and return top 4
    const topMatches = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.vehicle);

    res.json({
      base: baseVehicle,
      similar: topMatches,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   ⚖️ POST: Compare multiple vehicles by IDs
   ========================================================== */
router.post("/compare", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({
        message: "Please provide at least two vehicle IDs to compare.",
      });
    }

    const vehicles = await Vehicle.find({ _id: { $in: ids } });

    if (vehicles.length === 0) {
      return res.status(404).json({ message: "No vehicles found." });
    }

    res.json({
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
