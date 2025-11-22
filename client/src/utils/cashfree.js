import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const PAYMENT_API_URL = `${VITE_BACKEND_BASE_URL}/payment`;

let cashfree;

const loadCashfreeSDK = () => {
  return new Promise((resolve) => {
    if (window.cashfree) {
      resolve(window.cashfree);
      return;
    }
    const isProd = import.meta.env.PROD;
    const script = document.createElement("script");
    script.src = isProd
      ? "https://sdk.cashfree.com/js/v3/cashfree.js"
      : "https://sdk.testing.cashfree.com/js/v3/cashfree.js";
    script.onload = () => {
      if (window.Cashfree) {
        cashfree = new window.Cashfree();
        resolve(cashfree);
      } else {
        console.error("Cashfree SDK failed to load.");
        resolve(null);
      }
    };
    document.body.appendChild(script);
  });
};

export const handlePayment = async ({ item, user, onPaymentSuccess }) => {
  try {
    const cashfreeInstance = await loadCashfreeSDK();
    if (!cashfreeInstance) {
      throw new Error("Cashfree SDK load nahi hua.");
    }

    const orderDetails = {
      amount: item.price || item.fare,
      user,
      itemName: item.name || `Booking: ${item._id}`,
      itemId: item._id || `order_${Date.now()}`,
    };

    // Step 1: Create Order
    const response = await axios.post(`${PAYMENT_API_URL}/create-order`, orderDetails);

    if (!response.data || !response.data.payment_session_id) {
      throw new Error("Payment Session ID nahi mila.");
    }

    const { payment_session_id } = response.data;

    // --- STEP 2: Popup ---
    // YAHAN DHYAN DE: 'return' zaroori hai taaki hum promise ka wait karein
    return cashfreeInstance.checkout({ paymentSessionId: payment_session_id }).then((result) => {
      // SCENARIO 1: User ne popup close kiya ya payment fail hui
      if (result.error) {
        console.log("User closed popup or payment failed:", result.error);
        // YEH HAI ASLI FIX: Error throw kar, tabhi button reset hoga!
        throw new Error(result.error.message || "Payment Cancelled by User");
      }
      
      // SCENARIO 2: Payment Success
      if (result.payment && result.payment.paymentStatus === "SUCCESS") {
        console.log("Payment Success");
        if (onPaymentSuccess) {
            onPaymentSuccess(result.order);
        }
      }
    });

  } catch (error) {
    console.error("Payment flow error:", error);
    // Error ko re-throw kar taaki PassengerDetails.jsx ka catch block is pakad sake
    // aur setIsSubmitting(false) chala sake.
    throw error; 
  }
};