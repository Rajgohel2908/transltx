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
    script.onerror = () => {
        console.error("Cashfree SDK script load error.");
        resolve(null);
    }
    document.body.appendChild(script);
  });
};

export const handlePayment = async ({ item, user, onPaymentSuccess }) => {
  try {
    const cashfreeInstance = await loadCashfreeSDK();
    
    // --- FIX START: Silent return ki jagah dhamaka kar ---
    if (!cashfreeInstance) {
        throw new Error("Cashfree SDK load nahi hua bhai! Internet check kar ya adblocker band kar.");
    }
    // --- FIX END ---

    const orderDetails = {
      amount: item.price || item.fare,
      user,
      itemName: item.name || `Booking: ${item._id}`,
      itemId: item._id || `order_${Date.now()}`
    };

    // Step 1: Server se Order create kar
    const response = await axios.post(`${PAYMENT_API_URL}/create-order`, orderDetails);
    
    if (!response.data || !response.data.payment_session_id) {
        throw new Error("Server ne payment session ID nahi diya. Backend check kar.");
    }

    const { payment_session_id } = response.data;

    // Step 2: Checkout Popup khol
    return cashfreeInstance.checkout({ paymentSessionId: payment_session_id }).then((result) => {
      if (result.error) {
          // User ne close kiya ya error aaya
          console.log("Payment failed/closed:", result.error);
          alert("Payment cancelled or failed: " + result.error.message);
      }
      if (result.payment && result.payment.paymentStatus === "SUCCESS" && onPaymentSuccess) {
        onPaymentSuccess(result.order);
      }
    });

  } catch (error) {
    console.error("Payment initiation failed:", error);
    // User ko bata kya hua
    alert(error.response?.data?.message || error.message || "Payment start nahi ho paya.");
    
    // Yeh zaroori hai taaki calling component ka loader band ho jaye
    throw error; 
  }
};