import express from "express";
import {
  calculateFare,
  createBooking,
  getUserOrders,
  getAllParcels, // <-- 1. Import new admin function
  updateParcelByAdmin, // <-- 2. Import new admin function
} from "../controllers/parcelController.js";

const router = express.Router();

// --- USER-FACING ROUTES ---
router.post("/fare", calculateFare);
router.post("/book", createBooking);
router.get("/user/:userId", getUserOrders);

// --- NEW ADMIN ROUTES ---

// @route   GET /api/parcels/all
// @desc    Get all parcels from all users (for admin dashboard)
// @access  Admin
router.get("/all", getAllParcels);

// @route   PATCH /api/parcels/:id/admin
// @desc    Update a parcel's status and tag (by admin)
// @access  Admin
router.patch("/:id/admin", updateParcelByAdmin);

export default router;
