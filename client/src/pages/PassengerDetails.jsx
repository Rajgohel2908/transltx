import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Calendar, GitCompareArrows, Plane, Bus, Train } from 'lucide-react';
import Footer from '../components/Footer';
import { DataContext } from '../context/Context';
import { handlePayment } from '../utils/cashfree';
import axios from 'axios';
import TripPassengerForm from './TripPassengerForm';

const InputField = ({ icon, id, placeholder, value, onChange, type = "text", required = false }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</span>
    <input
      type={type} id={id} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
      required={required}
    />
  </div>
);
const SelectField = ({ icon, id, value, onChange, children }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{icon}</span>
    <select
      id={id} value={value} onChange={onChange}
      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none"
    >
      {children}
    </select>
  </div>
);

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useParams();
  const { user } = useContext(DataContext);

  const { selectedTicket, searchType, departureDate, classType } = location.state || {};

  if (String(searchType || '').toLowerCase() === 'trips') {
    return <TripPassengerForm selectedTicket={selectedTicket} />;
  }

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedTicket) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">No ticket selected.</h1>
        <button onClick={() => navigate('/booking')} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg">Go Back</button>
      </div>
    );
  }

  const priceToPay = Number(selectedTicket.price) || 0;

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const departureDateTime = new Date(`${departureDate}T${selectedTicket.startTime}`);
    const arrivalDateTime = new Date(`${departureDate}T${selectedTicket.estimatedArrivalTime}`);
    if (arrivalDateTime < departureDateTime) {
      arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
    }

    const onPaymentSuccess = async (paymentResult) => {
      try {
        await handlePayment({
          userId: user._id,
          bookingType: searchType,
          routeId: selectedTicket._id,
          classType: classType || 'default',
          departureDateTime: departureDateTime,
          arrivalDateTime: arrivalDateTime,
          service: selectedTicket.name,
          serviceLogo: selectedTicket.image || selectedTicket.airline,
          from: selectedTicket.startPoint || selectedTicket.from,
          to: selectedTicket.endPoint || selectedTicket.to,
          duration: selectedTicket.duration,
          passengers: [{ fullName, age, gender }],
          contactEmail: email,
          contactPhone: phone,
          fare: priceToPay,
          paymentId: paymentResult.cf_payment_id || paymentResult.payment_id,
          orderId: paymentResult.order_id,
          paymentStatus: 'SUCCESS',
          bookingStatus: 'Confirmed'
        });
      } catch (err) {
        console.error("Payment initiation failed:", err);
        // Alert cashfree.js mein handle ho raha hai, bas loading hatao
        setIsSubmitting(false);
      };

      const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
      const res = await axios.post(`${VITE_BACKEND_BASE_URL}/bookings`, bookingPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const newBooking = res.data;

      navigate(`/booking/${mode}/confirmation`, {
        state: {
          selectedTicket: { ...selectedTicket, price: priceToPay },
          passengerData: { name: fullName, email, phone },
          bookingId: newBooking.pnrNumber,
          searchType
        }
      });
  };

  try {
    await handlePayment({
      item: { ...selectedTicket, price: priceToPay },
      user: user,
      onPaymentSuccess: onPaymentSuccess
    });
    // If the payment flow returned (edge case), ensure button is reset
    setIsSubmitting(false);
  } catch (err) {
    console.error("Payment initiation failed:", err);
    alert("Payment initiation failed. Please try again.");
    setIsSubmitting(false);
  }
};

const TicketSummary = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
    <h3 className="text-xl font-bold mb-4">Your Selection</h3>
    <div className="flex items-center justify-between border-b pb-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-md flex items-center justify-center bg-blue-100">
          {searchType === 'Air' && <Plane className="text-blue-600" />}
          {searchType === 'Bus' && <Bus className="text-blue-600" />}
          {searchType === 'Train' && <Train className="text-blue-600" />}
        </div>
        <div>
          <p className="font-bold text-lg">{selectedTicket.name}</p>
          <p className="text-sm text-gray-500">{selectedTicket.startPoint || selectedTicket.from} to {selectedTicket.endPoint || selectedTicket.to}</p>
        </div>
      </div>
    </div>
    <div className="flex justify-between font-bold text-lg">
      <span>Total Fare</span>
      <span className="text-2xl font-bold text-green-600">₹{priceToPay.toLocaleString()}</span>
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

              {/* --- YEH RAHA TERA FORM (POORA WAPAS) --- */}
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                {/* --- SECTION 1: PASSENGER --- */}
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base">1</span> Add Passenger Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <InputField
                      icon={<User className="text-gray-400" />}
                      id="fullName"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <InputField
                    icon={<Calendar className="text-gray-400" />}
                    id="age"
                    placeholder="Age"
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    required
                  />
                  <div className="md:col-span-2">
                    <SelectField
                      icon={<GitCompareArrows className="text-gray-400" />}
                      id="gender"
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </SelectField>
                  </div>
                </div>
                {/* --- END SECTION 1 --- */}

                {/* --- SECTION 2: CONTACT --- */}
                <div className="pt-6 border-t">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base">2</span> Contact Information</h3>
                  <p className="text-gray-500 mb-4 -mt-4">Your ticket and booking details will be sent here.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      icon={<Mail className="text-gray-400" />}
                      id="email"
                      placeholder="Email Address"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <InputField
                      icon={<Phone className="text-gray-400" />}
                      id="phone"
                      placeholder="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {/* --- END SECTION 2 --- */}

                <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : `Proceed to Pay ₹${priceToPay.toLocaleString()}`}
                </button>
              </form>
              {/* --- END FORM --- */}

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