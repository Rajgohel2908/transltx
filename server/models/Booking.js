import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const passengerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pnrNumber: { type: String, unique: true },
  bookingType: { type: String, enum: ['Bus', 'Train', 'Air', 'Parcel'], required: true },
  bookingStatus: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Confirmed' },
  
  service: { type: String, required: true },
  serviceLogo: { type: String },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  duration: { type: String },

  passengers: [passengerSchema],
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },

  fare: { type: Number, required: true },
  paymentId: { type: String },
  orderId: { type: String },
  paymentStatus: { type: String },
}, { timestamps: true });

// Middleware to generate a PNR before saving
bookingSchema.pre('save', function(next) {
  if (!this.pnrNumber) {
    // Generate a simple, unique PNR, e.g., "TRN-" + 6 random alphanumeric chars
    this.pnrNumber = `TRN-${uuidv4().slice(0, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);