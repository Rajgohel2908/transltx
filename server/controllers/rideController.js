import Ride from "../models/ride.js";
import mongoose from "mongoose";
import axios from "axios"; // <-- IMPORT AXIOS

// --- NEW HELPER FUNCTION ---
// Geocodes a string location using Nominatim
const geocode = async (name) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`);
    if (response.data && response.data.length > 0) {
      return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed:", error.message);
    return null;
  }
};

// @desc    Create a new ride offer (FOR CARPOOL)
export const createRide = async (req, res) => {
  try {
    // Add driverPhone and price to the destructured request body
    const {
      driver,
      driverPhone,
      from,
      to,
      departureTime,
      seatsAvailable,
      price, // <-- Price per seat
      notes,
    } = req.body;

    if (
      !driver ||
      !driverPhone ||
      !from ||
      !to ||
      !departureTime ||
      !seatsAvailable ||
      price === undefined // <-- Check for price
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields for carpool offer." });
    }

    const newRide = new Ride({
      driver,
      driverPhone,
      from,
      to,
      departureTime,
      seatsAvailable,
      price, // Price per seat
      notes,
    });

    const savedRide = await newRide.save();
    res
      .status(201)
      .json({ message: "Ride offered successfully!", ride: savedRide });
  } catch (error) {
    console.error("Error creating ride:", error);
    res
      .status(500)
      .json({ message: "Server error while creating ride offer." });
  }
};

// --- NEW FUNCTION TO GET A RIDE QUOTE ---
export const getRideQuote = async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ message: "Origin and destination are required." });
  }

  try {
    const fromCoords = await geocode(from);
    const toCoords = await geocode(to);

    if (!fromCoords || !toCoords) {
      return res.status(404).json({ message: "Could not find coordinates for one or both locations." });
    }

    // Use OSRM to get route distance
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}`;
    const osrmResponse = await axios.get(osrmUrl);

    if (!osrmResponse.data || !osrmResponse.data.routes || osrmResponse.data.routes.length === 0) {
      return res.status(404).json({ message: "No route found between these locations." });
    }

    const route = osrmResponse.data.routes[0];
    const distanceInKm = (route.distance / 1000).toFixed(2);
    const durationInMin = (route.duration / 60).toFixed(0);
    
    // Example pricing: ₹12 per km.
    const price = (distanceInKm * 12).toFixed(0); 

    res.status(200).json({
      distance: `${distanceInKm} km`,
      duration: `${durationInMin} min`,
      price: parseFloat(price)
    });

  } catch (error) {
    console.error("Quote Error:", error.message);
    res.status(500).json({ message: "Error fetching route quote." });
  }
};


// @desc    Get all active ride offers for the public list
export const getActiveRides = async (req, res) => {
  try {
    const activeRides = await Ride.find({
      status: "active",
      seatsAvailable: { $gt: 0 }, // <-- Only show rides with seats
      departureTime: { $gt: new Date() },
    })
      .populate("driver", "name")
      .sort({ departureTime: 1 });
    res.status(200).json(activeRides);
  } catch (error) {
    console.error("Error fetching active rides:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching active rides." });
  }
};

// @desc    Get rides that a specific user has accepted
export const getMyAcceptedRides = async (req, res) => {
  try {
    const { userId } = req.params;
    // Find rides where the user's ID is in the 'acceptedBy' array
    const acceptedRides = await Ride.find({
      acceptedBy: userId,
    })
      .populate("driver", "name")
      .sort({ departureTime: -1 });

    res.status(200).json(acceptedRides);
  } catch (error) {
    console.error("Error fetching accepted rides:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching accepted rides." });
  }
};

// @desc    Allow a user to accept (book) a carpool seat
export const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;

    // Use findOneAndUpdate for an atomic operation
    const ride = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        status: "active", // Must be active
        seatsAvailable: { $gt: 0 }, // Must have seats
        driver: { $ne: userId } // Driver can't accept own ride
      },
      {
        $push: { acceptedBy: userId }, // Add user to list
        $inc: { seatsAvailable: -1 }   // Decrement seats
      },
      { new: true } // Return the updated document
    );

    if (!ride) {
      // If ride is null, it means one of the conditions failed
      return res.status(404).json({ message: "Ride not found, is no longer available, or you are the driver." });
    }

    // If seats are now 0, set status to "booked"
    if (ride.seatsAvailable === 0) {
      ride.status = "booked";
      await ride.save();
    }

    res.status(200).json({ message: "Ride accepted successfully!", ride });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ message: "Server error while accepting ride." });
  }
};

// @desc    Allow a driver to cancel/delete their ride offer
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    if (ride.driver.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this ride." });
    }
    
    // TODO: Add logic here to refund users if ride.acceptedBy.length > 0

    await Ride.findByIdAndDelete(rideId);

    res.status(200).json({ message: "Ride offer deleted successfully." });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ message: "Server error while deleting ride." });
  }
};
