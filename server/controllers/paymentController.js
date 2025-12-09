import axios from "axios";
import dotenv from "dotenv";
import Booking from "../models/Booking.js";
import Parcel from '../models/Parcel.js';
import { sendBookingEmail, sendBookingSms, sendParcelEmail, sendParcelSms } from '../utils/notificationService.js';

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
    const { amount, user, customerDetails, itemId, bookingId } = req.body;

    // Validation
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Unique Order ID generation: Append timestamp to ensure uniqueness on retries
    // If itemId is provided, use it as prefix, otherwise generate a random one
    const prefix = itemId || `order_${Date.now()}`;
    const uniqueOrderId = `${prefix}_${Date.now()}`;

    // If bookingId is provided, update the booking/parcel with this orderId
    if (bookingId) {
      console.log(`Linking Booking ${bookingId} with Order ${uniqueOrderId}`);
      let linkedBooking = await Booking.findByIdAndUpdate(bookingId, {
        orderId: uniqueOrderId,
        paymentStatus: 'Pending'
      });

      if (!linkedBooking) {
        console.log(`Booking not found, trying to link Parcel ${bookingId}`);
        linkedBooking = await Parcel.findByIdAndUpdate(bookingId, {
          orderId: uniqueOrderId,
          paymentStatus: 'Pending'
        });
      }

      if (linkedBooking) {
        console.log("Linked successfully to:", linkedBooking._id);
      } else {
        console.warn("Could not link Order ID to any Booking or Parcel");
      }
    }

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

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log("--- Verify Payment Request ---");
    console.log("Body:", req.body);

    if (!orderId) {
      console.error("Order ID missing in request body");
      return res.status(400).json({ message: "Order ID is required" });
    }

    const headers = {
      'x-client-id': APP_ID,
      'x-client-secret': SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json'
    };

    console.log(`Fetching Order Status from Cashfree: ${orderId}`);

    const response = await axios.get(`${BASE_URL}/orders/${orderId}`, { headers });
    console.log("Cashfree Response Status:", response.status);
    console.log("Order Status:", response.data.order_status);

    const orderStatus = response.data.order_status;

    if (orderStatus === "PAID") {
      console.log(`Payment PAID. Updating booking for Order ID: ${orderId}`);

      // Try updating Booking first
      let updatedBooking = await Booking.findOneAndUpdate(
        { orderId: orderId },
        {
          paymentStatus: 'SUCCESS',
          bookingStatus: 'Confirmed',
          paymentId: response.data.cf_order_id
        },
        { new: true }
      );

      // If not found in Booking, try Parcel
      if (!updatedBooking) {
        console.log("Booking not found, checking Parcel...");
        updatedBooking = await Parcel.findOneAndUpdate(
          { orderId: orderId },
          {
            paymentStatus: 'SUCCESS',
            status: 'pending', // Keep it pending or move to confirmed if applicable
            paymentId: response.data.cf_order_id
          },
          { new: true }
        );
      }

      if (!updatedBooking) {
        console.error("Booking/Parcel not found for Order ID:", orderId);
        return res.status(404).json({ message: "Booking/Parcel not found for this order ID" });
      }

      console.log("Booking/Parcel Updated Successfully:", updatedBooking._id);

      console.log("Payment Verified. Sending Notifications...");
      if (updatedBooking.bookingType) {
        // Regular Booking
        sendBookingEmail(updatedBooking).catch(err => console.error("Email fail:", err));
        sendBookingSms(updatedBooking).catch(err => console.error("SMS fail:", err));
      } else {
        // Parcel Booking
        sendParcelEmail(updatedBooking).catch(err => console.error("Parcel Email fail:", err));
        sendParcelSms(updatedBooking).catch(err => console.error("Parcel SMS fail:", err));
      }

      return res.status(200).json({
        message: "Payment verified successfully",
        status: "PAID",
        booking: updatedBooking
      });
    } else {
      console.warn(`Payment Status is ${orderStatus} (Not PAID)`);
      return res.status(200).json({
        message: "Payment not completed",
        status: orderStatus
      });
    }

  } catch (error) {
    console.error("Payment Verification Failed Exception:", error.message);
    if (error.response) {
      console.error("Cashfree API Error Data:", error.response.data);
    }
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};