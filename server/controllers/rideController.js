import Ride from "../models/ride.js";
import User from "../models/userModel.js"; // Import User model to fetch details
import mongoose from "mongoose";
import axios from "axios";
import {
  sendRideStartedSms,
  sendDriverNewBookingSms,
  sendPassengerBookingConfirmationSms,
  sendRideCancellationEmail,
  sendRideCancellationSms
} from "../utils/notificationService.js";

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

// --- NEW: Get Rides for Driver Dashboard ---
export const getDriverRides = async (req, res) => {
  try {
    // Assuming req.user is populated by auth middleware
    // If not, we might need to pass driverId in params or body, but req.user._id is standard
    // For now, let's assume the route is protected and req.user exists. 
    // If testing without auth middleware, might need to pass ID.
    // Based on prompt: "filtered by driver: req.user._id"

    // FALLBACK: If req.user is not set (middleware issue), check query/body
    const driverId = req.user ? req.user._id : (req.userId || req.query.driverId);

    if (!driverId) {
      return res.status(401).json({ message: "Unauthorized: Driver ID not found." });
    }

    const rides = await Ride.find({ driver: driverId })
      .populate("acceptedBy", "name phone email") // Fetch passenger details
      .populate("requests", "name phone email") // Fetch pending requests
      .sort({ departureTime: 1 });

    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    res.status(500).json({ message: "Server error fetching driver rides." });
  }
};

// --- NEW: Start Ride ---
export const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId).populate("acceptedBy", "phone name");

    if (!ride) return res.status(404).json({ message: "Ride not found." });

    ride.status = "active";
    await ride.save();

    // Notify Passengers
    if (ride.acceptedBy && ride.acceptedBy.length > 0) {
      ride.acceptedBy.forEach(passenger => {
        if (passenger.phone) {
          sendRideStartedSms(passenger.phone, ride.driverName || "Your Driver"); // driverName might need population or fetch
        }
      });
    }

    res.status(200).json({ message: "Ride started successfully.", ride });
  } catch (error) {
    console.error("Error starting ride:", error);
    res.status(500).json({ message: "Server error starting ride." });
  }
};

// --- NEW: Complete Ride ---
export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: "completed" },
      { new: true }
    );

    if (!ride) return res.status(404).json({ message: "Ride not found." });

    res.status(200).json({ message: "Ride completed successfully.", ride });
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ message: "Server error completing ride." });
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

// --- MODIFIED: User Requests a Ride (Instead of immediate accept) ---
export const requestRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    // Check if already requested or accepted
    if (ride.requests.includes(userId) || ride.acceptedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already requested or booked this ride." });
    }

    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: "No seats available." });
    }

    ride.requests.push(userId);
    await ride.save();

    // Notify Driver
    const driverUser = await User.findById(ride.driver);
    if (driverUser && driverUser.phone) {
      // Use existing SMS function or create new one for "New Request"
      // For now reusing booking alert but tweaking message in future if needed
      sendDriverNewBookingSms(driverUser.phone, ride.from, ride.to, ride.departureTime);
    }

    res.status(200).json({ message: "Ride requested successfully! Waiting for driver approval.", ride });
  } catch (error) {
    console.error("Error requesting ride:", error);
    res.status(500).json({ message: "Server error while requesting ride." });
  }
};

// --- NEW: Driver Approves Request ---
export const approveRequest = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { passengerId } = req.body; // Driver sends passenger ID to approve

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: "No seats available to approve." });
    }

    // Move from requests to acceptedBy
    if (!ride.requests.includes(passengerId)) {
      return res.status(400).json({ message: "Passenger request not found." });
    }

    ride.requests = ride.requests.filter(id => id.toString() !== passengerId);
    ride.acceptedBy.push(passengerId);
    ride.seatsAvailable -= 1;

    if (ride.seatsAvailable === 0) {
      ride.status = "booked";
    }

    await ride.save();

    // Notify Passenger
    const passengerUser = await User.findById(passengerId);
    const driverUser = await User.findById(ride.driver);

    if (passengerUser && passengerUser.phone) {
      sendPassengerBookingConfirmationSms(
        passengerUser.phone,
        driverUser ? driverUser.name : "Driver",
        ride.driverPhone,
        "Car"
      );
    }

    res.status(200).json({ message: "Passenger approved successfully.", ride });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: "Server error approving request." });
  }
};

// --- NEW: Driver Rejects Request ---
export const rejectRequest = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { passengerId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    ride.requests = ride.requests.filter(id => id.toString() !== passengerId);
    await ride.save();

    res.status(200).json({ message: "Request rejected.", ride });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ message: "Server error rejecting request." });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    if (ride.driver.toString() !== userId) return res.status(403).json({ message: "Not authorized." });

    // --- TIME CHECK ---
    if (new Date(ride.departureTime) < new Date()) {
      return res.status(400).json({ message: "Cannot cancel a ride that has already departed." });
    }
    // ------------------

    // --- MODIFIED: Change status to 'cancelled' instead of delete ---
    ride.status = "cancelled";
    await ride.save();

    // TODO: Trigger Refund Logic here if payment was involved

    res.status(200).json({ message: "Ride cancelled successfully.", ride });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ message: "Server error while deleting ride." });
  }
};

// @desc    Passenger cancels their seat
// @route   PUT /api/rides/:rideId/cancel-seat
export const cancelSeat = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body; // User jo cancel kar raha hai

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found." });

    // --- TIME CHECK ---
    if (new Date(ride.departureTime) < new Date()) {
      return res.status(400).json({ message: "Cannot cancel seat. Ride has already departed." });
    }

    // Check if user is actually in the ride
    if (!ride.acceptedBy.includes(userId)) {
      return res.status(400).json({ message: "You have not booked this ride." });
    }

    // Get user details for notification
    const user = await User.findById(userId);

    // Logic: Remove user, Increase seats, Update status
    ride.acceptedBy = ride.acceptedBy.filter(id => id.toString() !== userId);
    ride.seatsAvailable += 1;
    if (ride.status === 'booked') {
      ride.status = 'active';
    }

    await ride.save();

    // Send cancellation notifications
    if (user) {
      console.log("📧 Sending ride cancellation notifications...");
      if (user.email) {
        sendRideCancellationEmail(user.email, user.name, {
          from: ride.from,
          to: ride.to,
          departureTime: ride.departureTime,
          price: ride.price
        }).catch(err => console.error("Ride cancellation email fail:", err));
      }
      if (user.phone) {
        sendRideCancellationSms(user.phone, {
          from: ride.from,
          to: ride.to,
          price: ride.price
        }).catch(err => console.error("Ride cancellation SMS fail:", err));
      }
    }

    res.status(200).json({ message: "Seat cancelled successfully.", ride });

  } catch (error) {
    console.error("Error cancelling seat:", error);
    res.status(500).json({ message: "Server error while cancelling seat." });
  }
};