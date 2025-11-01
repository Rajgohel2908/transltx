import React, { useState } from 'react';
import { api } from "../utils/api.js";
import { Users, Phone, DollarSign } from 'lucide-react';

const CarpoolOfferModal = ({ bookingDetails, user, onClose }) => {
  const [seats, setSeats] = useState(1);
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState(""); // <-- ADDED
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleConfirmCarpool = async () => {
    if (!phone || !seats || price === "") { // <-- MODIFIED
      setError("Please provide your phone, number of seats, and a price (can be 0).");
      return;
    }
    setError("");
    setIsSubmitting(true);
    
    try {
      // Create a new Ride (carpool offer) from the Booking details
      const rideData = {
        driver: user._id,
        driverPhone: phone,
        from: bookingDetails.from,
        to: bookingDetails.to,
        departureTime: bookingDetails.departure,
        seatsAvailable: seats,
        price: Number(price) || 0, // <-- ADDED
        notes: `Listing my booked ride ${bookingDetails.pnrNumber} for carpool.`,
      };
      
      await api.post(`${VITE_BACKEND_BASE_URL}/rides`, rideData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to create carpool offer:", error);
      setError(error.response?.data?.message || "Failed to create carpool offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Carpool Listed!</h3>
            <p className="text-gray-600 mb-6">Your ride is now visible on the "Join a Carpool" section for others to join.</p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">Do you want to offer seats for carpooling on this ride?</p>
            
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Your Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Seats to offer"
                  value={seats}
                  min="1"
                  max="8"
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {/* --- ADDED THIS INPUT --- */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Price per Seat (₹)"
                  value={price}
                  min="0"
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {/* --- END OF ADDITION --- */}
            </div>

            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

            <div className="mt-8 flex gap-4">
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300"
              >
                No Thanks
              </button>
              <button
                onClick={handleConfirmCarpool}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Listing..." : "Confirm Carpool"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CarpoolOfferModal;