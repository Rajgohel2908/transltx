import express from "express";
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
// Get all currently active alerts (for the public banner)
router.get("/active", getActiveAlerts);

// --- ADMIN-FACING ROUTES ---
// Get all alerts, including inactive ones (for the admin dashboard)
router.get("/", getAllAlerts);

// Create a new alert
router.post("/", createAlert);

// Update an alert's content (title, message, priority)
router.put("/:id", updateAlert);

// Update just an alert's status (active/inactive)
router.patch("/:id/status", updateAlertStatus);

// Delete an alert permanently
router.delete("/:id", deleteAlert);

export default router;
