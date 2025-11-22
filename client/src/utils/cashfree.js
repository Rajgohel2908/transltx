import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const PAYMENT_API_URL = `${VITE_BACKEND_BASE_URL}/payment`;

let cashfreeLoader = null;

const loadCashfreeSDK = () => {
  if (cashfreeLoader) return cashfreeLoader;

  cashfreeLoader = new Promise((resolve, reject) => {
    if (window.Cashfree) {
      const isProd = import.meta.env.VITE_CASHFREE_MODE === "PRODUCTION";
      resolve(new window.Cashfree({ mode: isProd ? "production" : "sandbox" }));
      return;
    }

    const isProd = import.meta.env.VITE_CASHFREE_MODE === "PRODUCTION";
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";

    script.onload = () => {
      if (window.Cashfree) {
        console.log("Cashfree SDK loaded successfully");
        const cf = new window.Cashfree({ mode: isProd ? "production" : "sandbox" });
        resolve(cf);
      } else {
        console.error("Cashfree SDK failed to load: window.Cashfree is undefined");
        reject(new Error("Cashfree SDK script loaded but window.Cashfree is undefined"));
        cashfreeLoader = null;
      }
    };

    script.onerror = () => {
      console.error("Cashfree SDK script failed to load (network error?)");
      reject(new Error("Cashfree SDK script failed to load (network error)"));
      cashfreeLoader = null;
    };

    document.body.appendChild(script);
  });

  return cashfreeLoader;
};

export const handlePayment = async ({ item, user, customerDetails, onPaymentSuccess }) => {
  try {
    console.log("Starting payment flow...");
    const cashfreeInstance = await loadCashfreeSDK();
    if (!cashfreeInstance) {
      throw new Error("Cashfree SDK load nahi hua.");
    }

    const orderDetails = {
      amount: item.price || item.fare,
      user,
      customerDetails,
      itemName: item.name || `Booking: ${item._id}`,
      itemId: item._id || `order_${Date.now()}`,
    };

    // Step 1: Create Order
    console.log("Creating order with backend...", orderDetails);
    const response = await axios.post(`${PAYMENT_API_URL}/create-order`, orderDetails);
    console.log("Order created:", response.data);

    if (!response.data || !response.data.payment_session_id) {
      throw new Error("Payment Session ID nahi mila.");
    }

    const { payment_session_id } = response.data;

    // --- STEP 2: Popup ---
    console.log("Initializing checkout with session:", payment_session_id);
    return cashfreeInstance.checkout({ paymentSessionId: payment_session_id }).then((result) => {
      console.log("Checkout result:", result);
      // SCENARIO 1: User ne popup close kiya ya payment fail hui
      if (result.error) {
        console.log("User closed popup or payment failed:", result.error);
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
    throw error;
  }
};