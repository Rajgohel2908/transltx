import mongoose from "mongoose";

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
    duration: {
      type: String,
      required: [true, "A trip duration is required."],
    },
    price: {
      type: String, // Storing as a string like "$149" to match your component
      required: [true, "A price is required."],
    },
    image: {
      type: String, // URL to the image
      required: [true, "An image URL is required."],
    },
    features: {
      type: [String], // An array of feature strings
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// This ensures Mongoose uses the collection name 'trips'
const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
