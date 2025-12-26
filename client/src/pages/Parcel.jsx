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

// --- Modern Stepper ---
const Stepper = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Sender" },
    { num: 2, label: "Recipient" },
    { num: 3, label: "Parcel" }
  ];

  return (
    <div className="flex justify-between items-center mb-8 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
      <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step) => (
        <div key={step.num} className="flex flex-col items-center bg-white px-2">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${currentStep >= step.num
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110'
            : 'bg-white text-gray-400 border-gray-300'
            }`}>
            {currentStep > step.num ? <CheckCircle size={20} /> : step.num}
          </div>
          <span className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'
            }`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- Summary Card Component ---
const SummaryCard = ({ sender, recipient, parcel, fare, step }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100 h-fit">
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
      <Package className="mr-2 text-blue-600" /> Shipment Summary
    </h3>

    {/* Timeline Visual */}
    <div className="relative pl-4 border-l-2 border-dashed border-gray-300 space-y-8 my-6">
      {/* From */}
      <div className="relative">
        <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 ${sender.city ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}></div>
        <p className="text-xs text-gray-400 uppercase font-bold">From</p>
        <p className="font-semibold text-gray-800">{sender.city || "---"}</p>
        <p className="text-xs text-gray-500">{sender.name}</p>
      </div>

      {/* To */}
      <div className="relative">
        <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 ${recipient.city ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}></div>
        <p className="text-xs text-gray-400 uppercase font-bold">To</p>
        <p className="font-semibold text-gray-800">{recipient.city || "---"}</p>
        <p className="text-xs text-gray-500">{recipient.name}</p>
      </div>
    </div>

    {/* Parcel Details */}
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">Weight</span>
        <span className="font-medium text-gray-800">{parcel.weight ? `${parcel.weight} kg` : "--"}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Dimensions</span>
        <span className="font-medium text-gray-800">
          {parcel.length && parcel.width && parcel.height
            ? `${parcel.length}x${parcel.width}x${parcel.height} cm`
            : "--"}
        </span>
      </div>
    </div>

    {/* Fare Estimate */}
    <div className="border-t pt-4">
      <div className="flex justify-between items-end">
        <span className="text-gray-600 font-medium">Total Estimate</span>
        <span className="text-2xl font-bold text-blue-600">
          {fare ? `₹${Number(fare).toFixed(0)}` : "--"}
        </span>
      </div>
      {step === 3 && !fare && (
        <p className="text-xs text-orange-500 mt-2 text-right">Calculate fare to see total</p>
      )}
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
        alert("Session expired. in again.");
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
      <main className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Send a Parcel
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fast, secure, and reliable delivery service. Track your shipment every step of the way.
            </p>
          </div>

          {isBooked ? (
            // --- Success Screen ---
            <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center animate-fade-in border border-green-100">
              <div className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Shipment Booked!</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Your parcel from <span className="font-semibold text-gray-900">{bookedOrderDetails?.sender?.city || senderCity}</span> to <span className="font-semibold text-gray-900">{bookedOrderDetails?.recipient?.city || recipientCity}</span> has been scheduled successfully.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/orders" className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-200">
                  View My Orders
                </Link>
                <button onClick={handleNewBooking} className="flex items-center justify-center w-full bg-white text-gray-700 border-2 border-gray-200 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                  Book Another
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* --- Left Column: Form --- */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
                  <Stepper currentStep={step} />

                  <form onSubmit={fare ? handleRequestBooking : handleShowFare} className="space-y-8">

                    {/* --- Step 1: Sender --- */}
                    <div className={step === 1 ? 'animate-fade-in' : 'hidden'}>
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                        Sender Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField icon={<User className="text-gray-400" />} id="senderName" placeholder="Full Name" value={senderName} onChange={e => setSenderName(e.target.value)} required autoComplete="name" />
                        <InputField icon={<Phone className="text-gray-400" />} id="senderPhone" placeholder="Phone Number" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} type="tel" required autoComplete="tel" />
                        <div className="md:col-span-2">
                          <InputField icon={<Mail className="text-gray-400" />} id="senderEmail" placeholder="Email Address" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} type="email" required autoComplete="email" />
                        </div>
                        <div className="md:col-span-2">
                          <InputField icon={<MapPin className="text-gray-400" />} id="senderStreet" placeholder="Street Address" value={senderStreet} onChange={e => setSenderStreet(e.target.value)} required autoComplete="street-address" />
                        </div>
                        <InputField icon={<Building className="text-gray-400" />} id="senderCity" placeholder="City" value={senderCity} onChange={e => setSenderCity(e.target.value)} required autoComplete="address-level2" />
                        <InputField icon={<MapPin className="text-gray-400" />} id="senderState" placeholder="State" value={senderState} onChange={e => setSenderState(e.target.value)} required autoComplete="address-level1" />
                        <InputField icon={<Hash className="text-gray-400" />} id="senderPostalCode" placeholder="Postal Code" value={senderPostalCode} onChange={e => setSenderPostalCode(e.target.value)} required autoComplete="postal-code" />
                        <InputField icon={<Globe className="text-gray-400" />} id="senderCountry" placeholder="Country" value={senderCountry} onChange={e => setSenderCountry(e.target.value)} required autoComplete="country-name" />
                      </div>
                    </div>

                    {/* --- Step 2: Recipient --- */}
                    <div className={step === 2 ? 'animate-fade-in' : 'hidden'}>
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                        Recipient Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField icon={<User className="text-gray-400" />} id="recipientName" placeholder="Full Name" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
                        <InputField icon={<Phone className="text-gray-400" />} id="recipientPhone" placeholder="Phone Number" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} type="tel" required />
                        <div className="md:col-span-2">
                          <InputField icon={<Mail className="text-gray-400" />} id="recipientEmail" placeholder="Email Address (Optional)" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} type="email" />
                        </div>
                        <div className="md:col-span-2">
                          <InputField icon={<MapPin className="text-gray-400" />} id="recipientStreet" placeholder="Street Address" value={recipientStreet} onChange={e => setRecipientStreet(e.target.value)} required />
                        </div>
                        <InputField icon={<Building className="text-gray-400" />} id="recipientCity" placeholder="City" value={recipientCity} onChange={e => setRecipientCity(e.target.value)} required />
                        <InputField icon={<MapPin className="text-gray-400" />} id="recipientState" placeholder="State" value={recipientState} onChange={e => setRecipientState(e.target.value)} required />
                        <InputField icon={<Hash className="text-gray-400" />} id="recipientPostalCode" placeholder="Postal Code" value={recipientPostalCode} onChange={e => setRecipientPostalCode(e.target.value)} required />
                        <InputField icon={<Globe className="text-gray-400" />} id="recipientCountry" placeholder="Country" value={recipientCountry} onChange={e => setRecipientCountry(e.target.value)} required />
                      </div>
                    </div>

                    {/* --- Step 3: Parcel --- */}
                    <div className={step === 3 ? 'animate-fade-in' : 'hidden'}>
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                        Parcel Information
                      </h3>

                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-4">Dimensions & Weight</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Weight</label>
                            <InputField icon={<Weight className="text-blue-400" />} id="weight" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.1" required />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Length</label>
                            <InputField icon={<Box className="text-blue-400" />} id="length" placeholder="cm" value={length} onChange={e => setLength(e.target.value)} type="number" />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Width</label>
                            <InputField icon={<Box className="text-blue-400" />} id="width" placeholder="cm" value={width} onChange={e => setWidth(e.target.value)} type="number" />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-blue-600 uppercase mb-1 block">Height</label>
                            <InputField icon={<Box className="text-blue-400" />} id="height" placeholder="cm" value={height} onChange={e => setHeight(e.target.value)} type="number" />
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Content Description</label>
                        <InputField icon={<Package className="text-gray-400" />} id="description" placeholder="e.g. Books, Clothes, Electronics" value={description} onChange={e => setDescription(e.target.value)} required />
                      </div>

                      {fare && (
                        <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg animate-fade-in flex justify-between items-center">
                          <div>
                            <p className="text-blue-100 text-sm font-medium">Total Shipping Cost</p>
                            <p className="text-3xl font-bold">₹{Number(fare).toFixed(2)}</p>
                          </div>
                          <div className="bg-white/20 p-3 rounded-full">
                            <DollarSign className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}

                    {/* --- Navigation --- */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        disabled={step === 1 || isLoading}
                        className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${step === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                      >
                        <ArrowLeft size={20} className="mr-2" /> Back
                      </button>

                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center"
                        >
                          Next Step <ArrowRight size={20} className="ml-2" />
                        </button>
                      ) : (
                        !fare ? (
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center disabled:opacity-70"
                          >
                            {isLoading ? "Calculating..." : "Calculate Fare"} <DollarSign size={20} className="ml-2" />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center disabled:opacity-70"
                          >
                            {isLoading ? "Processing..." : "Pay & Book"} <Shield size={20} className="ml-2" />
                          </button>
                        )
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* --- Right Column: Summary --- */}
              <div className="lg:col-span-1 hidden lg:block">
                <SummaryCard
                  sender={{ name: senderName, city: senderCity }}
                  recipient={{ name: recipientName, city: recipientCity }}
                  parcel={{ weight, length, width, height }}
                  fare={fare}
                  step={step}
                />
              </div>

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
