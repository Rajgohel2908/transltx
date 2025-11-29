import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, required: true, enum: ['Bus', 'Train', 'Air', 'Ride', 'Trips', 'Carpool'] },

  // --- YEH HAI NAYA DATA ---
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' }, // Route se direct link
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }, // Carpool Ride se direct link
  classType: { type: String, default: 'default' }, // e.g., 'Sleeper', 'Economy'
  departureDateTime: { type: Date }, // Poori date + time
  arrivalDateTime: { type: Date }, // Poori date + time
  travelDate: { type: Date }, // Sirf date (Trip ke liye)
  // -------------------------

  // --- YEH PURANA DATA MODIFY KIYA ---
  service: { type: String, required: true }, // Bus/Train/Flight/Trip name
  serviceLogo: { type: String },
  from: { type: String, required: true },
  to: { type: String, required: true },
  duration: { type: String },
  departure: { type: String }, // Legacy string support
  arrival: { type: String },   // Legacy string support

  passengers: { type: [passengerSchema], required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },

  fare: { type: Number, required: true },
  pnrNumber: { type: String, unique: true, required: true },
  paymentId: { type: String },
  orderId: { type: String },
  paymentStatus: { type: String, default: 'Pending' },
  bookingStatus: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled'] },

}, { timestamps: true });

// PNR generator (runs before validation)
bookingSchema.pre('validate', async function (next) {
  if (this.isNew && !this.pnrNumber) {
    let pnr = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    do {
      pnr = '';
      for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Ensure bookingType exists, fallback to 'T' (Trip) if missing
      const typePrefix = this.bookingType ? this.bookingType.slice(0, 1) : 'T';
      pnr = `${typePrefix}${pnr}`;
    } while (await mongoose.models.Booking.findOne({ pnrNumber: pnr }));
    this.pnrNumber = pnr;
  }
  next();
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;