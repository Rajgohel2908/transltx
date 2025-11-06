import express from "express"; // <-- YEH LINE TERI 'MISSING' THI
import {
  getLocations,
  addLocation,
} from "../controllers/locationController.js";
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js";

const router = express.Router();

// GET /api/locations?search=ahm
router.get("/", getLocations); // Ispe 'verifyToken' nahi hai

// POST /api/locations
router.post("/", verifyToken, isAdmin, addLocation); // Ispe 'security' hai

export default router;