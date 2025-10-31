import express from "express";
// 1. Import middleware
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js"; 
import {
  createAlert,
  getActiveAlerts,
  getAllAlerts,
  updateAlertStatus,
  updateAlert,
  deleteAlert,
} from "../controllers/alertController.js";

const router = express.Router();

// --- PUBLIC-FACING ROUTE ---
router.get("/active", getActiveAlerts);

// --- ADMIN-FACING ROUTES (Add verifyToken and isAdmin) ---
router.get("/", verifyToken, isAdmin, getAllAlerts);
router.post("/", verifyToken, isAdmin, createAlert);
router.put("/:id", verifyToken, isAdmin, updateAlert);
router.patch("/:id/status", verifyToken, isAdmin, updateAlertStatus);
router.delete("/:id", verifyToken, isAdmin, deleteAlert);

export default router;