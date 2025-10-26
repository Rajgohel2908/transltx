import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { DataContext } from "../context/Context";
import { CheckCircle, Package, User, Phone, MapPin, Weight, ArrowRight, Mail, Building, Hash, Globe, Box, DollarSign, Shield, Edit3 } from "lucide-react";

// --- Icon Components ---
const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 10l8 4m0 0l8-4m-8 4v-4"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10l8 4 8-4V7L12 3 4 7z"/>
  </svg>
);

const WeightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);

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
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
      required={required}
      autoComplete={autoComplete}
    />
  </div>
);

// --- API Base URL ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PARCEL_API_URL = `${API_BASE_URL}/parcels`;
const ROUTES_API_URL = `${API_BASE_URL}/routes`;

const Parcel = () => {
  const { user } = useContext(DataContext);

  // Sender State
  const [senderName, setSenderName] = useState(user?.name || "");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState(user?.email || "");
  const [senderStreet, setSenderStreet] = useState("");
  const [senderAddress2, setSenderAddress2] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [senderState, setSenderState] = useState("");
  const [senderPostalCode, setSenderPostalCode] = useState("");
  const [senderCountry, setSenderCountry] = useState("India");

  // Recipient State
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientStreet, setRecipientStreet] = useState("");
  const [recipientAddress2, setRecipientAddress2] = useState("");
  const [recipientCity, setRecipientCity] = useState("");
  const [recipientState, setRecipientState] = useState("");
  const [recipientPostalCode, setRecipientPostalCode] = useState("");
  const [recipientCountry, setRecipientCountry] = useState("India");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Parcel State
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [description, setDescription] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");

  const [fare, setFare] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState("");
  const [bookedOrderDetails, setBookedOrderDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Send a Parcel";

    // Pre-fill sender name if user context is available
    if (user?.name) {
      setSenderName(user.name);
    }
    if (user?.email) {
      setSenderEmail(user.email);
    }
  }, [user?.name, user?.email]);

  // --- Calculate Fare ---
  const handleShowFare = async (e) => {
    e.preventDefault();
    setError("");
    // Basic validation for required fields
    if (!senderStreet || !recipientStreet || !weight) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      // The backend now needs to handle full addresses instead of just stops.
      // This is a placeholder for what the new API call might look like.
      // The backend `calculateFare` controller will need to be updated.
      const res = await axios.post(`${PARCEL_API_URL}/fare`, {
        source: {
          street: senderStreet,
          city: senderCity,
          postalCode: senderPostalCode,
        },
        destination: {
          street: recipientStreet,
          city: recipientCity,
          postalCode: recipientPostalCode,
        },
        weight, length, width, height
      });
      setFare(res.data.fare);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error calculating fare. Please check backend.");
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
    try {
      const bookingDetails = {
        user: user,
        sender: {
          name: senderName,
          phone: senderPhone,
          email: senderEmail,
          address: `${senderStreet}, ${senderAddress2}`,
          city: senderCity,
          state: senderState,
          postalCode: senderPostalCode,
          country: senderCountry,
        },
        recipient: {
          name: recipientName,
          phone: recipientPhone,
          email: recipientEmail,
          address: `${recipientStreet}, ${recipientAddress2}`,
          city: recipientCity,
          state: recipientState,
          postalCode: recipientPostalCode,
          country: recipientCountry,
        },
        parcel: { weight, length, width, height, description, declaredValue },
        fare,
      };
      // The handlePayment function from razorpay.js will need to be updated
      // to accept a callback that receives the successful order details.
      const onPaymentSuccess = (order) => {
        setBookedOrderDetails(order);
        setIsBooked(true);
        setIsLoading(false);
      };
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelFare = () => { setFare(null); setError(""); };
  const handleNewBooking = () => {
    // Reset all fields
    setSenderName(user?.name || ""); setSenderPhone(""); setSenderEmail(user?.email || "");
    setSenderStreet(""); setSenderAddress2(""); setSenderCity(""); setSenderState("");
    setSenderPostalCode(""); setSenderCountry("India");

    setRecipientName(""); setRecipientPhone(""); setRecipientEmail("");
    setRecipientStreet(""); setRecipientAddress2(""); setRecipientCity("");
    setRecipientState(""); setRecipientPostalCode(""); setRecipientCountry("India");
    setDeliveryInstructions("");

    setWeight(""); setLength(""); setWidth(""); setHeight("");
    setDescription(""); setDeclaredValue("");

    setFare(null);
    setIsBooked(false); setError("");
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 font-sans flex items-center justify-center py-12 px-4 min-h-[calc(100vh-128px)]">
        {isBooked ? (
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Shipment Request Submitted!</h2>
            <p className="text-gray-600 mb-6">Your parcel from <span className="font-semibold">{bookedOrderDetails?.sender?.city || senderCity}</span> to <span className="font-semibold">{bookedOrderDetails?.recipient?.city || recipientCity}</span> is scheduled.</p>
            <div className="space-y-4">
              <Link to="/orders" className="w-full block bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                View My Orders
              </Link>
              <button onClick={handleNewBooking} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                Book Another Parcel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Send a Parcel</h2>
            <p className="text-gray-500 mb-8">Enter details below for an instant quote.</p>

            <form onSubmit={handleShowFare} className="space-y-6">
              {/* Section 1: Sender Information */}
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</span> Sender Information (From)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<User />} id="senderName" placeholder="Full Name" value={senderName} onChange={e => setSenderName(e.target.value)} required autoComplete="name" />
                <InputField icon={<Phone />} id="senderPhone" placeholder="Phone Number" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} type="tel" required autoComplete="tel" />
                <InputField icon={<Mail />} id="senderEmail" placeholder="Email Address" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} type="email" required autoComplete="email" />
                <InputField icon={<MapPin />} id="senderStreet" placeholder="Street Address" value={senderStreet} onChange={e => setSenderStreet(e.target.value)} required autoComplete="street-address" />
                <InputField icon={<Building />} id="senderAddress2" placeholder="Apt, Suite, Unit, etc. (Optional)" value={senderAddress2} onChange={e => setSenderAddress2(e.target.value)} autoComplete="address-line2" />
                <InputField icon={<MapPin />} id="senderCity" placeholder="City" value={senderCity} onChange={e => setSenderCity(e.target.value)} required autoComplete="address-level2" />
                <InputField icon={<MapPin />} id="senderState" placeholder="State / Province" value={senderState} onChange={e => setSenderState(e.target.value)} required autoComplete="address-level1" />
                <InputField icon={<Hash />} id="senderPostalCode" placeholder="Postal Code" value={senderPostalCode} onChange={e => setSenderPostalCode(e.target.value)} required autoComplete="postal-code" />
                <InputField icon={<Globe />} id="senderCountry" placeholder="Country" value={senderCountry} onChange={e => setSenderCountry(e.target.value)} required autoComplete="country-name" />
              </div>

              {/* Section 2: Recipient Information */}
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">2</span> Recipient Information (To)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<User />} id="recipientName" placeholder="Full Name" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
                <InputField icon={<Phone />} id="recipientPhone" placeholder="Phone Number" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} type="tel" required />
                <InputField icon={<Mail />} id="recipientEmail" placeholder="Email Address (for tracking)" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} type="email" />
                <InputField icon={<MapPin />} id="recipientStreet" placeholder="Street Address" value={recipientStreet} onChange={e => setRecipientStreet(e.target.value)} required />
                <InputField icon={<Building />} id="recipientAddress2" placeholder="Apt, Suite, Unit, etc. (Optional)" value={recipientAddress2} onChange={e => setRecipientAddress2(e.target.value)} />
                <InputField icon={<MapPin />} id="recipientCity" placeholder="City" value={recipientCity} onChange={e => setRecipientCity(e.target.value)} required />
                <InputField icon={<MapPin />} id="recipientState" placeholder="State / Province" value={recipientState} onChange={e => setRecipientState(e.target.value)} required />
                <InputField icon={<Hash />} id="recipientPostalCode" placeholder="Postal Code" value={recipientPostalCode} onChange={e => setRecipientPostalCode(e.target.value)} required />
                <InputField icon={<Globe />} id="recipientCountry" placeholder="Country" value={recipientCountry} onChange={e => setRecipientCountry(e.target.value)} required />
                <div className="md:col-span-2">
                  <InputField icon={<Edit3 />} id="deliveryInstructions" placeholder="Delivery Instructions (e.g., Leave at front door)" value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} />
                </div>
              </div>

              {/* Section 3: Parcel Details */}
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">3</span> Parcel Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<Weight />} id="weight" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} type="number" required />
                <InputField icon={<Box />} id="length" placeholder="Length (cm)" value={length} onChange={e => setLength(e.target.value)} type="number" />
                <InputField icon={<Box />} id="width" placeholder="Width (cm)" value={width} onChange={e => setWidth(e.target.value)} type="number" />
                <InputField icon={<Box />} id="height" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} type="number" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField icon={<Package />} id="description" placeholder="Description of Contents" value={description} onChange={e => setDescription(e.target.value)} required />
                <InputField icon={<DollarSign />} id="declaredValue" placeholder="Declared Value (₹)" value={declaredValue} onChange={e => setDeclaredValue(e.target.value)} type="number" />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="pt-4 space-y-4">
                {fare && <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg flex justify-between items-center"><p className="font-semibold">Estimated Fare:</p><p className="text-2xl font-bold">₹{Number(fare).toFixed(2)}</p></div>}

                {!fare ? (
                  <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Package className="h-5 w-5" />
                    {isLoading ? "Calculating..." : "Show Fare"}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={handleRequestBooking} disabled={isLoading} className="w-full text-white font-bold py-3 px-6 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? "Booking..." : "Confirm & Pay"}</button>
                    <button type="button" onClick={handleCancelFare} disabled={isLoading} className="w-full text-gray-700 bg-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Parcel;
