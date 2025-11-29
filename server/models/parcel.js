import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const parcelDetailsSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  length: { type: Number },
  width: { type: Number },
  height: { type: Number },
  description: { type: String, required: true },
}, { _id: false });

const parcelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: addressSchema,
    recipient: addressSchema,
    parcel: parcelDetailsSchema,
    fare: {
      type: Number,
      required: [true, "Fare is required."],
      min: [0, "Fare cannot be negative."],
    },
    status: {
      type: String,
      enum: ["pending", "in-transit", "delivered", "cancelled", "out-for-delivery"],
      default: "pending",
    },
    adminTag: {
      type: String,
      trim: true,
      default: "", // Defaults to an empty string
    },
    orderId: { type: String },
    paymentStatus: { type: String, default: 'Pending' },
  },
  {
    timestamps: true,
    collection: "parcel",
  }
);

const Parcel = mongoose.models.Parcel || mongoose.model("Parcel", parcelSchema);

export default Parcel;
