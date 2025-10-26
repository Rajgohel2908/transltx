import express from 'express';
import { razorpay_instance } from '../controllers/razorpay.js';
import { formValidation, verifyToken } from "../middlewares/userMiddleware.js";


const router = express.Router();
router.post('/create-order', verifyToken, formValidation, razorpay_instance);


export default router;
