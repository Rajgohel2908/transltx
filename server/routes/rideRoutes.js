import express from "express";
import {
  createRide,
  getActiveRides,
  cancelRide,
  getMyAcceptedRides,
  getRideQuote,
  cancelSeat,
  getDriverRides,
  startRide,
  completeRide,
  requestRide,
  approveRequest,
  rejectRequest
} from "../controllers/rideController.js";
import { verifyToken } from "../middlewares/userMiddleware.js";

const router = express.Router();

router.post("/quote", getRideQuote); // <-- 2. Add the new route
router.get("/", getActiveRides);
router.post("/", createRide);
router.delete("/:rideId/cancel", cancelRide);
router.patch("/:rideId/request", requestRide); // User requests
router.patch("/:rideId/approve", approveRequest); // Driver approves
router.patch("/:rideId/reject", rejectRequest); // Driver rejects
// Naya route for passenger cancellation
router.put("/:rideId/cancel-seat", cancelSeat);
router.get("/accepted/:userId", getMyAcceptedRides);

// --- Driver Dashboard Routes ---
// Note: Ensure you have authentication middleware to populate req.user for getDriverRides if strictly following that pattern.
// For now, we might rely on passing ID or assuming auth is handled globally or we add a specific route that takes ID if needed.
// But standard practice is /driver/rides with auth.
router.get("/driver/rides", verifyToken, getDriverRides);
router.patch("/:rideId/start", startRide);
router.patch("/:rideId/complete", completeRide);

export default router;
