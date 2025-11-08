import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    // --- YEH HAI FIX: "station" ko "train_station" kar diya ---
    enum: ["city", "train_station", "airport"],
    required: true,
  },
});

locationSchema.index({ name: "text", state: 1, type: 1 });

const Location = mongoose.model("Location", locationSchema);

export default Location;