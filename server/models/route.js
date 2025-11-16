import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  priceFromStart: { type: Number, required: true, min: 0 },
  estimatedTimeAtStop: { type: String, required: true },
}, { _id: false });

const routeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['bus', 'train', 'air'], required: true },
  operator: { type: String, required: true },
  amenities: { type: [String], default: [] },
  estimatedArrivalTime: { type: String, required: true },
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },
  // Scheduling
  scheduleType: { type: String, enum: ['daily', 'weekly', 'specific_date'] },
  daysOfWeek: { type: [String], enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  specificDate: { type: Date },
  startTime: { type: String },
  
  // --- NEW FIELD ADDED HERE ---
  totalSeats: { type: Number, required: true, default: 40 }, // Default 40 for buses
  // ---------------------------

  stops: { type: [stopSchema], default: [] },
  flightNumber: { type: String },
  airline: { type: String },
  price: {
    type: mongoose.Schema.Types.Mixed, 
    default: 0,
  },
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);

export default Route;