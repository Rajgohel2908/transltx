import mongoose from "mongoose";

const rateSchema = new mongoose.Schema(
  {
    car: { type: Number, required: true },
    bus: { type: Number, required: true },
    bike: { type: Number, required: true },
  },
  { _id: false }
); // _id: false prevents Mongoose from creating an id for this sub-document

const parkingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Parking lot name is required."],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "A location or landmark is required."],
      trim: true,
    },
    totalSlots: {
      type: Number,
      required: [true, "Total number of slots is required."],
      min: 1,
    },
    availableSlots: {
      type: Number,
      required: [true, "Number of available slots is required."],
      min: 0,
      validate: {
        validator: function (value) {
          // 'this' refers to the document being validated
          return value <= this.totalSlots;
        },
        message: "Available slots cannot be greater than total slots.",
      },
    },
    rates: {
      type: rateSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// This ensures Mongoose uses the collection name 'parkings'
const Parking = mongoose.model("Parking", parkingSchema);

export default Parking;
