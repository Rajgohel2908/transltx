import express from "express";
// 1. Import middleware
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js";
// 2. Import new controller functions
import { 
  getAllParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot 
} from "../controllers/parkingController.js";

const router = express.Router();

// --- PUBLIC ROUTE ---
router.get("/", getAllParkingLots);

// --- ADMIN ROUTES ---
router.post("/", verifyToken, isAdmin, createParkingLot);
router.put("/:id", verifyToken, isAdmin, updateParkingLot);
router.delete("/:id", verifyToken, isAdmin, deleteParkingLot);

export default router;