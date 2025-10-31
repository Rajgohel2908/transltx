import express from "express";
// 1. Import middleware
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js";
import {
  createTrip,
  getAllTrips,
  updateTrip,
  deleteTrip,
  getTrip
} from "../controllers/tripController.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get("/", getAllTrips);
router.get("/:id", getTrip);

// --- ADMIN ROUTES (Add verifyToken and isAdmin) ---
router.post("/", verifyToken, isAdmin, createTrip);
router.put("/:id", verifyToken, isAdmin, updateTrip);
router.delete("/:id", verifyToken, isAdmin, deleteTrip);

export default router;