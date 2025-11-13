import mongoose from "mongoose";

const compareHistorySchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true },
    vehicles: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
        name: String,
        brand: String,
        price: Number,
        mileage: String,
        performanceScore: Number,
      },
    ],
    verdict: { type: String, required: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    userId: { type: String, default: "guest" }, // placeholder for future login
  },
  { timestamps: true }
);

const CompareHistory = mongoose.model("CompareHistory", compareHistorySchema);
export default CompareHistory;
