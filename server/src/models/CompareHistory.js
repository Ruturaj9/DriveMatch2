import mongoose from "mongoose";

const compareHistorySchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true },     // Any room/session id or auto-increment
    verdict: { type: String, required: true },        // ChatGPT’s summary/winner
    winnerId: { type: String },                       // Vehicle winner id
    userType: { type: String, default: "guest" },     // guest or logged in user
  },
  { timestamps: true }
);

export default mongoose.model("CompareHistory", compareHistorySchema);
