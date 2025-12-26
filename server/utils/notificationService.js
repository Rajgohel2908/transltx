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

// --- 9. Ride Started SMS (To Passenger) ---
export const sendRideStartedSms = async (passengerPhone, driverName) => {
  if (!passengerPhone) return;
  const userPhone = `+91${passengerPhone.slice(-10)}`;
  const smsBody = `Your ride has started! Driver ${driverName} is on the way/moving. Track them or get ready!`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,
    });
    console.log(`Ride Started SMS sent to ${userPhone}`);
  } catch (error) {
    console.error("Ride Started SMS error:", error.message);
  }
};

// --- 10. Ride Booked SMS (To Driver) ---
export const sendDriverNewBookingSms = async (driverPhone, routeFrom, routeTo, time) => {
  if (!driverPhone) return;
  const dPhone = `+91${driverPhone.slice(-10)}`;
  const smsBody = `New Booking Alert! Route: ${routeFrom} -> ${routeTo} at ${new Date(time).toLocaleTimeString()}. Check Dashboard.`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: dPhone,
    });
    console.log(`Driver Booking Alert SMS sent to ${dPhone}`);
  } catch (error) {
    console.error("Driver Booking Alert SMS error:", error.message);
  }
};

// --- 11. Booking Confirmed SMS (To Passenger with Driver Details) ---
export const sendPassengerBookingConfirmationSms = async (passengerPhone, driverName, driverPhone, carModel = "Vehicle") => {
  if (!passengerPhone) return;
  const pPhone = `+91${passengerPhone.slice(-10)}`;
  const smsBody = `Booking Confirmed! Driver: ${driverName}, Phone: ${driverPhone}, Car: ${carModel}. See you soon!`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: pPhone,
    });
    console.log(`Passenger Booking Confirmation SMS sent to ${pPhone}`);
  } catch (error) {
    console.error("Passenger Booking Confirmation SMS error:", error.message);
  }
};

// --- 12. Cancellation Email ---
export const sendCancellationEmail = async (cancellationDetails) => {
  if (!cancellationDetails?.contactEmail) {
    console.error("Cancellation email not sent: Email address missing.");
    return;
  }

  const cancellationHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px;">Hi ${cancellationDetails.passengers?.[0]?.fullName || 'Valued Customer'},</p>
        <p style="font-size: 16px;">Your booking has been cancelled successfully.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #ef4444;">Cancellation Details</h3>
          <p><strong>PNR Number:</strong> ${cancellationDetails.pnrNumber}</p>
          <p><strong>Service:</strong> ${cancellationDetails.service}</p>
          <p><strong>Route:</strong> ${cancellationDetails.from} → ${cancellationDetails.to}</p>
          <p><strong>Original Departure:</strong> ${new Date(cancellationDetails.departureDateTime || cancellationDetails.departure).toLocaleString()}</p>
          <p><strong>Booking Amount:</strong> ₹${cancellationDetails.fare}</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #f59e0b;">⏰ Refund Information</h3>
          <p style="margin: 0; font-size: 15px;">Your refund of <strong>₹${cancellationDetails.fare}</strong> will be processed within <strong>24 hours</strong> and credited to your original payment method.</p>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you have any questions, please contact our support team.</p>
        <p style="font-size: 14px; color: #6b7280;">Thank you for using TransItIx!</p>
      </div>
      <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} TransItIx. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TransItIx" <${process.env.NODEMAILER_EMAIL}>`,
      to: cancellationDetails.contactEmail,
      subject: `Booking Cancelled - Refund Processing (PNR: ${cancellationDetails.pnrNumber})`,
      html: cancellationHtml,
    });
    console.log(`Cancellation email successfully sent to ${cancellationDetails.contactEmail}`);
  } catch (error) {
    console.error("Cancellation email error:", error);
  }
};

// --- 13. Cancellation SMS ---
export const sendCancellationSms = async (cancellationDetails) => {
  if (!cancellationDetails?.contactPhone) {
    console.error("Cancellation SMS not sent: Phone number missing.");
    return;
  }

  const userPhone = `+91${cancellationDetails.contactPhone.slice(-10)}`;
  const smsBody = `TransItIx: Your booking (PNR: ${cancellationDetails.pnrNumber}) has been cancelled. Refund of ₹${cancellationDetails.fare} will be processed within 24 hours. Thank you!`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhone,
    });
    console.log(`Cancellation SMS successfully sent to ${userPhone}`);
  } catch (error) {
    console.error("Cancellation SMS error:", error.message);
  }
};

// --- 14. Ride/Carpool Cancellation Email ---
export const sendRideCancellationEmail = async (userEmail, userName, rideDetails) => {
  if (!userEmail) {
    console.error("Ride cancellation email not sent: Email address missing.");
    return;
  }

  const cancellationHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Ride Cancelled</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px;">Hi ${userName},</p>
        <p style="font-size: 16px;">Your ride booking has been cancelled successfully.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #ef4444;">Cancellation Details</h3>
          <p><strong>Route:</strong> ${rideDetails.from} → ${rideDetails.to}</p>
          <p><strong>Original Departure:</strong> ${new Date(rideDetails.departureTime).toLocaleString()}</p>
          ${rideDetails.price ? `<p><strong>Amount:</strong> ₹${rideDetails.price}</p>` : ''}
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #f59e0b;">⏰ Refund Information</h3>
          <p style="margin: 0; font-size: 15px;">${rideDetails.price ? `Your refund of <strong>₹${rideDetails.price}</strong> will be processed within <strong>24 hours</strong> and credited to your original payment method.` : 'Your cancellation has been processed. No charges were applied.'}</p>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you have any questions, please contact our support team.</p>
        <p style="font-size: 14px; color: #6b7280;">Thank you for using TransItIx!</p>
      </div>
      <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} TransItIx. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"TransItIx" <${process.env.NODEMAILER_EMAIL}>`,
      to: userEmail,
      subject: `Ride Cancelled - Refund Processing`,
      html: cancellationHtml,
    });
    console.log(`Ride cancellation email successfully sent to ${userEmail}`);
  } catch (error) {
    console.error("Ride cancellation email error:", error);
  }
};

// --- 15. Ride/Carpool Cancellation SMS ---
export const sendRideCancellationSms = async (userPhone, rideDetails) => {
  if (!userPhone) {
    console.error("Ride cancellation SMS not sent: Phone number missing.");
    return;
  }

  const phone = `+91${userPhone.slice(-10)}`;
  const smsBody = `TransItIx: Your ride from ${rideDetails.from} to ${rideDetails.to} has been cancelled. ${rideDetails.price ? `Refund of ₹${rideDetails.price} will be processed within 24 hours.` : ''} Thank you!`;

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log(`Ride cancellation SMS successfully sent to ${phone}`);
  } catch (error) {
    console.error("Ride cancellation SMS error:", error.message);
  }
};