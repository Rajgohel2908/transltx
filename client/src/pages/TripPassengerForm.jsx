import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, User, Mail, Phone } from 'lucide-react';
import Footer from '../components/Footer';
import { DataContext } from '../context/Context';
import { handlePayment } from '../utils/cashfree';
import axios from 'axios';

const TripPassengerForm = ({ selectedTicket }) => {
  const navigate = useNavigate();
  const { mode } = useParams();
  const { user } = useContext(DataContext);

  const trip = selectedTicket || {};
  const perPersonPrice = Number(trip.price) || 0;

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const totalTravellers = adults + children;
  const [passengers, setPassengers] = useState([]);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // initialize passengers array with default objects
    const arr = [];
    for (let i = 0; i < totalTravellers; i++) {
      arr.push({ fullName: '', age: '', gender: 'Male' });
    }
    setPassengers(arr);
  }, [totalTravellers]);

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const totalFare = (adults + children) * perPersonPrice;

  const onPaymentSuccess = async (paymentResult) => {
    try {
      const bookingPayload = {
        userId: user?._id,
        bookingType: 'Trips',
        service: trip.name,
        serviceLogo: trip.image,
        from: trip.startPoint || trip.from,
        to: trip.endPoint || trip.to,
        departure: trip.startTime || trip.departure,
        arrival: trip.estimatedArrivalTime || trip.arrival,
        duration: trip.duration,
        passengers: passengers.map(p => ({ fullName: p.fullName, age: p.age, gender: p.gender })),
        contactEmail: email,
        contactPhone: phone,
        fare: totalFare,
        paymentId: paymentResult.cf_payment_id || paymentResult.cf_payment_id || paymentResult.payment_id || paymentResult.id,
        orderId: paymentResult.order_id || paymentResult.orderId || paymentResult.order_id,
        paymentStatus: 'SUCCESS',
        bookingStatus: 'Confirmed'
      };

      const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
      const res = await axios.post(`${VITE_BACKEND_BASE_URL}/bookings`, bookingPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const newBooking = res.data;

      navigate(`/booking/${mode}/confirmation`, {
        state: {
          selectedTicket: trip,
          passengerData: { name: passengers[0]?.fullName, email, phone },
          bookingId: newBooking.pnrNumber,
          searchType: 'Trips'
        }
      });
    } catch (error) {
      console.error('Failed to save booking after payment:', error);
      alert('Payment succeeded but saving booking failed. Please contact support.');
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!phone) return alert('Contact phone is required');
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName || !p.age) return alert(`Please fill name and age for traveler ${i+1}`);
    }

    setIsSubmitting(true);
    try {
      await handlePayment({
        item: { ...trip, price: totalFare },
        user,
        onPaymentSuccess
      });
    } catch (err) {
      console.error('Payment flow error:', err);
      alert('Payment initiation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-12">
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">Passenger Details for {trip.name}</h1>
          <p className="text-center text-gray-600 mb-8">Price per person: ₹{perPersonPrice.toLocaleString()}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Traveler Count & Fare</h2>
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Adults</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" onClick={() => setAdults(a => Math.max(1, a-1))} className="bg-gray-200 p-2 rounded">-</button>
                      <div className="w-10 text-center">{adults}</div>
                      <button type="button" onClick={() => setAdults(a => a+1)} className="bg-gray-200 p-2 rounded">+</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Children</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" onClick={() => setChildren(c => Math.max(0, c-1))} className="bg-gray-200 p-2 rounded">-</button>
                      <div className="w-10 text-center">{children}</div>
                      <button type="button" onClick={() => setChildren(c => c+1)} className="bg-gray-200 p-2 rounded">+</button>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500">Total Travelers</p>
                    <p className="text-xl font-bold">{totalTravellers}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold mb-4">Passenger Details</h3>
                  {passengers.map((p, idx) => (
                    <div key={idx} className="mb-4 p-4 bg-gray-50 rounded">
                      <h4 className="font-semibold mb-2">Traveler {idx+1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input type="text" placeholder="Full Name" value={p.fullName} onChange={(e) => updatePassenger(idx, 'fullName', e.target.value)} className="p-2 border rounded" required />
                        <input type="number" placeholder="Age" value={p.age} onChange={(e) => updatePassenger(idx, 'age', e.target.value)} className="p-2 border rounded" required />
                        <select value={p.gender} onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} className="p-2 border rounded">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold mb-4">Primary Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 border rounded" />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-3 border rounded" required />
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <p className="text-sm text-gray-500">Total Fare</p>
                  <p className="text-2xl font-bold">₹{totalFare.toLocaleString()}</p>
                </div>

                <div className="mt-6">
                  <button onClick={handleProceedToPayment} disabled={isSubmitting} className="w-full bg-green-600 text-white py-3 rounded font-bold">{isSubmitting ? 'Processing...' : 'Proceed to Payment'}</button>
                </div>

              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold mb-4">Trip Summary</h3>
                <img src={trip.image} alt={trip.name} className="w-full h-36 object-cover rounded mb-4" />
                <p className="font-bold">{trip.name}</p>
                <p className="text-sm text-gray-500">{trip.duration}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Price per person</p>
                  <p className="text-xl font-bold">₹{perPersonPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default TripPassengerForm;
