// server/src/routes/compareRoutes.js
import express from "express";
import Vehicle from "../models/Vehicle.js";
import CompareHistory from "../models/CompareHistory.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
   SAVE COMPARISON – Logged-in users only
   POST /api/compare/
========================================================== */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { v1, v2, verdict } = req.body;

    if (!v1 || !v2 || !verdict) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const veh1 = await Vehicle.findById(v1).lean();
    const veh2 = await Vehicle.findById(v2).lean();

    if (!veh1 || !veh2) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const winnerId = verdict.includes("1") ? v1 : v2;

    await CompareHistory.create({
      userId: req.user.id,
      userType: "user",

      roomNumber: Math.floor(Date.now() / 1000),

      vehicles: [
        {
          _id: veh1._id,
          name: veh1.name,
          brand: veh1.brand,
          type: veh1.type,
          price: veh1.price,
          image: veh1.image,
          mileage: veh1.mileage,
          enginePower: veh1.enginePower,
          performanceScore: veh1.performanceScore,
        },
        {
          _id: veh2._id,
          name: veh2.name,
          brand: veh2.brand,
          type: veh2.type,
          price: veh2.price,
          image: veh2.image,
          mileage: veh2.mileage,
          enginePower: veh2.enginePower,
          performanceScore: veh2.performanceScore,
        },
      ],

      winnerId,
      verdict,
    });

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error("Compare Save Error:", err);
    res.status(500).json({ message: "Error saving comparison" });
  }
});

/* ==========================================================
   MANUAL SAVE (ALSO AUTH REQUIRED)
========================================================== */
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { roomNumber, verdict, winnerId, vehicles, v1, v2 } = req.body;

    if (!verdict) {
      return res.status(400).json({ message: "Verdict required" });
    }

    let vehiclesToStore = [];

    // If the frontend sends the full objects
    if (Array.isArray(vehicles) && vehicles.length >= 1) {
      vehiclesToStore = vehicles.map((v) => ({
        _id: v._id,
        name: v.name,
        brand: v.brand,
        type: v.type,
        price: v.price,
        image: v.image,
        mileage: v.mileage,
        enginePower: v.enginePower,
        performanceScore: v.performanceScore,
      }));
    }
    // Fallback: if frontend sent v1/v2 ids
    else if (v1 && v2) {
      const [veh1, veh2] = await Promise.all([
        Vehicle.findById(v1).lean(),
        Vehicle.findById(v2).lean(),
      ]);

      if (!veh1 || !veh2) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const compact = (v) => ({
        _id: v._id,
        name: v.name,
        brand: v.brand,
        type: v.type,
        price: v.price,
        image: v.image,
        mileage: v.mileage,
        enginePower: v.enginePower,
        performanceScore: v.performanceScore,
      });

      vehiclesToStore = [compact(veh1), compact(veh2)];
    } else {
      return res.status(400).json({ message: "Provide vehicles or ids" });
    }

    await CompareHistory.create({
      userId: req.user.id,
      userType: "user",
      roomNumber: roomNumber || Math.floor(Date.now() / 1000),
      vehicles: vehiclesToStore,
      winnerId: winnerId || vehiclesToStore[0]._id,
      verdict,
    });

    res.json({ message: "Saved!" });
  } catch (err) {
    console.error("Compare manual save error:", err);
    res.status(500).json({ message: "Error saving history" });
  }
});

/* ==========================================================
   GET USER HISTORY (NO GUEST)
========================================================== */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await CompareHistory.find({
      userType: "user",
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    console.error("Fetch user history error:", err);
    res.status(500).json({ message: "Error fetching history" });
  }
});

/* ==========================================================
   DELETE SINGLE HISTORY (Only user's own)
========================================================== */
router.delete("/history/:id", authMiddleware, async (req, res) => {
  try {
    const item = await CompareHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ message: "Not found or not allowed" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting" });
  }
});

/* ==========================================================
   CLEAR ALL HISTORY (Only for this user)
========================================================== */
router.delete("/history", authMiddleware, async (req, res) => {
  try {
    await CompareHistory.deleteMany({ userId: req.user.id });
    res.json({ message: "All cleared" });
  } catch (err) {
    console.error("Clear error:", err);
    res.status(500).json({ message: "Error clearing" });
  }
});

export default router;
