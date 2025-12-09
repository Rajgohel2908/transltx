import express from "express";
// 1. Import middleware
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js";
import {
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  searchRoutes // <-- Add this
} from "../controllers/routeController.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get("/search", searchRoutes); // <-- Add this new line
router.get("/", getAllRoutes);

// --- ADMIN ROUTES (Add verifyToken and isAdmin) ---
router.post("/", verifyToken, createRoute);
router.put("/:routeId", verifyToken, updateRoute);
router.delete("/:routeId", verifyToken, deleteRoute);

export default router;