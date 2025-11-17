import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Routes
import vehicleRoutes from "./routes/vehicleRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";
import compareRoutes from "./routes/compareRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

dotenv.config(); // Load .env

const app = express();
const PORT = process.env.PORT || 5000;

// 1️⃣ Connect to MongoDB
connectDB();

// 2️⃣ Middlewares
app.use(cors());
app.use(express.json());

// 3️⃣ API Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);

// 4️⃣ Test Route
app.get("/", (req, res) => {
  res.send("🚗 DriveMatch backend connected to MongoDB successfully!");
});

// 5️⃣ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
