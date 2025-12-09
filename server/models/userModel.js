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

  // --- NEW FIELDS ---
  role: {
    type: String,
    enum: ['user', 'admin', 'partner'],
    default: 'user'
  },
  partnerDetails: {
    companyName: { type: String },
    contactNumber: { type: String },
    licenseNumber: { type: String },
    serviceType: { type: String, enum: ['Bus', 'Train', 'Air', 'Ride', 'Parking', 'All', 'bus', 'train', 'air', 'ride', 'parking', 'all'] }
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