import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const token = localStorage.getItem("token");

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const paymentGateway = async (
  amount,
  order_id,
  user,
  setIsBooked,
  bookingDetails
) => {
  console.log(bookingDetails[0]);
  const VITE_RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const res = await loadRazorpayScript();
  if (!res) {
    setAlertMessage([
      "The Internet connection appears to be offline!",
      "danger",
    ]);
    console.log("The Internet connection appears to be offline!");
    // setIsAlertVisible(true);
    return;
  } else {
    // setIsAlertVisible(false);
  }
  const options = {
    key: VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
    currency: "INR",
    name: "City Transit",
    description: "Parcel",
    amount: amount,
    order_id: order_id,
    handler: async function (response) {
      try{
        console.log("Hello");
        await axios.post(`${VITE_BACKEND_BASE_URL}/parcels/book`, bookingDetails[0]);
        console.log("booked");
        setIsBooked(true);
      } catch (err) {
        console.log(err);
      }
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    theme: {
      color: "#1e3a8a",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

const handlePayment = async (setIsBooked, user, ...bookingDetails) => {
  const orderRes = await axios
    .post(`${VITE_BACKEND_BASE_URL}/payment/create-order`, bookingDetails, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      const res = error.response;
      if (res && res.status === 400) {
        // form validation errors
        console.log(
          "Validation error: " +
            res.data.errors.map((err) => err.msg).join(", "),
          "danger"
        );
      } else if (res && res.status === 404) {
        // setAlertMessage([res.data.error, "danger"]);
        // setIsAlertVisible(true);
        console.log(res.data.error);
      } else if (res && res.status === 401) {
        // setAlertMessage([res.data.error, "warning"]);
        // setIsAlertVisible(true);
        console.log(res.data.error);
      } else {
        // setAlertMessage(["Failed to create order. Please try again.", "danger"]);
        // setIsAlertVisible(true);
        console.log("Failed to create order. Please try again.");
      }
      return null;
    });

  if (!orderRes || !orderRes.data) {
    return;
  }
  const orderData = orderRes.data;
  paymentGateway(
    orderData.amount,
    orderData.id,
    user,
    setIsBooked,
    bookingDetails
  );
};

export { handlePayment };
