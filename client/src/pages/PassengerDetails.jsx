import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, User, Mail, Phone } from 'lucide-react';
import Footer from '../components/Footer';
import { DataContext } from '../context/Context';
import { handlePayment } from '../utils/cashfree';
import axios from 'axios';
import TripPassengerForm from './TripPassengerForm';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useParams();
  const { user } = useContext(DataContext);
  const { selectedTicket, searchType } = location.state || {};

  // If this booking flow is for a Trip (from MyTrips -> TripView)
  if (String(searchType || '').toLowerCase() === 'trips') {
    return <TripPassengerForm selectedTicket={selectedTicket} />;
  }

  // State for form inputs
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  if (!selectedTicket) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">No ticket selected.</h1>
        <button onClick={() => navigate('/booking')} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg">Go Back</button>
      </div>
    );
  }

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    
    const onPaymentSuccess = async (paymentResult) => {
      try {
        const bookingPayload = { 
          userId: user._id,
          bookingType: searchType,
          service: selectedTicket.name, // from Trip model
          serviceLogo: selectedTicket.image, // from Trip model
          from: selectedTicket.from,
          to: selectedTicket.to,
          departure: selectedTicket.departureTime,
          arrival: selectedTicket.arrivalTime,
          duration: selectedTicket.duration,
          passengers: [{ fullName, age, gender }],
          contactEmail: email,
          contactPhone: phone,
          fare: selectedTicket.price,
          paymentId: paymentResult.cf_payment_id,
          orderId: paymentResult.order_id,
          paymentStatus: 'SUCCESS',
          bookingStatus: 'Confirmed'
        };

        // You need to create this endpoint on your server
        const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
        const res = await axios.post(`${VITE_BACKEND_BASE_URL}/bookings`, bookingPayload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const newBooking = res.data;

        // Navigate to confirmation with real data
        navigate(`/booking/${mode}/confirmation`, { 
          state: { 
            selectedTicket, 
            passengerData: { name: fullName, email, phone }, 
            bookingId: newBooking.pnrNumber, // Use PNR from backend
            searchType 
          } 
        });
      } catch (error) {
        console.error('Failed to save booking:', error);
        alert('Payment was successful, but we failed to save your booking. Please contact support.');
      }
    };

    await handlePayment({
      item: selectedTicket,
      user: user,
      onPaymentSuccess: onPaymentSuccess
    });
  };

  const TicketSummary = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Your Selection</h3>
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-4">
          <img src={selectedTicket.image} alt={`${selectedTicket.name} logo`} className="h-12 w-12 object-cover rounded-md" />
          <div>
            <p className="font-bold text-lg">{selectedTicket.name}</p>
            <p className="text-sm text-gray-500">{selectedTicket.from} to {selectedTicket.to}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">₹{selectedTicket.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Per Person</p>
        </div>
      </div>
      <div className="flex justify-between font-bold text-lg">
        <span>Total Fare</span>
        <span>₹{selectedTicket.price.toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12">
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">Finalize Your Booking</h1>
          <p className="text-center text-gray-600 mb-12">Just a few more details to complete your ticket.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base">1</span> Add Passenger Information</h2>
                <form onSubmit={handleProceedToPayment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg md:col-span-3" required />
                    <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white md:col-span-2">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="pt-6 border-t">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base">2</span> Contact Information</h3>
                    <p className="text-gray-500 mb-4 -mt-4">Your ticket and booking details will be sent here.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                  </div>
                  </div>
                  <button type="submit" className="w-full mt-6 bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg">
                    Proceed to Secure Payment
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-1">
              <TicketSummary />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PassengerDetails;