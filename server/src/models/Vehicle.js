import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // ---------- Basic Info ----------
    name: { type: String, required: true },
    brand: { type: String, required: true },
    type: { type: String, enum: ["car", "bike"], required: true },
    variant: { type: String },
    modelYear: { type: Number },
    price: { type: Number, required: true },
    onRoadPrice: { type: Number },

    // ---------- Technical Specs ----------
    engine: { type: String },
    enginePower: { type: String },
    torque: { type: String },
    fuelType: { type: String },
    mileage: { type: String },
    transmission: { type: String },
    driveType: { type: String },
    topSpeed: { type: String },
    acceleration: { type: String },
    emissionNorm: { type: String },
    chargingTime: { type: String },
    batteryCapacity: { type: String },

    // ---------- Dimensions & Capacity ----------
    seatingCapacity: { type: Number },
    bootSpace: { type: String },
    fuelTankCapacity: { type: String },
    kerbWeight: { type: String },
    groundClearance: { type: String },
    wheelbase: { type: String },

    // ---------- Features ----------
    bodyType: { type: String },
    colorOptions: [{ type: String }],
    interiorFeatures: [{ type: String }],
    safetyFeatures: [{ type: String }],
    infotainmentFeatures: [{ type: String }],
    comfortFeatures: [{ type: String }],
    exteriorFeatures: [{ type: String }],

    // ---------- Images & Media ----------
    image: { type: String },
    imageGallery: [{ type: String }],
    videoLink: { type: String },

    // ---------- Performance & Ratings ----------
    performanceScore: { type: Number, default: 0 },
    ecoScore: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // ---------- Analytics ----------
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },

    // ---------- Miscellaneous ----------
    dealerLocations: [{ type: String }],
    tags: [{ type: String }],
    availabilityStatus: {
      type: String,
      enum: ["Available", "Discontinued", "Upcoming"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
