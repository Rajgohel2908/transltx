import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Calendar, GitCompareArrows, Plane, Bus, Train, Users, Edit2, Check, Minus, Plus } from 'lucide-react';
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

  const { selectedTicket, searchType, departureDate, classType, passengers: initialPassengers } = location.state || {};

  if (String(searchType || '').toLowerCase() === 'trips') {
    return <TripPassengerForm selectedTicket={selectedTicket} />;
  }

  // State for counts
  const [counts, setCounts] = useState(initialPassengers || { adults: 1, children: 0, infants: 0 });
  const [isEditingCounts, setIsEditingCounts] = useState(false);

  // State for passenger details forms (Adults + Children only)
  const [passengerList, setPassengerList] = useState([]);

  // Contact Info
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync passengerList with counts
  useEffect(() => {
    setPassengerList(prev => {
      const newList = [];
      const prevAdults = prev.filter(p => p.type === 'Adult');
      const prevChildren = prev.filter(p => p.type === 'Child');

      // Rebuild Adults
      for (let i = 0; i < counts.adults; i++) {
        if (i < prevAdults.length) newList.push(prevAdults[i]);
        else newList.push({ fullName: '', age: '', gender: 'Male', type: 'Adult' });
      }

      // Rebuild Children
      for (let i = 0; i < counts.children; i++) {
        if (i < prevChildren.length) newList.push(prevChildren[i]);
        else newList.push({ fullName: '', age: '', gender: 'Male', type: 'Child' });
      }

      return newList;
    });
  }, [counts]);

  if (!selectedTicket) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">No ticket selected.</h1>
        <button onClick={() => navigate('/booking')} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg">Go Back</button>
      </div>
    );
  }

  // Pricing Logic
  const basePrice = Number(selectedTicket.price) || 0;
  // Children get 50% off (Half Ticket)
  const totalFare = (counts.adults * basePrice) + (counts.children * basePrice * 0.5);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerList];
    updated[index][field] = value;
    setPassengerList(updated);
  };

  const combineDateAndTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    try {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
      return new Date(`${dateStr}T${hours}:${minutes}:00`);
    } catch (e) {
      console.error("Error parsing date/time:", e);
      return new Date(dateStr);
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const departureDateTime = combineDateAndTime(departureDate, selectedTicket.startTime);
    let arrivalDateTime = combineDateAndTime(departureDate, selectedTicket.estimatedArrivalTime);

    if (arrivalDateTime && departureDateTime && arrivalDateTime < departureDateTime) {
      arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
    }

    try {
      const bookingPayload = {
        userId: user._id,
        bookingType: searchType.charAt(0).toUpperCase() + searchType.slice(1).toLowerCase(),
        routeId: selectedTicket._id,
        classType: classType || 'default',
        departureDateTime: departureDateTime,
        arrivalDateTime: arrivalDateTime,
        service: selectedTicket.name,
        serviceLogo: selectedTicket.image || selectedTicket.airline,
        from: selectedTicket.startPoint || selectedTicket.from,
        to: selectedTicket.endPoint || selectedTicket.to,
        duration: selectedTicket.duration,
        passengers: passengerList, // Send full list
        contactEmail: email,
        contactPhone: phone,
        fare: totalFare,
        // paymentId: paymentResult.cf_payment_id || paymentResult.payment_id,
        // orderId: paymentResult.order_id,
        paymentStatus: 'Pending',
        bookingStatus: 'Pending'
      };

      const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
      const res = await axios.post(`${VITE_BACKEND_BASE_URL}/bookings`, bookingPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const newBooking = res.data;
      console.log("Booking created (Pending):", newBooking._id);

      await handlePayment({
        item: { ...selectedTicket, price: totalFare },
        user: user,
        customerDetails: { name: passengerList[0].fullName, email, phone }, // Use first passenger as primary contact
        bookingId: newBooking._id
      });

    } catch (err) {
      console.error("Booking/Payment failed:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to initiate booking: ${errorMessage}`);
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

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4 text-sm text-gray-600 border-b pb-4">
        <div className="flex justify-between">
          <span>Adults ({counts.adults} x ₹{basePrice})</span>
          <span>₹{counts.adults * basePrice}</span>
        </div>
        {counts.children > 0 && (
          <div className="flex justify-between">
            <span>Children ({counts.children} x ₹{basePrice * 0.5})</span>
            <span>₹{counts.children * basePrice * 0.5}</span>
          </div>
        )}
        {counts.infants > 0 && (
          <div className="flex justify-between">
            <span>Infants ({counts.infants} x ₹0)</span>
            <span>Free</span>
          </div>
        )}
      </div>

      <div className="flex justify-between font-bold text-lg">
        <span>Total Fare</span>
        <span className="text-2xl font-bold text-green-600">₹{totalFare.toLocaleString()}</span>
      </div>
    </div>
  );

  const Counter = ({ label, value, field }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const total = counts.adults + counts.children + counts.infants;
            if (value > 0) setCounts(prev => ({ ...prev, [field]: prev[field] - 1 }));
            if (field === 'adults' && value <= 1) return; // Min 1 adult
          }}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          disabled={field === 'adults' && value <= 1}
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button
          type="button"
          onClick={() => {
            const total = counts.adults + counts.children + counts.infants;
            if (total < 10) setCounts(prev => ({ ...prev, [field]: prev[field] + 1 }));
          }}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          disabled={(counts.adults + counts.children + counts.infants) >= 10}
        >
          <Plus size={16} />
        </button>
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

                <form onSubmit={handleProceedToPayment} className="space-y-6">

                  {/* --- SECTION 0: PASSENGER COUNTS --- */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-blue-800 flex items-center gap-2">
                          <Users size={20} /> Travelers
                        </h3>
                        <p className="text-sm text-blue-600 mt-1">
                          {counts.adults} Adults, {counts.children} Children, {counts.infants} Infants
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingCounts(!isEditingCounts)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
                      >
                        {isEditingCounts ? <Check size={16} /> : <Edit2 size={16} />}
                        {isEditingCounts ? 'Done' : 'Edit'}
                      </button>
                    </div>

                    {isEditingCounts && (
                      <div className="mt-4 pt-4 border-t border-blue-200 animate-fade-in">
                        <Counter label="Adults" value={counts.adults} field="adults" />
                        <Counter label="Children (3-12 Yrs)" value={counts.children} field="children" />
                        <Counter label="Infants (0-2 Yrs)" value={counts.infants} field="infants" />
                        <p className="text-xs text-gray-500 mt-2 text-right">Max 10 passengers total</p>
                      </div>
                    )}
                  </div>


                  {/* --- SECTION 1: PASSENGER FORMS --- */}
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-base">1</span>
                    Passenger Information
                  </h2>

                  <div className="space-y-6">
                    {passengerList.map((passenger, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-gray-500">
                          Passenger {index + 1} ({passenger.type})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                          <div className="md:col-span-3">
                            <InputField
                              icon={<User className="text-gray-400" />}
                              id={`name-${index}`}
                              placeholder="Full Name"
                              value={passenger.fullName}
                              onChange={e => handlePassengerChange(index, 'fullName', e.target.value)}
                              required
                            />
                          </div>
                          <InputField
                            icon={<Calendar className="text-gray-400" />}
                            id={`age-${index}`}
                            placeholder="Age"
                            type="number"
                            value={passenger.age}
                            onChange={e => handlePassengerChange(index, 'age', e.target.value)}
                            required
                          />
                          <div className="md:col-span-2">
                            <SelectField
                              icon={<GitCompareArrows className="text-gray-400" />}
                              id={`gender-${index}`}
                              value={passenger.gender}
                              onChange={e => handlePassengerChange(index, 'gender', e.target.value)}
                            >
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </SelectField>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* --- END SECTION 1 --- */}

                  {/* --- SECTION 2: CONTACT --- */}
                  <div className="pt-6 border-t mt-8">
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
                    {isSubmitting ? 'Processing...' : `Proceed to Pay ₹${totalFare.toLocaleString()}`}
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