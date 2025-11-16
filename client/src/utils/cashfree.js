import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const PAYMENT_API_URL = `${VITE_BACKEND_BASE_URL}/payment`; // Path: /api/payment

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
    if (!cashfreeInstance) return;

    const orderDetails = {
      amount: item.price || item.fare,
      user,
      itemName: item.name || `Parcel from ${item.sender.city} to ${item.recipient.city}`,
      itemId: item._id || `parcel_${Date.now()}`
    };

    // --- STEP 1: Server ko call kar ---
    const response = await axios.post(`${PAYMENT_API_URL}/create-order`, orderDetails);
    const { payment_session_id } = response.data;

    // --- STEP 2: Popup khol ---
    cashfreeInstance.checkout({ paymentSessionId: payment_session_id }).then((result) => {
      if (result.error) return alert(result.error.message);
      if (result.payment.status === "SUCCESS" && onPaymentSuccess) {
        onPaymentSuccess(result.order);
      }
    });
  } catch (error) {
    console.error("Payment initiation failed:", error);
    alert("Could not initiate payment. Please try again.");
    
    // --- YEH HAI SABSE IMPORTANT FIX ---
    // 'PassengerDetails.jsx' ko bata ki error hua hai
    throw error; 
  }
};