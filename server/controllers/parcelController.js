import mongoose from "mongoose"; // Import mongoose to use ObjectId
import Parcel from "../models/parcel.js";
import Route from "../models/route.js";
import {
  sendParcelEmail,
  sendParcelSms,
  sendParcelStatusUpdateEmail,
  sendParcelStatusUpdateSms
} from "../utils/notificationService.js";

// --- Helper functions (no changes) ---
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// --- calculateFare (no changes) ---
export const calculateFare = async (req, res) => {
  try {
    console.log("--- Calculate Fare Request ---");
    console.log("Body:", req.body);
    const { source, destination, weight, length, width, height } = req.body;

    if (!source || !destination || !weight || !source.postalCode || !destination.postalCode) {
      console.error("Missing required fields for fare calculation");
      return res
        .status(400)
        .json({ message: "Source, destination, weight, and postal codes are required." });
    }

    // More realistic fare calculation based on weight and dimensions
    const baseFare = 500; // Base rate in INR
    const weightCharge = parseFloat(weight) * 20; // ₹20 per kg

    // Optional: Add dimensional weight calculation
    const volume = (parseFloat(length) || 1) * (parseFloat(width) || 1) * (parseFloat(height) || 1);
    const dimensionalWeight = volume / 5000; // Standard dimensional weight factor
    const chargeableWeight = Math.max(parseFloat(weight), dimensionalWeight);
    const dimensionalCharge = chargeableWeight > parseFloat(weight) ? (chargeableWeight - parseFloat(weight)) * 10 : 0;

    const totalFare = baseFare + weightCharge + dimensionalCharge;
    console.log(`Calculated Fare: ${totalFare} (Base: ${baseFare}, Weight: ${weightCharge}, Dim: ${dimensionalCharge})`);

    if (isNaN(totalFare)) {
      console.error("Fare calculation resulted in NaN");
      return res
        .status(500)
        .json({ message: "Fare calculation resulted in an error." });
    }
    res.status(200).json({ fare: totalFare.toFixed(2) });
  } catch (error) {
    console.error("Fare Calculation Error:", error);
    res.status(500).json({ message: "Server error during fare calculation." });
  }
};

// --- createBooking (UPDATED TO MATCH NEW SCHEMA) ---
export const createBooking = async (req, res) => {
  try {
    const {
      user,
      sender,
      recipient,
      parcel,
      fare,
    } = req.body;
    if (
      !user ||
      !sender ||
      !recipient ||
      !parcel ||
      !fare
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields for booking." });
    }

    const newParcel = new Parcel({
      user: user._id || user, // Handle both object and string ID
      sender,
      recipient,
      parcel,
      fare,
      status: "pending",
    });

    const savedParcel = await newParcel.save();
    console.log("Parcel saved successfully:", savedParcel);

    // --- NOTIFICATIONS REMOVED (Moved to Payment Verification) ---
    // sendParcelEmail(savedParcel).catch(err => console.error("Parcel Email Fail:", err));
    // sendParcelSms(savedParcel).catch(err => console.error("Parcel SMS Fail:", err));
    // ---------------------
    res
      .status(201)
      .json({ message: "Booking created successfully!", booking: savedParcel });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error while creating booking." });
  }
};

// --- getUserOrders (UPDATED TO POPULATE NEW FIELDS) ---
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const orders = await Parcel.find({ user: userObjectId }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

// --- ADMIN FUNCTION: Get all parcels ---
export const getAllParcels = async (req, res) => {
  try {
    const allParcels = await Parcel.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(allParcels);
  } catch (error) {
    console.error("Error fetching all parcels:", error);
    res.status(500).json({ message: "Server error while fetching parcels." });
  }
};



// --- ADMIN FUNCTION: Update a parcel's status and tag ---
export const updateParcelByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminTag } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is a required field." });
    }

    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found." });
    }

    parcel.status = status;
    if (adminTag !== undefined) {
      parcel.adminTag = adminTag;
    }

    const updatedParcel = await parcel.save();

    // --- NOTIFICATIONS ---
    sendParcelStatusUpdateEmail(updatedParcel).catch(err => console.error("Parcel Status Email Fail:", err));
    sendParcelStatusUpdateSms(updatedParcel).catch(err => console.error("Parcel Status SMS Fail:", err));
    // ---------------------
    res
      .status(200)
      .json({ message: "Parcel updated successfully.", parcel: updatedParcel });
  } catch (error) {
    console.error("Error updating parcel:", error);
    res.status(500).json({ message: "Server error while updating parcel." });
  }
};
