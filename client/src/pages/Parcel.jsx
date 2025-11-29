import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { DataContext } from "../context/Context";
import { CheckCircle, Package, User, Phone, MapPin, Weight, ArrowRight, Mail, Building, Hash, Globe, Box, DollarSign, ArrowLeft, Send, Shield, Edit3 } from "lucide-react";
import { handlePayment } from "../utils/cashfree.js";

// --- Input Field Component ---
const InputField = ({ icon, id, placeholder, value, onChange, type = "text", required = false, autoComplete = "off" }) => (
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
      autoComplete={autoComplete}
    />
  </div>
);

// --- API Base URL ---
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const PARCEL_API_URL = `${VITE_BACKEND_BASE_URL}/parcels`;

// --- Stepper Navigation ---
const Stepper = ({ currentStep }) => (
  <div className="flex justify-center items-center mb-10">
    <div className="flex items-center">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
      <div className={`flex-1 h-1 w-20 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
    </div>
    <div className="flex items-center">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
      <div className={`flex-1 h-1 w-20 ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
    </div>
    <div className="flex items-center">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
    </div>
  </div>
);

const Parcel = () => {
  const { user } = useContext(DataContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Sender State
  const [senderName, setSenderName] = useState(user?.name || "");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState(user?.email || "");
  const [senderStreet, setSenderStreet] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderState, setSenderState] = useState("");
  const [senderPostalCode, setSenderPostalCode] = useState("");
  const [senderCountry, setSenderCountry] = useState("India");

  // Recipient State
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientStreet, setRecipientStreet] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientState, setRecipientState] = useState("");
  const [recipientPostalCode, setRecipientPostalCode] = useState("");
  const [recipientCountry, setRecipientCountry] = useState("India");

  // Parcel State
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [description, setDescription] = useState("");

  const [fare, setFare] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState("");
  const [bookedOrderDetails, setBookedOrderDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Send a Parcel";

    if (user?.name) {
      setSenderName(user.name);
    }
    if (user?.email) {
      setSenderEmail(user.email);
    }
  }, [user?.name, user?.email]);

  const validateStep1 = () => {
    if (!senderName || !senderPhone || !senderEmail || !senderStreet || !senderCity || !senderState || !senderPostalCode || !senderCountry) {
      setError("Please fill in all sender fields.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!recipientName || !recipientPhone || !recipientStreet || !recipientCity || !recipientState || !recipientPostalCode || !recipientCountry) {
      setError("Please fill in all recipient fields.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(s => s - 1);
    setError("");
    setFare(null); // Fare reset kar agar pichhe jaaye
  };

  // --- Calculate Fare ---
  const handleShowFare = async (e) => {
    e.preventDefault();
    setError("");
    if (!weight || !description) {
      setError("Please provide parcel weight and description.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${PARCEL_API_URL}/fare`, {
        source: { city: senderCity, postalCode: senderPostalCode },
        destination: { city: recipientCity, postalCode: recipientPostalCode },
        weight, length, width, height
      });
      setFare(res.data.fare);
    } catch (err) {
      console.error(err);
      const status = err.response?.status || 'N/A';
      const url = `${PARCEL_API_URL}/fare`;
      setError(`Error: ${err.response?.data?.message || err.message} | Status: ${status} | URL: ${url}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Book Parcel ---
  const handleRequestBooking = async (e) => {
    e.preventDefault();
    setError("");
    if (!fare) {
      setError("Please calculate fare first.");
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to book a parcel.");
      navigate('/login');
      return;
    }

    try {
      // 1. Create Booking First (Pending)
      const bookingPayload = {
        user: user._id, // Pass only user ID
        sender: {
          name: senderName,
          phone: senderPhone,
          email: senderEmail,
          address: senderStreet,
          city: senderCity,
          state: senderState,
          postalCode: senderPostalCode,
          country: senderCountry,
        },
        recipient: {
          name: recipientName,
          phone: recipientPhone,
          email: recipientEmail,
          address: recipientStreet,
          city: recipientCity,
          state: recipientState,
          postalCode: recipientPostalCode,
          country: recipientCountry,
        },
        parcel: { weight, length, width, height, description },
        fare,
        paymentStatus: 'Pending',
        status: 'pending'
      };

      const res = await axios.post(`${PARCEL_API_URL}/book`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newBooking = res.data.booking;
      console.log("Parcel Booking created (Pending):", newBooking._id);

      // 2. Initiate Payment with Booking ID
      await handlePayment({
        item: {
          name: `Parcel Delivery (${senderCity} to ${recipientCity})`,
          price: fare,
          image: "https://cdn-icons-png.flaticon.com/512/2983/2983799.png" // Placeholder image
        },
        user,
        customerDetails: { name: senderName, email: senderEmail, phone: senderPhone },
        bookingId: newBooking._id
      });

      setIsLoading(false);

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate('/login');
        return;
      }
      const errorMessage = err.response?.data?.message || err.message || "Booking failed. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleNewBooking = () => {
    setStep(1);
    setSenderName(user?.name || ""); setSenderPhone(""); setSenderEmail(user?.email || "");
    setSenderStreet(""); setSenderCity(""); setSenderState("");
    setSenderPostalCode(""); setSenderCountry("India");

    setRecipientName(""); setRecipientPhone(""); setRecipientEmail("");
    setRecipientStreet(""); setRecipientCity("");
    setRecipientState(""); setRecipientPostalCode(""); setRecipientCountry("India");

    setWeight(""); setLength(""); setWidth(""); setHeight("");
    setDescription("");

    setFare(null); setIsBooked(false); setError("");
  };

  return (
    <>
      <main className="bg-gray-50 min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {isBooked ? (
            // --- Success Screen ---
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center animate-fade-in">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">Shipment Booked!</h2>
              <p className="text-gray-600 mb-6">Your parcel from <span className="font-semibold">{bookedOrderDetails?.sender?.city || senderCity}</span> to <span className="font-semibold">{bookedOrderDetails?.recipient?.city || recipientCity}</span> is scheduled.</p>
              <div className="space-y-4">
                <Link to="/orders" className="w-full block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                  View My Orders
                </Link>
                <button onClick={handleNewBooking} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                  Book Another Parcel
                </button>
              </div>
            </div>
          ) : (
            // --- Stepper Form ---
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Send a Parcel</h2>
              <p className="text-lg text-gray-500 mb-8">Ship your items securely and quickly.</p>

              <Stepper currentStep={step} />

              <form onSubmit={fare ? handleRequestBooking : handleShowFare} className="space-y-6">

                {/* --- Step 1: Sender --- */}
                <div className={step === 1 ? 'animate-fade-in' : 'hidden'}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Sender Information (From)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField icon={<User />} id="senderName" placeholder="Full Name" value={senderName} onChange={e => setSenderName(e.target.value)} required autoComplete="name" />
                    <InputField icon={<Phone />} id="senderPhone" placeholder="Phone Number" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} type="tel" required autoComplete="tel" />
                    <InputField icon={<Mail />} id="senderEmail" placeholder="Email Address" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} type="email" required autoComplete="email" />
                    <InputField icon={<MapPin />} id="senderStreet" placeholder="Street Address" value={senderStreet} onChange={e => setSenderStreet(e.target.value)} required autoComplete="street-address" />
                    <InputField icon={<MapPin />} id="senderCity" placeholder="City" value={senderCity} onChange={e => setSenderCity(e.target.value)} required autoComplete="address-level2" />
                    <InputField icon={<MapPin />} id="senderState" placeholder="State / Province" value={senderState} onChange={e => setSenderState(e.target.value)} required autoComplete="address-level1" />
                    <InputField icon={<Hash />} id="senderPostalCode" placeholder="Postal Code" value={senderPostalCode} onChange={e => setSenderPostalCode(e.target.value)} required autoComplete="postal-code" />
                    <InputField icon={<Globe />} id="senderCountry" placeholder="Country" value={senderCountry} onChange={e => setSenderCountry(e.target.value)} required autoComplete="country-name" />
                  </div>
                </div>

                {/* --- Step 2: Recipient --- */}
                <div className={step === 2 ? 'animate-fade-in' : 'hidden'}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Recipient Information (To)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField icon={<User />} id="recipientName" placeholder="Full Name" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
                    <InputField icon={<Phone />} id="recipientPhone" placeholder="Phone Number" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} type="tel" required />
                    <InputField icon={<Mail />} id="recipientEmail" placeholder="Email Address (for tracking)" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} type="email" />
                    <InputField icon={<MapPin />} id="recipientStreet" placeholder="Street Address" value={recipientStreet} onChange={e => setRecipientStreet(e.target.value)} required />
                    <InputField icon={<MapPin />} id="recipientCity" placeholder="City" value={recipientCity} onChange={e => setRecipientCity(e.target.value)} required />
                    <InputField icon={<MapPin />} id="recipientState" placeholder="State / Province" value={recipientState} onChange={e => setRecipientState(e.target.value)} required />
                    <InputField icon={<Hash />} id="recipientPostalCode" placeholder="Postal Code" value={recipientPostalCode} onChange={e => setRecipientPostalCode(e.target.value)} required />
                    <InputField icon={<Globe />} id="recipientCountry" placeholder="Country" value={recipientCountry} onChange={e => setRecipientCountry(e.target.value)} required />
                  </div>
                </div>

                {/* --- Step 3: Parcel & Fare --- */}
                <div className={step === 3 ? 'animate-fade-in' : 'hidden'}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Parcel Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <InputField icon={<Weight />} id="weight" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.1" required />
                    </div>
                    <div className="md:col-span-1">
                      <InputField icon={<Box />} id="length" placeholder="Length (cm)" value={length} onChange={e => setLength(e.target.value)} type="number" />
                    </div>
                    <div className="md:col-span-1">
                      <InputField icon={<Box />} id="width" placeholder="Width (cm)" value={width} onChange={e => setWidth(e.target.value)} type="number" />
                    </div>
                    <div className="md:col-span-1">
                      <InputField icon={<Box />} id="height" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} type="number" />
                    </div>
                  </div>
                  <InputField icon={<Package />} id="description" placeholder="Description of Contents" value={description} onChange={e => setDescription(e.target.value)} required />

                  {fare && (
                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded-r-lg flex justify-between items-center shadow-sm animate-fade-in">
                      <p className="font-semibold text-lg">Estimated Fare:</p>
                      <p className="text-3xl font-bold">₹{Number(fare).toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}

                {/* --- Navigation Buttons --- */}
                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={step === 1 || isLoading}
                    className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {step === 1 && (
                    <button type="button" onClick={handleNextStep} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      Next: Recipient <ArrowRight size={20} />
                    </button>
                  )}

                  {step === 2 && (
                    <button type="button" onClick={handleNextStep} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      Next: Parcel Details <ArrowRight size={20} />
                    </button>
                  )}

                  {step === 3 && !fare && (
                    <button type="submit" disabled={isLoading} className="w-1/2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {isLoading ? "Calculating..." : "Calculate Fare"}
                    </button>
                  )}

                  {step === 3 && fare && (
                    <button type="submit" disabled={isLoading} className="w-1/2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      <Shield className="h-5 w-5" />
                      {isLoading ? "Processing..." : "Confirm & Pay"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Parcel;
