import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  },
  { timestamps: true }
);

// Prevent duplicate favorites per user
favoriteSchema.index({ userId: 1, vehicleId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
