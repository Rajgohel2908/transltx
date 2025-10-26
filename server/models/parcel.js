import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: [true, "Sender name is required."],
    },
    senderPhone: {
      type: String,
      required: [true, "Sender phone number is required."],
    },
    source: {
      type: String,
      required: [true, "Source location is required."],
    },
    destination: {
      type: String,
      required: [true, "Destination location is required."],
    },
    packageType: {
      type: String,
      enum: ["document", "small_box", "large_box", "other"],
      required: true,
    },
    weight: {
      type: Number,
      required: [true, "Package weight is required."],
      min: [0, "Weight cannot be negative."],
    },
    fare: {
      type: Number,
      required: [true, "Fare is required."],
      min: [0, "Fare cannot be negative."],
    },
    status: {
      type: String,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    // --- NEW FIELD for the admin's custom message ---
    adminTag: {
      type: String,
      trim: true,
      default: "", // Defaults to an empty string
    },
  },
  {
    timestamps: true,
    collection: "parcel",
  }
);

const Parcel = mongoose.model("Parcel", parcelSchema);

export default Parcel;
