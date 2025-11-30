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

// --- 5. Parcel Booking Email ---
export const sendParcelEmail = async (parcelDetails) => {
  if (!parcelDetails?.sender?.email) {
    console.error("Parcel email not sent: Sender email missing.");
    return;
  }
  const receiptHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Parcel Booking Confirmed!</h2>
      <p>Hi ${parcelDetails.sender.name},</p>
      <p>Your parcel booking has been received. Details below:</p>
      <hr>
      <p><strong>Tracking ID:</strong> ${parcelDetails._id}</p>
      <p><strong>From:</strong> ${parcelDetails.sender.address}, ${parcelDetails.sender.city} - ${parcelDetails.sender.postalCode}</p>
      <p><strong>To:</strong> ${parcelDetails.recipient.name}, ${parcelDetails.recipient.address}, ${parcelDetails.recipient.city} - ${parcelDetails.recipient.postalCode}</p>
      <p><strong>Weight:</strong> ${parcelDetails.parcel.weight} kg</p>
      <p><strong>Total Fare:</strong> ₹${parcelDetails.fare}</p>
      <p><strong>Status:</strong> ${parcelDetails.status}</p>
      <hr>
      <p>Thank you for choosing TransItIx!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TransItIx" <${process.env.NODEMAILER_EMAIL}>`,
      to: parcelDetails.sender.email,
      subject: `Parcel Booking Confirmed! (ID: ${parcelDetails._id})`,
      html: receiptHtml,
    });
    console.log(`Parcel email sent to ${parcelDetails.sender.email}`);
  } catch (error) {
    console.error("Parcel email error:", error);
  }
};

// --- 6. Parcel Booking SMS ---
export const sendParcelSms = async (parcelDetails) => {
  if (!parcelDetails?.sender?.phone) {
    console.error("Parcel SMS not sent: Sender phone missing.");
    return;
  }
  const userPhone = `+91${parcelDetails.sender.phone.slice(-10)}`;
  const smsBody = `TransItIx Parcel Booked! ID: ${parcelDetails._id}. From: ${parcelDetails.sender.city} To: ${parcelDetails.recipient.city}. Status: ${parcelDetails.status}.`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,
    });
    console.log(`Parcel SMS sent to ${userPhone}`);
  } catch (error) {
    console.error("Parcel SMS error:", error.message);
  }
};

// --- 7. Parcel Status Update Email ---
export const sendParcelStatusUpdateEmail = async (parcelDetails) => {
  if (!parcelDetails?.sender?.email) {
    console.error("Parcel status email not sent: Sender email missing.");
    return;
  }
  const receiptHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Parcel Status Update</h2>
      <p>Hi ${parcelDetails.sender.name},</p>
      <p>The status of your parcel (ID: <strong>${parcelDetails._id}</strong>) has been updated.</p>
      <hr>
      <p><strong>New Status:</strong> <span style="color: blue; font-weight: bold;">${parcelDetails.status.toUpperCase()}</span></p>
      ${parcelDetails.adminTag ? `<p><strong>Admin Note:</strong> ${parcelDetails.adminTag}</p>` : ''}
      <hr>
      <p>Track your parcel on our website for more details.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TransItIx" <${process.env.NODEMAILER_EMAIL}>`,
      to: parcelDetails.sender.email,
      subject: `Parcel Status Update (ID: ${parcelDetails._id})`,
      html: receiptHtml,
    });
    console.log(`Parcel status email sent to ${parcelDetails.sender.email}`);
  } catch (error) {
    console.error("Parcel status email error:", error);
  }
};

// --- 8. Parcel Status Update SMS ---
export const sendParcelStatusUpdateSms = async (parcelDetails) => {
  if (!parcelDetails?.sender?.phone) {
    console.error("Parcel status SMS not sent: Sender phone missing.");
    return;
  }
  const userPhone = `+91${parcelDetails.sender.phone.slice(-10)}`;
  const smsBody = `TransItIx Update: Your parcel (ID: ${parcelDetails._id}) is now ${parcelDetails.status.toUpperCase()}. ${parcelDetails.adminTag ? `Note: ${parcelDetails.adminTag}` : ''}`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,
    });
    console.log(`Parcel status SMS sent to ${userPhone}`);
  } catch (error) {
    console.error("Parcel status SMS error:", error.message);
  }
};