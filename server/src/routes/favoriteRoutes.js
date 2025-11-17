import express from "express";
import Favorite from "../models/Favorite.js";
import Vehicle from "../models/Vehicle.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================================================
      ⭐ ADD VEHICLE TO FAVORITES
======================================================= */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: "vehicleId required" });
    }

    // Check existing
    const exists = await Favorite.findOne({ userId, vehicleId });
    if (exists) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    await Favorite.create({ userId, vehicleId });

    res.json({ message: "Added to favorites" });
  } catch (err) {
    console.error("Favorite add error:", err);
    return res.status(500).json({ message: "Error adding favorite" });
  }
});

/* =======================================================
      ⭐ REMOVE A VEHICLE FROM FAVORITES
======================================================= */
router.delete("/remove/:vehicleId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.params;

    const result = await Favorite.findOneAndDelete({ userId, vehicleId });

    if (!result) {
      return res.status(404).json({ message: "Not found in favorites" });
    }

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Favorite remove error:", err);
    res.status(500).json({ message: "Error removing favorite" });
  }
});

/* =======================================================
      ⭐ GET ALL FAVORITES FOR LOGGED-IN USER
======================================================= */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ userId })
      .populate("vehicleId")
      .lean();

    // Return only vehicles
    res.json(favorites.map((f) => f.vehicleId));
  } catch (err) {
    console.error("Fetch favorites error:", err);
    return res.status(500).json({ message: "Error fetching favorites" });
  }
});

/* =======================================================
      ⭐ CHECK IF SINGLE VEHICLE IS FAVORITED
======================================================= */
router.get("/check/:vehicleId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId } = req.params;

    const exists = await Favorite.findOne({ userId, vehicleId });

    res.json({ favorited: !!exists });
  } catch (err) {
    console.error("Check favorite error:", err);
    res.status(500).json({ message: "Error checking favorite" });
  }
});

/* =======================================================
      ⭐ CLEAR ALL FAVORITES FOR USER
======================================================= */
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await Favorite.deleteMany({ userId });

    res.json({ message: "All favorites cleared" });
  } catch (err) {
    console.error("Clear favorites error:", err);
    res.status(500).json({ message: "Error clearing favorites" });
  }
});

export default router;
