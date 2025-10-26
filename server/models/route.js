import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const routeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["pedal", "cycle", "two-wheeler", "car", "bus", "metro"], // Added bus/metro
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    stops: {
      type: [stopSchema],
      validate: [(arr) => arr.length > 0, "At least one stop is required"],
    },
    // --- NEW SCHEDULE FIELDS ---
    startTime: {
      type: String, // e.g., "06:00"
      required: true,
      default: "06:00",
    },
    endTime: {
      type: String, // e.g., "22:00"
      required: true,
      default: "22:00",
    },
    frequency: {
      type: Number, // Frequency in minutes
      required: true,
      default: 15,
    },
  },
  {
    timestamps: true,
    // Note: Mongoose automatically looks for the plural, lowercased version of your model name.
    // So, a model named 'Route' will use the 'routes' collection by default.
  }
);

const Route = mongoose.model("Route", routeSchema);
export default Route;
