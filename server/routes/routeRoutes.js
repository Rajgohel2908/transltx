import express from "express";
import {
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../controllers/routeController.js";

const router = express.Router();

// --- PUBLIC ROUTE ---
// Get all routes for the public schedules page
router.get("/", getAllRoutes);

// --- ADMIN ROUTES ---
// Create a new route
router.post("/", createRoute);

// Update an existing route
router.put("/:routeId", updateRoute);

// Delete a route
router.delete("/:routeId", deleteRoute);

export default router;
