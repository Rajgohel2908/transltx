import express from "express";
import { createTripOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// @route   POST /api/payment/create-order
router.post("/create-order", createTripOrder);

// @route   POST /api/payment/verify
router.post("/verify", verifyPayment);

export default router;