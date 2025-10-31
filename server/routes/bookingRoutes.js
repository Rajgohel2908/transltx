import express from 'express';
const router = express.Router();
import { createBooking, getAllBookings, getBookingByPnr, updateBooking } from '../controllers/bookingController.js';

// You should protect these routes with authentication middleware
// For example: const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/bookings - Create a new booking
router.post('/', createBooking); // Add 'protect' middleware here

// GET /api/bookings - Get all bookings
router.get('/', getAllBookings); // Add 'protect' and 'admin' middleware here

// GET /api/bookings/pnr/:pnr - Get a single booking by PNR
router.get('/pnr/:pnr', getBookingByPnr); // Add 'protect' middleware here

// PUT /api/bookings/:id - Update a booking
router.put('/:id', updateBooking); // Add 'protect' middleware here

export default router;