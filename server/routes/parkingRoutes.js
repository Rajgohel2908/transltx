import express from "express";
import { getAllParkingLots } from "../controllers/parkingController.js";

const router = express.Router();

// This sets up the single endpoint to fetch all parking lot data
router.get("/", getAllParkingLots);

export default router;
