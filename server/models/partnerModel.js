
import mongoose, { model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from "crypto";

const { Schema } = mongoose;

const partnerSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, default: 'partner', immutable: true }, // Always 'partner'
    partnerDetails: {
        companyName: { type: String, required: true },
        contactNumber: { type: String, required: true },
        licenseNumber: { type: String },
        serviceType: {
            type: String,
            enum: ['Bus', 'Train', 'Air', 'Ride', 'Parking', 'All', 'bus', 'train', 'air', 'ride', 'parking', 'all'],
            required: true
        }
    },
    createdAt: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

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
});

// Reuse password hashing middleware
partnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Reuse compare password method
partnerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Reuse reset token method
partnerSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const Partner = model('Partner', partnerSchema);
export default Partner;
