import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "An alert title is required."],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "An alert message is required."],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Info", "Warning", "Critical"],
      required: true,
      default: "Info",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// This ensures Mongoose uses the collection name 'alerts'
const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
