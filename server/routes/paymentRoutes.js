import express from "express";
import { createTripOrder } from "../controllers/paymentController.js";

const router = express.Router();

// @route   POST /api/payment/create-order
router.post("/create-order", createTripOrder);

export default router;