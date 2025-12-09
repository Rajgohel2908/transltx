import express from 'express';
const router = express.Router();
import { createBooking, getAllBookings, getBookingByPnr, updateBooking, getUserBookings, cancelBooking } from '../controllers/bookingController.js';
import { verifyToken } from '../middlewares/userMiddleware.js';

// POST /api/bookings - Create a new booking
router.post('/', createBooking);

// GET /api/bookings - Get all bookings
router.get('/', getAllBookings);

// GET /api/bookings/pnr/:pnr - Get a single booking by PNR
router.get('/pnr/:pnr', getBookingByPnr);

// PUT /api/bookings/:id - Update a booking
router.put('/:id', updateBooking);

// PUT /api/bookings/:id/cancel - Cancel a booking
router.put('/:id/cancel', cancelBooking);

// GET /api/bookings/user/:userId - Get all bookings for a specific user
router.get('/user/:userId', verifyToken, getUserBookings);

export default router;