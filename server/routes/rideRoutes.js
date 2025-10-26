import express from "express";
import {
  createRide,
  getActiveRides,
  cancelRide,
  acceptRide,
  getMyAcceptedRides, // <-- 1. Import the new function
} from "../controllers/rideController.js";

const router = express.Router();

router.get("/", getActiveRides);
router.post("/", createRide);
router.delete("/:rideId/cancel", cancelRide);
router.patch("/:rideId/accept", acceptRide);

// --- 2. NEW ROUTE for fetching rides a user has accepted ---
router.get("/accepted/:userId", getMyAcceptedRides);

export default router;
