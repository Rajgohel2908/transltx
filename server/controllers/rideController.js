import Ride from "../models/ride.js";
import mongoose from "mongoose";
import axios from "axios";

// @desc    Create a new ride offer
export const createRide = async (req, res) => {
  try {
    // Add driverPhone to the destructured request body
    const {
      driver,
      driverPhone,
      from,
      to,
      departureTime,
      seatsAvailable,
      notes,
      price,
    } = req.body;

    if (
      !driver ||
      !driverPhone ||
      !from ||
      !to ||
      !departureTime ||
      !seatsAvailable
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const newRide = new Ride({
      driver,
      driverPhone,
      from,
      to,
      departureTime,
      seatsAvailable,
      notes,
      price,
    });

    const savedRide = await newRide.save();
    console.log("hello");
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

// @desc    Get a price quote for a private ride
export const getRideQuote = async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ message: "Origin and destination are required." });
  }

  const geocode = async (name) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`);
      if (response.data && response.data.length > 0) {
        return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Geocoding failed:", error);
      return null;
    }
  };

  try {
    const fromCoords = await geocode(from);
    const toCoords = await geocode(to);

    if (!fromCoords || !toCoords) {
      return res.status(400).json({ message: "Could not find coordinates for the given locations." });
    }

    const osrmResponse = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=false`
    );

    if (osrmResponse.data.routes && osrmResponse.data.routes.length > 0) {
      const route = osrmResponse.data.routes[0];
      const distanceInKm = (route.distance / 1000).toFixed(2);
      const price = parseFloat((distanceInKm * 12).toFixed(2)); // Pricing: ₹12/km

      res.status(200).json({ distance: distanceInKm, price });
    } else {
      res.status(404).json({ message: "Driving route not found for the given locations." });
    }
  } catch (error) {
    console.error("Error getting ride quote:", error);
    res.status(500).json({ message: "Server error while calculating ride quote." });
  }
};

// @desc    Get all active ride offers for the public list
export const getActiveRides = async (req, res) => {
  try {
    const activeRides = await Ride.find({
      status: "active",
      departureTime: { $gt: new Date() },
    })
      // Populate the driver field with the 'name'
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
    const acceptedRides = await Ride.find({
      acceptedBy: userId,
      status: "booked",
    })
      .populate("driver", "name") // We still want the driver's name
      .sort({ departureTime: -1 });

    // Since the user has accepted, we can now securely send the driver's phone number
    res.status(200).json(acceptedRides);
  } catch (error) {
    console.error("Error fetching accepted rides:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching accepted rides." });
  }
};

// @desc    Allow a user to accept a ride
export const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }
    if (ride.status !== "active") {
      return res
        .status(400)
        .json({ message: "This ride is no longer available." });
    }
    if (ride.driver.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You cannot accept your own ride." });
    }

    ride.acceptedBy = userId;
    ride.status = "booked";

    await ride.save();

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

    await Ride.findByIdAndDelete(rideId);

    res.status(200).json({ message: "Ride offer deleted successfully." });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ message: "Server error while deleting ride." });
  }
};
