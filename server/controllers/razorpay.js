import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const razorpay_instance = async (req, res) => {
  // const { ticketType, ticketCount, movie_id, showDate, showTime } = req.body;
  const amount = req.body[0].fare;
  const options = {
    amount: amount * 100, // Convert to paise
    currency: "INR",
  };
  
  try {
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
};



export { razorpay_instance };
