import express from "express";      //Creates the web server and defines your API routes
import cors from "cors";            //Lets your frontend (React) talk to your backend safely
import dotenv from "dotenv";        //Reads variables from a .env file (like your DB URL and port)
import connectDB from "./config/db.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";
import compareRoutes from "./routes/compareRoutes.js";

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/compare", compareRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("🚗 DriveMatch backend connected to MongoDB successfully!");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

