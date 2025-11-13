import express from "express";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

/* ==========================================================
   ⚙️ POST: Save Compare Session
   ========================================================== */
router.post("/save", async (req, res) => {
  try {
    const { roomNumber, vehicles, verdict, winnerId, userId } = req.body;

    // For now, just log — later you can save to a collection if needed
    console.log(`🧾 Compare Room ${roomNumber} saved for user: ${userId}`);
    res.json({ message: "Compare session saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   🧠 POST: AI Verdict (Server-side)
   ========================================================== */
router.post("/ai-verdict", async (req, res) => {
  try {
    const { vehicles } = req.body;
    if (!vehicles || vehicles.length < 2)
      return res.status(400).json({ message: "Need at least two vehicles." });

    // 🧩 Simple comparison logic (can be replaced with AI-based logic)
    const scores = vehicles.map((v) => ({
      id: v._id,
      name: v.name,
      score:
        (v.performanceScore || 0) * 0.4 +
        (parseFloat(v.mileage) || 0) * 0.3 +
        (1 / (v.price || 1)) * 0.3,
    }));

    const winner = scores.reduce((a, b) => (b.score > a.score ? b : a));
    const verdict = `💬 ${winner.name} wins this comparison with the best overall balance of performance, mileage, and price.`;

    res.json({
      verdict,
      winnerId: winner.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==========================================================
   🧾 GET: Compare Vehicles by IDs (fallback)
   ========================================================== */
router.post("/", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length < 2)
      return res.status(400).json({ message: "Please provide at least 2 IDs." });

    const vehicles = await Vehicle.find({ _id: { $in: ids } });
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
