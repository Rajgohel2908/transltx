import { Cashfree } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Use .PRODUCTION for live

async function createCashfreeOrder(req, res) {
  // In a real app, you'd get the amount and other details from the request body
  // For example: const { amount, currency } = req.body;
  const { amount, orderId, customerDetails } = req.body;

  const request = {
    order_amount: amount,
    order_currency: "INR",
    order_id: orderId, // A unique ID for your order
    customer_details: {
      customer_id: customerDetails.id,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email,
      customer_name: customerDetails.name,
    },
    order_meta: {
      return_url: "http://localhost:5173/orders/{order_id}", // Your success/redirect URL
    },
    order_note: "Payment for parcel service.",
  };

  try {
    const response = await Cashfree.PG.Orders.create(request);
    // Send the payment_session_id to the client
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Cashfree order creation error:", err.response.data);
    res.status(500).json({ error: "Failed to create payment session" });
  }
}

export { createCashfreeOrder };