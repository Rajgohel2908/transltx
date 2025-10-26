import express from "express";
import {
  createTrip,
  getAllTrips,
  updateTrip,
  deleteTrip,
  getTrip
} from "../controllers/tripController.js";

const router = express.Router();

// @route   GET /api/trips
// @desc    Get all trips
// @access  Public
router.get("/", getAllTrips);

router.get("/:id", getTrip);

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Admin
router.post("/", createTrip);

// @route   PUT /api/trips/:id
// @desc    Update an existing trip
// @access  Admin
router.put("/:id", updateTrip);

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Admin
router.delete("/:id", deleteTrip);

export default router;
