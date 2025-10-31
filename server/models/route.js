import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
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
    enum: ['bus', 'train', 'air'],
    required: true,
  },
  color: {
    type: String,
    default: '#3B82F6',
  },
  startPoint: {
    type: String,
    required: true,
  },
  endPoint: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  // New Scheduling Fields
  scheduleType: {
    type: String,
    enum: ['daily', 'weekly', 'specific_date'],
  },
  // Changed from dayOfWeek to daysOfWeek to support multiple days for 'weekly'
  daysOfWeek: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  specificDate: {
    type: Date,
  },
  // Fields for 'bus', 'train', and 'air' with specific times
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  frequency: {
    type: Number,
  },
  stops: {
    type: [String],
  },
  // Fields for 'air'
  flightNumber: {
    type: String,
  },
  airline: {
    type: String,
  },
}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);

export default Route;
