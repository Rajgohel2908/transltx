import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const ENV = process.env.CASHFREE_ENV;
const isProd = ENV === "PRODUCTION";

const BASE_URL = isProd
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

export const createTripOrder = async (req, res) => {
  try {
    const { amount, user, customerDetails, itemId } = req.body;

    // Validation
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Unique Order ID generation: Append timestamp to ensure uniqueness on retries
    // If itemId is provided, use it as prefix, otherwise generate a random one
    const prefix = itemId || `order_${Date.now()}`;
    const uniqueOrderId = `${prefix}_${Date.now()}`;

    // Sanitize phone number (remove non-digits, take last 10)
    let phone = customerDetails?.phone || user?.phone || "9999999999";
    phone = phone.replace(/\D/g, '').slice(-10);
    if (phone.length < 10) phone = "9999999999"; // Fallback if invalid

    // Cashfree request payload
    const requestData = {
      order_amount: parseFloat(amount),
      order_currency: "INR",
      order_id: uniqueOrderId,
      customer_details: {
        customer_id: (user?._id || "guest_" + Date.now()).toString(),
        customer_name: customerDetails?.name || user?.name || "Guest",
        customer_email: customerDetails?.email || user?.email || "guest@example.com",
        customer_phone: phone
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/status?order_id=${uniqueOrderId}`
      }
    };

    const headers = {
      'x-client-id': APP_ID,
      'x-client-secret': SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json'
    };

    console.log(`Creating Cashfree Order: ${uniqueOrderId} | Amount: ${amount}`);

    // Create Order using Direct API Call
    const response = await axios.post(`${BASE_URL}/orders`, requestData, { headers });

    // Send Payment Session ID back to frontend
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Cashfree Order Creation Failed!");
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));

      res.status(error.response.status).json({
        message: "Failed to create payment order",
        error: error.response.data.message || "Payment Gateway Error",
        details: error.response.data
      });
    } else {
      console.error("Error Message:", error.message);
      res.status(500).json({
        message: "Failed to create payment order",
        error: error.message
      });
    }
  }
};