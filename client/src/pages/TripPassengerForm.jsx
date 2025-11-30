import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Users, Plus, Minus, Calendar, GitCompareArrows, Check, Edit2 } from 'lucide-react';
import ModernCalendar from '../components/ModernCalendar';
import Footer from '../components/Footer';
import { DataContext } from '../context/Context';
import { handlePayment } from '../utils/cashfree';
import axios from 'axios';

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

const Counter = ({ label, value, onIncrement, onDecrement, min = 0, max = 10, disabledIncrement }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onDecrement}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                disabled={value <= min}
            >
                <Minus size={16} />
            </button>
            <span className="w-6 text-center font-bold">{value}</span>
            <button
                type="button"
                onClick={onIncrement}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                disabled={value >= max || disabledIncrement}
            >
                <Plus size={16} />
            </button>
        </div>
    </div>
);

const TripPassengerForm = ({ selectedTicket }) => {
    const navigate = useNavigate();
    const { mode } = useParams();
    const { user } = useContext(DataContext);

    const trip = selectedTicket || {};
    const perPersonPrice = Number(trip.price) || 0;

    // State for counts
    const [counts, setCounts] = useState({ adults: 1, children: 0, infants: 0 });
    const [isEditingCounts, setIsEditingCounts] = useState(false);

    const [passengers, setPassengers] = useState([]);
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [selectedDate, setSelectedDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Sync passengers list with counts (Adults + Children only)
    useEffect(() => {
        setPassengers(prev => {
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

    const updatePassenger = (index, field, value) => {
        setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    // Pricing Logic: Adults (Full), Children (Half), Infants (Free)
    const totalFare = (counts.adults * perPersonPrice) + (counts.children * perPersonPrice * 0.5);
    const totalPassengersCount = counts.adults + counts.children + counts.infants;

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
            // 1. Create Booking First (Pending)
            const bookingPayload = {
                userId: user?._id,
                bookingType: 'Trips',
                service: trip.name,
                serviceLogo: trip.image,
                from: trip.startPoint || trip.from,
                to: trip.endPoint || trip.to,
                departure: trip.startTime || trip.departureTime,
                arrival: trip.estimatedArrivalTime || trip.arrivalTime,
                travelDate: selectedDate,
                departureDateTime: selectedDate ? new Date(`${selectedDate}T${trip.startTime || '00:00'}`) : undefined,
                duration: trip.duration,
                passengers: passengers, // Send full list (Adults + Children)
                contactEmail: email,
                contactPhone: phone,
                fare: totalFare,
                paymentStatus: 'Pending',
                bookingStatus: 'Pending'
            };

            const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
            const res = await axios.post(`${VITE_BACKEND_BASE_URL}/bookings`, bookingPayload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const newBooking = res.data;
            console.log("Booking created (Pending):", newBooking._id);

            // 2. Initiate Payment with Booking ID
            await handlePayment({
                item: { ...trip, price: totalFare },
                user,
                customerDetails: { name: passengers[0].fullName, email, phone },
                bookingId: newBooking._id
            });

            setIsSubmitting(false);
        } catch (err) {
            console.error('Booking/Payment failed:', err);
            setIsSubmitting(false);
            if (err.message !== "Payment cancelled by user") {
                // Show detailed error if available
                const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Payment initiation failed.';
                setError(errorMessage);
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

                                    {/* --- SECTION 1: TRAVEL DATE --- */}
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
                                    {/* --- END SECTION 1 --- */}

                                    {/* --- SECTION 2: TRAVELER COUNT --- */}
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
                                                <Counter
                                                    label="Adults"
                                                    value={counts.adults}
                                                    onIncrement={() => setCounts(p => ({ ...p, adults: p.adults + 1 }))}
                                                    onDecrement={() => setCounts(p => ({ ...p, adults: p.adults - 1 }))}
                                                    min={1}
                                                    disabledIncrement={totalPassengersCount >= 10}
                                                />
                                                <Counter
                                                    label="Children (3-12 Yrs, Half Ticket)"
                                                    value={counts.children}
                                                    onIncrement={() => setCounts(p => ({ ...p, children: p.children + 1 }))}
                                                    onDecrement={() => setCounts(p => ({ ...p, children: p.children - 1 }))}
                                                    disabledIncrement={totalPassengersCount >= 10}
                                                />
                                                <Counter
                                                    label="Infants (0-2 Yrs, Free)"
                                                    value={counts.infants}
                                                    onIncrement={() => setCounts(p => ({ ...p, infants: p.infants + 1 }))}
                                                    onDecrement={() => setCounts(p => ({ ...p, infants: p.infants - 1 }))}
                                                    disabledIncrement={totalPassengersCount >= 10}
                                                />
                                                <p className="text-xs text-gray-500 mt-2 text-right">Max 10 passengers total</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* --- END SECTION 2 --- */}

                                    {/* --- SECTION 3: PASSENGER DETAILS --- */}
                                    <div className="border-t pt-6 mt-6">
                                        <h3 className="text-2xl font-bold mb-4">Passenger Details</h3>
                                        <div className="space-y-4">
                                            {passengers.map((p, idx) => (
                                                <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm relative">
                                                    <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-gray-500">
                                                        Passenger {idx + 1} ({p.type})
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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
                                    {/* --- END SECTION 3 --- */}

                                    {/* --- SECTION 4: CONTACT --- */}
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
                                    {/* --- END SECTION 4 --- */}

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
                            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                                <h3 className="text-xl font-bold mb-4">Trip Summary</h3>
                                <img src={trip.image?.startsWith('http') ? trip.image : `${import.meta.env.VITE_BACKEND_BASE_URL}${trip.image}`} alt={trip.name} className="w-full h-36 object-cover rounded-lg mb-4" />
                                <p className="font-bold text-lg">{trip.name}</p>
                                <p className="text-sm text-gray-500">{trip.duration}</p>

                                <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price per person</span>
                                        <span className="font-medium">₹{perPersonPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Adults ({counts.adults})</span>
                                        <span className="font-medium">₹{(counts.adults * perPersonPrice).toLocaleString()}</span>
                                    </div>
                                    {counts.children > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Children ({counts.children})</span>
                                            <span className="font-medium">₹{(counts.children * perPersonPrice * 0.5).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {counts.infants > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Infants ({counts.infants})</span>
                                            <span className="font-medium">Free</span>
                                        </div>
                                    )}
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