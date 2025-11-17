// server/utils/notificationService.js
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// --- 1. Email Setup (Nodemailer) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL, // .env se
    pass: process.env.NODEMAILER_PASS,  // .env se (App Password)
  },
});

// --- 2. SMS Setup (Twilio) ---
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// --- 3. Email Export (ASLI FIX YAHAN HAI) ---
export const sendBookingEmail = async (bookingDetails) => {
  if (!bookingDetails?.contactEmail) {
    console.error("Email bhej ne ke liye email address nahi hai!");
    return;
  }
  const receiptHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Booking Confirmed! (PNR: ${bookingDetails.pnrNumber})</h2>
      <p>Hi ${bookingDetails.passengers[0].fullName},</p>
      <p>Thanks for booking with TransItIx. Your trip details are below:</p>
      <hr>
      <p><strong>Service:</strong> ${bookingDetails.service}</p>
      <p><strong>Route:</strong> ${bookingDetails.from} &rarr; ${bookingDetails.to}</p>
      <p><strong>Departure:</strong> ${new Date(bookingDetails.departureDateTime || bookingDetails.departure).toLocaleString()}</p>
      <p><strong>Total Fare Paid:</strong> ₹${bookingDetails.fare}</p>
      <hr>
      <p>Happy journey!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TransItIx" <${process.env.NODEMAILER_EMAIL}>`,
      to: bookingDetails.contactEmail,
      subject: `Your Booking is Confirmed! (PNR: ${bookingDetails.pnrNumber})`,
      html: receiptHtml,
    });
    console.log(`Booking receipt email successfully sent to ${bookingDetails.contactEmail}`);
  } catch (error) {
    console.error("Email bhej ne mein error:", error);
  }
};

// --- 4. SMS Export (ASLI FIX YAHAN HAI) ---
export const sendBookingSms = async (bookingDetails) => {
  if (!bookingDetails?.contactPhone) {
    console.error("SMS bhej ne ke liye phone number nahi hai!");
    return;
  }
  const userPhone = `+91${bookingDetails.contactPhone.slice(-10)}`;
  const smsBody = `TransItIx Booking Confirmed! PNR: ${bookingDetails.pnrNumber}. Route: ${bookingDetails.from} to ${bookingDetails.to}. Happy Journey!`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,
    });
    console.log(`Booking SMS successfully sent to ${userPhone}`);
  } catch (error) {
    console.error("SMS bhej ne mein error:", error.message);
  }
};