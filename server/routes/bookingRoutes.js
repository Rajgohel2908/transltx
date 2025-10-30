const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings } = require('../controllers/bookingController');

// You should protect these routes with authentication middleware
// For example: const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/bookings - Create a new booking
router.post('/', createBooking); // Add 'protect' middleware here

// GET /api/bookings - Get all bookings
router.get('/', getAllBookings); // Add 'protect' and 'admin' middleware here

module.exports = router;