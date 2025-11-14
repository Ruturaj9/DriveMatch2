import express from "express";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/* ==========================================================
   🌱 POST: Bulk Insert Vehicles (NO DELETE — APPEND ONLY)
   ========================================================== */
router.post("/seed", async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Please send an array of vehicles to seed.",
      });
    }

    console.log(`Received ${req.body.length} vehicles to insert...`);

    // Insert vehicles — ignore errors, continue inserting others
    const inserted = await Vehicle.insertMany(req.body, {
      ordered: false, // continues even if some fail (duplicates etc.)
    });

    res.json({
      message: "Vehicles added successfully!",
      insertedCount: inserted.length,
    });
  } catch (err) {
    // Handle duplicate or partial insert errors
    if (err.writeErrors) {
      return res.json({
        message: "Some vehicles inserted (duplicates skipped).",
        insertedCount: err.result?.nInserted || 0,
        duplicateErrors: err.writeErrors.length,
      });
    }

    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   🟢 POST: Add new vehicle (single insert)
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
    const trendingVehicles = await Vehicle.find({ isTrending: true }).limit(
      300
    );
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
function parseNumber(value) {
  if (!value) return 0;
  const num = parseFloat(value.toString().replace(/[^\d.]/g, ""));
  return isNaN(num) ? 0 : num;
}

function calculateSimilarity(base, cand) {
  let score = 0;

  const basePrice = parseNumber(base.price);
  const candPrice = parseNumber(cand.price);
  const basePower = parseNumber(base.enginePower);
  const candPower = parseNumber(cand.enginePower);
  const baseTorque = parseNumber(base.torque);
  const candTorque = parseNumber(cand.torque);
  const baseMileage = parseNumber(base.mileage);
  const candMileage = parseNumber(cand.mileage);

  const priceDiff = Math.abs(basePrice - candPrice) / (basePrice || 1);
  const powerDiff = Math.abs(basePower - candPower) / (basePower || 1);
  const torqueDiff = Math.abs(baseTorque - candTorque) / (baseTorque || 1);
  const mileageDiff = Math.abs(baseMileage - candMileage) / (baseMileage || 1);

  score += (1 - priceDiff) * 25;
  score += (1 - powerDiff) * 20;
  score += (1 - mileageDiff) * 15;
  score += (1 - torqueDiff) * 10;

  if (base.fuelType === cand.fuelType) score += 5;
  if (base.transmission === cand.transmission) score += 5;
  if (base.bodyType === cand.bodyType) score += 5;

  const perfDiff =
    Math.abs(base.performanceScore - cand.performanceScore) / 100;
  const ecoDiff = Math.abs(base.ecoScore - cand.ecoScore) / 100;

  score += (1 - perfDiff) * 10;
  score += (1 - ecoDiff) * 5;

  return Math.round(score);
}

/* ==========================================================
   🧠 GET: Smart Technical Similar Vehicles
   ========================================================== */
router.get("/similar/:id", async (req, res) => {
  try {
    const baseVehicle = await Vehicle.findById(req.params.id);
    if (!baseVehicle)
      return res.status(404).json({ message: "Vehicle not found" });

    const minPrice = baseVehicle.price * 0.85;
    const maxPrice = baseVehicle.price * 1.15;

    const candidates = await Vehicle.find({
      _id: { $ne: baseVehicle._id },
      type: baseVehicle.type,
      price: { $gte: minPrice, $lte: maxPrice },
      fuelType: baseVehicle.fuelType,
      transmission: baseVehicle.transmission,
    })
      .select(
        "name brand type price enginePower torque mileage fuelType transmission performanceScore ecoScore bodyType image"
      )
      .limit(300);

    const scored = candidates.map((vehicle) => ({
      vehicle,
      score: calculateSimilarity(baseVehicle, vehicle),
    }));

    const similarTop4 = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.vehicle);

    res.json({
      base: baseVehicle,
      similar: similarTop4,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   ⚖️ POST: Compare vehicles by IDs
   ========================================================== */
router.post("/compare", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length < 2)
      return res.status(400).json({ message: "Need at least 2 vehicle IDs." });

    const vehicles = await Vehicle.find({ _id: { $in: ids } });

    res.json({ count: vehicles.length, vehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
