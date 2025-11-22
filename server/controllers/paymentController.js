import { Cashfree } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cashfree with credentials from .env
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;

// --- FIX 1: Environment ko string mein set kar ---
Cashfree.XEnvironment = "SANDBOX"; // Production mein "PRODUCTION" kar dena

export const createTripOrder = async (req, res) => {
  try {
    const { amount, user, itemId } = req.body;

    // Validation
    if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
    }

    // Unique Order ID generation
    const orderId = itemId || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Cashfree request payload
    const request = {
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: user?._id || "guest_user",
        customer_name: user?.name || "Guest",
        customer_email: user?.email || "guest@example.com",
        customer_phone: user?.phone || "9999999999" 
      },
      order_meta: {
        return_url: `http://localhost:5173/payment/status?order_id=${orderId}`
      }
    };

    // --- FIX 2: Naya Method Use Kar (Version Date ke saath) ---
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    
    // Send Payment Session ID back to frontend
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Cashfree Order Error:", error.response?.data?.message || error.message);
    res.status(500).json({ 
        message: "Failed to create payment order", 
        error: error.response?.data?.message || error.message 
    });
  }
};