// server/controllers/bookingController.js
import Booking from '../models/Booking.js';
import { sendBookingEmail, sendBookingSms, sendCancellationEmail, sendCancellationSms } from '../utils/notificationService.js';

export const createBooking = async (req, res) => {
    try {
        console.log("--- Create Booking Request Received ---");
        console.log("Payload:", JSON.stringify(req.body, null, 2));

        const newBooking = new Booking(req.body);
        await newBooking.save();

        if (newBooking.bookingStatus === 'Confirmed') {
            console.log("Payment Confirmed. Sending Notifications...");
            sendBookingEmail(newBooking).catch(err => console.error("Email fail:", err));
            sendBookingSms(newBooking).catch(err => console.error("SMS fail:", err));
        } else {
            console.log(`Booking created but status is ${newBooking.bookingStatus}. Skipping notifications.`);
        }


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
        if (req.body.bookingStatus === 'Confirmed') {
            console.log("Booking Updated to Confirmed. Sending Notifications...");
            sendBookingEmail(updatedBooking).catch(err => console.error("Email fail:", err));
            sendBookingSms(updatedBooking).catch(err => console.error("SMS fail:", err));
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

// @desc    Cancel a booking (Only if departure is in future)
// @route   PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        // --- TIME CHECK LOGIC ---
        // Puraane data mein 'departure' ho sakta hai, naye mein 'departureDateTime'
        const tripDate = new Date(booking.departureDateTime || booking.departure);
        const currentDate = new Date();

        if (tripDate < currentDate) {
            return res.status(400).json({ message: "Cannot cancel a past booking. Time travel abhi invent nahi hua hai!" });
        }
        // ------------------------

        booking.bookingStatus = 'Cancelled';
        await booking.save();

        // Send cancellation notifications (Email & SMS)
        console.log("📧 Sending cancellation notifications...");
        sendCancellationEmail(booking).catch(err => console.error("Cancellation Email fail:", err));
        sendCancellationSms(booking).catch(err => console.error("Cancellation SMS fail:", err));

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Server error while cancelling booking." });
    }
};

// --- NEW: Get Available Private Ride Requests for Drivers ---
export const getAvailableJobRequests = async (req, res) => {
    try {
        // Find bookings where service is 'Private Ride', status is 'Pending', and no driver assigned
        const jobs = await Booking.find({
            service: 'Private Ride',
            bookingStatus: 'Pending',
            driver: { $exists: false } // Or null
        }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching job requests:", error);
        res.status(500).json({ message: "Server error fetching jobs." });
    }
};

// --- NEW: Driver Accepts a Job ---
export const acceptJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking not found." });

        if (booking.bookingStatus !== 'Pending') {
            return res.status(400).json({ message: "This job is no longer available." });
        }

        booking.driver = driverId;
        booking.bookingStatus = 'Confirmed';
        await booking.save();

        // Notify Passenger
        sendBookingSms(booking).catch(err => console.error("SMS fail:", err));

        res.status(200).json({ message: "Job accepted successfully!", booking });
    } catch (error) {
        console.error("Error accepting job:", error);
        res.status(500).json({ message: "Server error accepting job." });
    }
};