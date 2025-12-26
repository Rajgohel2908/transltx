import mongoose, { model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from "crypto";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  // --- YE 2 FIELDS MISSING THE, AB ADD KAR DIYE ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // --- PARTNER SYSTEM FIELDS ---
  role: {
    type: String,
    enum: ['user', 'admin', 'operator', 'driver', 'parking_owner'],
    default: 'user'
  },
  phone: { type: String },

  // Operator-specific fields (Bus, Train, Airline operators)
  operatorDetails: {
    companyName: { type: String },
    serviceType: { type: String, enum: ['bus', 'train', 'airline'] },
    licenseNumber: { type: String },
    gstNumber: { type: String },
    contactNumber: { type: String }
  },

  // Driver-specific fields (Ride-hailing)
  driverDetails: {
    vehicle_type: {
      type: String,
      enum: ['bike', 'car', 'van', 'auto']
    },
    vehicle_number: { type: String },
    license_number: { type: String },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },

  // Parking Owner-specific fields
  parkingDetails: {
    parkingName: { type: String },
    address: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    totalSlots: { type: Number },
    availableSlots: { type: Number },
    pricing: {
      twoWheeler: { type: Number },
      fourWheeler: { type: Number },
      bus: { type: Number }
    },
    isOpen: { type: Boolean, default: true }
  }
  // ------------------
});

// Mongoose middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Token Hash karke DB mein save kar
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Token 10 minute mein expire hoga
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = model('User', userSchema);

export default User;