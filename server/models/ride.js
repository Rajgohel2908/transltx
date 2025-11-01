import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // --- NEW FIELD for the driver's contact number ---
    driverPhone: {
      type: String,
      required: [true, "A contact number is required for the driver."],
      trim: true,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    from: {
      type: String,
      required: [true, "A starting location is required."],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "A destination is required."],
      trim: true,
    },
    departureTime: {
      type: Date,
      required: [true, "A departure time is required."],
    },
    seatsAvailable: {
      type: Number,
      required: [true, "Please specify the number of available seats."],
      min: [1, "You must offer at least one seat."],
      default: 1,
    },
    price: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["active", "booked", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Ride = mongoose.model("Ride", rideSchema);

export default Ride;
