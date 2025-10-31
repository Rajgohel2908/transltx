import express from "express";
// 1. Import middleware
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js";
import {
  calculateFare,
  createBooking,
  getUserOrders,
  getAllParcels,
  updateParcelByAdmin,
} from "../controllers/parcelController.js";

const router = express.Router();

// --- USER-FACING ROUTES ---
router.post("/fare", calculateFare);
// Protect user routes with verifyToken
router.post("/book", verifyToken, createBooking); 
router.get("/user/:userId", verifyToken, getUserOrders);

// --- ADMIN ROUTES (Add verifyToken and isAdmin) ---
router.get("/all", verifyToken, isAdmin, getAllParcels);
router.patch("/:id/admin", verifyToken, isAdmin, updateParcelByAdmin);

export default router;