import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Users, Plus, Minus, Calendar, GitCompareArrows } from 'lucide-react'; // <-- Naye icons
import ModernCalendar from '../components/ModernCalendar';
import Footer from '../components/Footer';
import { DataContext } from '../context/Context';
import { handlePayment } from '../utils/cashfree';
import axios from 'axios';

// --- Naya InputField component (Parcel.jsx se inspired) ---
const InputField = ({ icon, id, placeholder, value, onChange, type = "text", required = false }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</span>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
      required={required}
    />
  </div>
);

const SelectField = ({ icon, id, value, onChange, children }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</span>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
    >
      {children}
    </select>
  </div>
);

const CounterButton = ({ onClick, icon, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="bg-gray-200 p-2 rounded-full text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {icon}
  </button>
);
// --- End Naye components ---


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
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // initialize passengers array with default objects
    const newPassengers = [];
    for (let i = 0; i < totalTravellers; i++) {
      // Purane passenger data ko rakho agar woh exist karta hai
      newPassengers.push(passengers[i] || { fullName: '', age: '', gender: 'Male' });
    }
    setPassengers(newPassengers);
  }, [totalTravellers]);

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const totalFare = (adults + children) * perPersonPrice;

  const onPaymentSuccess = async (paymentResult) => {
    try {
      const bookingPayload = {
        userId: user?._id,
        bookingType: 'Trips', // 'Trips' type hardcode kar sakte hai
        service: trip.name,
        serviceLogo: trip.image,
        from: trip.startPoint || trip.from,
        to: trip.endPoint || trip.to,
        departure: trip.startTime || trip.departureTime, // departureTime use kar (TripView se)
        arrival: trip.estimatedArrivalTime || trip.arrivalTime, // arrivalTime use kar (TripView se)
        travelDate: selectedDate, // New field
        departureDateTime: selectedDate ? new Date(`${selectedDate}T${trip.startTime || '00:00'}`) : undefined,
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

      // Redirect to Orders page
      navigate('/orders');

    } catch (error) {
      console.error('Failed to save booking after payment:', error);
      setError('Payment succeeded but saving booking failed. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (!phone) {
      setError('Contact phone is required');
      return;
    }
    if (!selectedDate) {
      setError('Please select a travel date');
      return;
    }
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName || !p.age) {
        setError(`Please fill name and age for traveler ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await handlePayment({
        item: { ...trip, price: totalFare },
        user,
        onPaymentSuccess
      });
      // Agar payment close ho gayi bina error ke (edge case), toh button reset karo
      setIsSubmitting(false);
    } catch (err) {
      console.error('Payment flow error:', err);
      // FIX: Error aane par button turant reset karo
      setIsSubmitting(false);
      // Agar "Payment cancelled" hai toh error mat dikha (optional), warna dikha de
      if (err.message !== "Payment cancelled by user") {
        setError('Payment initiation failed.');
      }
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

                <form onSubmit={handleProceedToPayment} className="space-y-6">

                  {/* --- SECTION 1: TRAVELER COUNT --- */}
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users className="text-blue-600" />Traveler Count</h2>
                  <div className="flex items-center gap-8 mb-6">
                    {/* Adults Counter */}
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Adults</p>
                      <div className="flex items-center gap-3">
                        <CounterButton onClick={() => setAdults(a => Math.max(1, a - 1))} icon={<Minus size={16} />} disabled={adults <= 1} />
                        <div className="w-10 text-center text-lg font-bold">{adults}</div>
                        <CounterButton onClick={() => setAdults(a => a + 1)} icon={<Plus size={16} />} />
                      </div>
                    </div>
                    {/* Children Counter */}
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Children (0-12)</p>
                      <div className="flex items-center gap-3">
                        <CounterButton onClick={() => setChildren(c => Math.max(0, c - 1))} icon={<Minus size={16} />} disabled={children <= 0} />
                        <div className="w-10 text-center text-lg font-bold">{children}</div>
                        <CounterButton onClick={() => setChildren(c => c + 1)} icon={<Plus size={16} />} />
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 1.5: TRAVEL DATE --- */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Travel Date</h3>
                    <div className="relative">
                      <div
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50"
                      >
                        <span className={selectedDate ? "text-gray-900" : "text-gray-400"}>
                          {selectedDate || "Select Travel Date"}
                        </span>
                        <Calendar className="h-5 w-5 text-gray-500" />
                      </div>

                      {showDatePicker && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-fade-in">
                          <div className="flex justify-center">
                            <ModernCalendar selectedDate={selectedDate} onChange={(date) => { setSelectedDate(date); setShowDatePicker(false); }} minDate={new Date().toISOString().split('T')[0]} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* --- END SECTION 1.5 --- */}
                  {/* --- END SECTION 1 --- */}

                  {/* --- SECTION 2: PASSENGER DETAILS --- */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-2xl font-bold mb-4">Passenger Details</h3>
                    <div className="space-y-4">
                      {passengers.map((p, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <h4 className="font-semibold mb-3 text-gray-800">Traveler {idx + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                              icon={<User className="text-gray-400" />}
                              id={`name-${idx}`}
                              placeholder="Full Name"
                              value={p.fullName}
                              onChange={(e) => updatePassenger(idx, 'fullName', e.target.value)}
                              required
                            />
                            <InputField
                              icon={<Calendar className="text-gray-400" />}
                              id={`age-${idx}`}
                              placeholder="Age"
                              type="number"
                              value={p.age}
                              onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                              required
                            />
                            <SelectField
                              icon={<GitCompareArrows className="text-gray-400" />}
                              id={`gender-${idx}`}
                              value={p.gender}
                              onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                            >
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </SelectField>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* --- END SECTION 2 --- */}

                  {/* --- SECTION 3: CONTACT --- */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-2xl font-bold mb-4">Primary Contact</h3>
                    <p className="text-gray-500 mb-4 -mt-4">Your ticket and booking details will be sent here.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={<Mail className="text-gray-400" />}
                        id="email"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <InputField
                        icon={<Phone className="text-gray-400" />}
                        id="phone"
                        placeholder="Phone Number"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* --- END SECTION 3 --- */}

                  {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}

                  <div className="mt-6">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      {isSubmitting ? 'Processing...' : `Pay ₹${totalFare.toLocaleString()}`}
                    </button>
                  </div>

                </form>
              </div>
            </div>

            {/* --- RIGHT COLUMN (SUMMARY) --- */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24"> {/* Sticky bana diya */}
                <h3 className="text-xl font-bold mb-4">Trip Summary</h3>
                <img src={trip.image.startsWith('http') ? trip.image : `${import.meta.env.VITE_BACKEND_BASE_URL}${trip.image}`} alt={trip.name} className="w-full h-36 object-cover rounded-lg mb-4" />
                <p className="font-bold text-lg">{trip.name}</p>
                <p className="text-sm text-gray-500">{trip.duration}</p>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per person</span>
                    <span className="font-medium">₹{perPersonPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adults</span>
                    <span className="font-medium">x {adults}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Children</span>
                    <span className="font-medium">x {children}</span>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Fare</span>
                    <span className="text-2xl font-bold text-green-600">₹{totalFare.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            </div>
            {/* --- END RIGHT COLUMN --- */}

          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default TripPassengerForm;