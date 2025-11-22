import { Cashfree } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cashfree instance with v5 API
const isProd = process.env.CASHFREE_ENV === "PRODUCTION";
const cashfree = new Cashfree({
  xClientId: process.env.CASHFREE_APP_ID,
  xClientSecret: process.env.CASHFREE_SECRET_KEY,
  xEnvironment: isProd ? "PRODUCTION" : "SANDBOX"
});

export const createTripOrder = async (req, res) => {
  try {
    const { amount, user, customerDetails, itemId } = req.body;

    // Validation
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Unique Order ID generation
    const orderId = itemId || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Sanitize phone number (remove non-digits, take last 10)
    let phone = customerDetails?.phone || user?.phone || "9999999999";
    phone = phone.replace(/\D/g, '').slice(-10);
    if (phone.length < 10) phone = "9999999999"; // Fallback if invalid

    // Cashfree request payload
    const request = {
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: (user?._id || "guest_" + Date.now()).toString(),
        customer_name: customerDetails?.name || user?.name || "Guest",
        customer_email: customerDetails?.email || user?.email || "guest@example.com",
        customer_phone: phone
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/status?order_id=${orderId}`
      }
    };

    // Create Order using instance method
    const response = await cashfree.PGCreateOrder("2023-08-01", request);

    // Send Payment Session ID back to frontend
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Cashfree Order Creation Failed!");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", JSON.stringify(error.response.headers));
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error Config:", error.config);
    }

    res.status(500).json({
      message: "Failed to create payment order",
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
};