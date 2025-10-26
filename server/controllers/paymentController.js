import { Cashfree } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
// Use SANDBOX for development and PRODUCTION for production
Cashfree.XEnvironment = process.env.NODE_ENV === 'production'
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;

export const createTripOrder = async (req, res) => {
  try {
    const { amount, user, itemName, itemId } = req.body;

    if (!amount || !user || !itemName || !itemId) {
      return res.status(400).json({ message: "Missing required payment details." });
    }

    // Clean up the price string and convert to a number
    const numericAmount = Number(String(amount).replace(/[^0-9.]/g, ''));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount provided." });
    }

    const request = {
      order_amount: numericAmount,
      order_currency: "INR",
      order_id: `ORDER_${itemId}_${Date.now()}`,
      customer_details: {
        customer_id: user._id,
        customer_phone: user.phone || "9999999999", // Fallback phone
        customer_email: user.email,
        customer_name: user.name,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/orders?order_id={order_id}`,
      },
      order_note: `Booking for: ${itemName}`,
    };

    const response = await Cashfree.PGCreateOrder("2022-09-01", request);
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Cashfree order creation error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create payment order.", error: error.response?.data || error.message });
  }
};