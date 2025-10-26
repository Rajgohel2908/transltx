import axios from "axios";
import { fetchCurrentUser } from "./api"; // Import the user fetching utility

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("cashfree-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "cashfree-sdk";
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handleCashfreePayment = async (bookingDetails) => {
  const scriptLoaded = await loadCashfreeScript();
  if (!scriptLoaded) {
    alert("Could not load payment gateway. Please check your connection.");
    return;
  }

  const cashfree = new window.Cashfree();

  try {
    // Fetch current user details
    const user = await fetchCurrentUser();
    if (!user || !user._id) {
      alert("You must be logged in to make a payment.");
      // Optional: redirect to login page
      // window.location.href = '/login';
      return;
    }

    // 1. Create an order on your backend
    const orderRes = await axios.post(
      `${VITE_BACKEND_BASE_URL}/payment/cashfree-order`,
      {
        amount: bookingDetails.fare,
        orderId: `order_${Date.now()}`, // Generate a unique order ID
        customerDetails: {
          id: user._id,
          phone: user.phone || "9999999999", // Use user's phone or a placeholder
          email: user.email,
          name: user.name,
        },
      }
    );

    const { payment_session_id } = orderRes.data;

    // 2. Open the Cashfree checkout modal
    cashfree.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget: "_self", // or '_blank'
    });

  } catch (err) {
    console.error("Payment initiation failed:", err);
    alert("Failed to initiate payment. Please try again.");
  }
};

export { handleCashfreePayment };