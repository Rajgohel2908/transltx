import mongoose from "mongoose";

const itineraryItemSchema = new mongoose.Schema({
  day: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const logisticsSchema = new mongoose.Schema({
  meetingPoint: { type: String, trim: true },
  reportingTime: { type: String, trim: true },
  departureTime: { type: String, trim: true },
}, { _id: false });

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A trip name is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A trip description is required."],
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Bus", "Train", "Air"],
      default: "Bus",
    },
    from: { type: String, trim: true },
    to: { type: String, trim: true },
    departureTime: { type: String },
    arrivalTime: { type: String },
    duration: {
      type: String,
      required: [true, "A trip duration is required."],
    },
    price: {
      type: Number,
      required: [true, "A price is required."],
      min: 0,
    },
    image: {
      type: String, // URL to the image
      required: [true, "An image URL is required."],
    },
    features: {
      type: [String], // An array of feature strings
      default: [],
    },
    itinerary: {
      type: [itineraryItemSchema],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: { type: [String], default: [] },
    whatToCarry: {
      type: [String],
      default: [],
    },
    logistics: {
      type: logisticsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// This ensures Mongoose uses the collection name 'trips'
const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
