import mongoose from "mongoose"; // Import mongoose to use ObjectId
import Parcel from "../models/parcel.js";
import Route from "../models/route.js";

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
    const { source, destination, weight } = req.body;
    if (!source || !destination || !weight) {
      return res
      .status(400)
      .json({ message: "Source, destination, and weight are required." });
    }
    const routes = await Route.find({}).lean();
    let sourceStop, destinationStop;
    for (const route of routes) {
      if (!sourceStop) {
        sourceStop = route.stops.find(
          (stop) =>
            stop.name.trim().toLowerCase() === source.trim().toLowerCase()
        );
      }
      if (!destinationStop) {
        destinationStop = route.stops.find(
          (stop) =>
            stop.name.trim().toLowerCase() === destination.trim().toLowerCase()
        );
      }
      if (sourceStop && destinationStop) break;
    }
    if (!sourceStop || !destinationStop) {
      return res
      .status(404)
      .json({
        message: "Could not find one or both locations on our routes.",
      });
    }
    const distance = getDistanceFromLatLonInKm(
      sourceStop.latitude,
      sourceStop.longitude,
      destinationStop.latitude,
      destinationStop.longitude
    );
    console.log(sourceStop);
    console.log(destinationStop);
    console.log(distance);

    const calculatedFareInUSD = 5 + distance * 1.5 + parseFloat(weight) * 2;
    const calculatedFareInINR = calculatedFareInUSD * 80;
    if (isNaN(calculatedFareInINR)) {
      return res
        .status(500)
        .json({ message: "Fare calculation resulted in an error." });
    }
    res.status(200).json({ fare: calculatedFareInINR.toFixed(2) });
  } catch (error) {
    console.error("Fare Calculation Error:", error);
    res.status(500).json({ message: "Server error during fare calculation." });
  }
};

// --- createBooking (UPDATED WITH DEBUGGING) ---
export const createBooking = async (req, res) => {
  try {
    const {
      user,
      senderName,
      senderPhone,
      source,
      destination,
      packageType,
      weight,
      fare,
    } = req.body;
    if (
      !user ||
      !senderName ||
      !senderPhone ||
      !source ||
      !destination ||
      !packageType ||
      !weight ||
      !fare
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields for booking." });
    }

    console.log(
      "--- DEBUG (createBooking): Received user from body:",
      user
    );

    const newParcel = new Parcel({
      user: user,
      senderName,
      senderPhone,
      source,
      destination,
      packageType,
      weight,
      fare,
      status: "pending",
    });

    console.log(
      "--- DEBUG (createBooking): 'user' field on newParcel instance before save:",
      newParcel.user
    );
    
    const savedParcel = await newParcel.save();
    console.log("Parcel saved successfully:", savedParcel);
    res
      .status(201)
      .json({ message: "Booking created successfully!", booking: savedParcel });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error while creating booking." });
  }
};

// --- getUserOrders (UPDATED WITH DEEPER DEBUGGING) ---
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log(
      "--- DEBUG: Fetching orders for userId from URL parameter:",
      userId
    );

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log("--- DEBUG: Converted userObjectId for query:", userObjectId);

    const orders = await Parcel.find({ user: userObjectId }).sort({
      createdAt: -1,
    });

    // --- NEW DEEPER DEBUGGING ---
    // This query will fetch EVERYTHING from the collection so we can inspect the data.
    const allParcelsInDB = await Parcel.find({}).lean();
    console.log(
      "--- DEBUG: ALL parcels currently in the database:",
      JSON.stringify(allParcelsInDB, null, 2)
    );
    // --- END NEW DEBUGGING ---

    console.log(
      "--- DEBUG: Number of orders found for this user:",
      orders.length
    );

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};


// --- ADMIN FUNCTION: Get all PENDING parcels ---
// This now only fetches parcels with a 'pending' status for the admin's to-do list.
export const getAllParcels = async (req, res) => {
  try {
    const allParcels = await Parcel.find({ status: "pending" }) // THE FIX IS HERE
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
    res
      .status(200)
      .json({ message: "Parcel updated successfully.", parcel: updatedParcel });
  } catch (error) {
    console.error("Error updating parcel:", error);
    res.status(500).json({ message: "Server error while updating parcel." });
  }
};
