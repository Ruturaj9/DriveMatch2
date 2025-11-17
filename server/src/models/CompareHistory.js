import mongoose from "mongoose";

const compareHistorySchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true },
    
    // ⭐ FULL OBJECTS STORED
    vehicles: [
      {
        _id: String,
        name: String,
        brand: String,
        type: String,
        price: Number,
        image: String,
        mileage: String,
        enginePower: String,
        performanceScore: Number
      }
    ],

    winnerId: { type: String },
    verdict: { type: String, required: true },
    userType: { type: String, default: "guest" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("CompareHistory", compareHistorySchema);
