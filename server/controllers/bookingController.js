// server/controllers/bookingController.js
import Booking from '../models/Booking.js';
import { sendBookingEmail, sendBookingSms } from '../utils/notificationService.js';

export const createBooking = async (req, res) => {
  try {
    console.log("--- Create Booking Request Received ---");
    console.log("Payload:", JSON.stringify(req.body, null, 2));

    const newBooking = new Booking(req.body);
    await newBooking.save();

    console.log("Booking saved successfully:", newBooking._id);

    // --- DONO KO CALL KAR ---
    sendBookingEmail(newBooking).catch(err => console.error("Email fail:", err));
    sendBookingSms(newBooking).catch(err => console.error("SMS fail:", err));
    // -------------------------

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error("Validation Errors:", messages);
      return res.status(400).json({
        message: "Validation Error",
        error: messages.join(', ')
      });
    }
    res.status(500).json({
      message: "Server error while creating booking.",
      error: error.message
    });
  }
}

// @desc    Get all bookings (for admin)
// @route   GET /api/bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Server error while fetching bookings." });
  }
};

// @desc    Get a single booking by its PNR number
// @route   GET /api/bookings/pnr/:pnr
export const getBookingByPnr = async (req, res) => {
  try {
    const { pnr } = req.params;
    const booking = await Booking.findOne({ pnrNumber: pnr });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found with this PNR." });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking by PNR:", error);
    res.status(500).json({ message: "Server error while fetching booking." });
  }
};

// @desc    Update a booking (e.g., status)
// @route   PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Server error while updating booking." });
  }
};

// @desc    Get all bookings for a specific user
// @route   GET /api/bookings/user/:userId
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error while fetching user bookings." });
  }
};