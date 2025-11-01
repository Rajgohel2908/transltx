import express from "express";
import {
  createRide,
  getActiveRides,
  cancelRide,
  acceptRide,
  getMyAcceptedRides,
  getRideQuote, // <-- 1. Import the new function
} from "../controllers/rideController.js";

const router = express.Router();

router.post("/quote", getRideQuote); // <-- 2. Add the new route
router.get("/", getActiveRides);
router.post("/", createRide);
router.delete("/:rideId/cancel", cancelRide);
router.patch("/:rideId/accept", acceptRide);
router.get("/accepted/:userId", getMyAcceptedRides);

export default router;
