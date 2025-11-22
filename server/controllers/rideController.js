import Ride from "../models/ride.js";
import mongoose from "mongoose";
import axios from "axios"; 

// Helper: Geocodes a string location using Nominatim
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
    const { driver, driverPhone, from, to, departureTime, seatsAvailable, price, notes } = req.body;

    if (!driver || !driverPhone || !from || !to || !departureTime || !seatsAvailable || price === undefined) {
      return res.status(400).json({ message: "Please provide all required fields for carpool offer." });
    }

    const newRide = new Ride({ driver, driverPhone, from, to, departureTime, seatsAvailable, price, notes });
    const savedRide = await newRide.save();
    res.status(201).json({ message: "Ride offered successfully!", ride: savedRide });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ message: "Server error while creating ride offer." });
  }
};

// --- UPDATED: GET RIDE QUOTE (Accepts Coords directly) ---
export const getRideQuote = async (req, res) => {
  // Request body mein ab coordinates bhi aa sakte hain
  const { from, to, fromCoords: reqFromCoords, toCoords: reqToCoords } = req.body;
  
  if (!from || !to) {
    return res.status(400).json({ message: "Origin and destination are required." });
  }

  try {
    let startCoords = reqFromCoords;
    let endCoords = reqToCoords;

    // Agar frontend ne coords nahi bheje, tabhi geocode karo
    if (!startCoords) {
        startCoords = await geocode(from);
    }
    if (!endCoords) {
        endCoords = await geocode(to);
    }

    if (!startCoords || !endCoords) {
      return res.status(404).json({ message: "Could not find coordinates for one or both locations." });
    }

    // OSRM expects: Longitude, Latitude. Our arrays are [Lat, Lng].
    // So we pass [1] then [0].
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;
    
    const osrmResponse = await axios.get(osrmUrl);

    if (!osrmResponse.data || !osrmResponse.data.routes || osrmResponse.data.routes.length === 0) {
      return res.status(404).json({ message: "No route found between these locations." });
    }

    const route = osrmResponse.data.routes[0];
    const distanceInKm = route.distance / 1000;
    
    // Traffic Factor (2x duration)
    const trafficMultiplier = 2.0; 
    const durationInMin = Math.round((route.duration * trafficMultiplier) / 60);
    
    const price = Math.round(distanceInKm * 12); 

    res.status(200).json({
      distance: `${distanceInKm.toFixed(2)} km`,
      duration: `${durationInMin} min`,
      price: parseFloat(price),
      coordinates: route.geometry.coordinates 
    });

  } catch (error) {
    console.error("Quote Error:", error.message);
    res.status(500).json({ message: "Error fetching route quote." });
  }
};

export const getActiveRides = async (req, res) => {
  try {
    const activeRides = await Ride.find({
      status: "active",
      seatsAvailable: { $gt: 0 },
      departureTime: { $gt: new Date() },
    }).populate("driver", "name").sort({ departureTime: 1 });
    res.status(200).json(activeRides);
  } catch (error) {
    console.error("Error fetching active rides:", error);
    res.status(500).json({ message: "Server error while fetching active rides." });
  }
};

export const getMyAcceptedRides = async (req, res) => {
  try {
    const { userId } = req.params;
    const acceptedRides = await Ride.find({ acceptedBy: userId }).populate("driver", "name").sort({ departureTime: -1 });
    res.status(200).json(acceptedRides);
  } catch (error) {
    console.error("Error fetching accepted rides:", error);
    res.status(500).json({ message: "Server error while fetching accepted rides." });
  }
};

export const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: "active", seatsAvailable: { $gt: 0 }, driver: { $ne: userId } },
      { $push: { acceptedBy: userId }, $inc: { seatsAvailable: -1 } },
      { new: true }
    );
    if (!ride) return res.status(404).json({ message: "Ride not found or invalid." });
    if (ride.seatsAvailable === 0) { ride.status = "booked"; await ride.save(); }
    res.status(200).json({ message: "Ride accepted successfully!", ride });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ message: "Server error while accepting ride." });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found." });
    if (ride.driver.toString() !== userId) return res.status(403).json({ message: "Not authorized." });
    await Ride.findByIdAndDelete(rideId);
    res.status(200).json({ message: "Ride offer deleted successfully." });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ message: "Server error while deleting ride." });
  }
};