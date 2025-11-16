import CashfreePG from "cashfree-pg"; // <-- Aise import karna hai
import dotenv from "dotenv";

dotenv.config();

// 'cashfree-pg' ek CJS module hai, isliye 'default' import se 'Cashfree' nikaalo
const { Cashfree } = CashfreePG; 
    
// v5 syntax: 'new' karke initialize karo
const cashfree = new Cashfree({
  clientId: process.env.CASHFREE_APP_ID,
  clientSecret: process.env.CASHFREE_SECRET_KEY,
  isSandbox: true, // 'true' = Sandbox/Test mode. 'false' = Production/Live mode
});
    
export const createTripOrder = async (req, res) => {
  console.log(">>>> PAYMENT REQUEST RECEIVED! Processing...");
  try {
    const { amount, user, itemName, itemId } = req.body;

    if (!amount || !user || !itemName || !itemId) {
      return res.status(400).json({ message: "Missing required payment details." });
    }

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
        customer_phone: user.phone || "9999999999", // Test phone fallback
        customer_email: user.email,
        customer_name: user.name,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/orders?order_id={order_id}`,
      },
      order_note: `Booking for: ${itemName}`,
    };

    console.log("Cashfree Order Request Ja Raha Hai..."); // Debugging ke liye

    // v5 syntax: .PG.Orders.CreateOrder() use karo
    const order = await cashfree.PG.Orders.CreateOrder(request, {
       "x-api-version": "2023-08-01"
    });
    
    console.log("Cashfree se Response Aaya:", order.data); // Debugging
    
    // Client ko 'order.data' bhej (jisme payment_session_id hai)
    res.status(200).json(order.data);

  } catch (error) {
    console.error("Cashfree order creation ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create payment order.", error: error.response?.data || error.message });
  }
};