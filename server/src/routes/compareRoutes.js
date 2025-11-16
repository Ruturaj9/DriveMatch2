import express from "express";
import Vehicle from "../models/Vehicle.js";
import CompareHistory from "../models/CompareHistory.js";

const router = express.Router();

/* =====================================================
   COMPARE VEHICLES — AI Verdict (Your existing logic)
===================================================== */

router.post("/", async (req, res) => {
  try {
    const { v1, v2, verdict } = req.body;

    if (!v1 || !v2 || !verdict) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Save to history automatically
    await CompareHistory.create({
      roomNumber: Math.floor(Date.now() / 1000), // unique session ID
      verdict,
      winnerId: verdict.includes("1") ? v1 : v2, // crude logic; update if needed
      userType: "guest",
    });

    res.json({ message: "Comparison saved", verdict });
  } catch (err) {
    console.error("Compare Save Error:", err);
    res.status(500).json({ message: "Error saving comparison" });
  }
});

/* =====================================================
   SAVE HISTORY (manual save endpoint)
===================================================== */

router.post("/save", async (req, res) => {
  try {
    const { roomNumber, verdict, winnerId } = req.body;

    await CompareHistory.create({
      roomNumber,
      verdict,
      winnerId,
      userType: "guest",
    });

    res.json({ message: "Saved to history!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving history" });
  }
});

/* =====================================================
   GET GUEST HISTORY (your CompareHistory.jsx fetch)
===================================================== */

router.get("/history/guest", async (req, res) => {
  try {
    const history = await CompareHistory.find({ userType: "guest" })
      .sort({ createdAt: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;
