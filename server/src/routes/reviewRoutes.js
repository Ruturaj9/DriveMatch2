import express from "express";
import Review from "../models/Review.js";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/* ==========================================================
   POST: Add a new review
   ========================================================== */
router.post("/", async (req, res) => {
  try {
    const { vehicleId, name, rating, comment } = req.body;

    if (!vehicleId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.create({ vehicleId, name, rating, comment });

    // Optionally: Update average rating in Vehicle collection
    const reviews = await Review.find({ vehicleId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Vehicle.findByIdAndUpdate(vehicleId, { avgRating });

    res.status(201).json({
      message: "Review added successfully",
      review,
      avgRating: avgRating.toFixed(1),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   GET: Reviews for a specific vehicle
   ========================================================== */
router.get("/:vehicleId", async (req, res) => {
  try {
    const reviews = await Review.find({ vehicleId: req.params.vehicleId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (reviews.length === 0) {
      return res.json({ message: "No reviews yet for this vehicle." });
    }

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    res.json({
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
