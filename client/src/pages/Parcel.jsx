import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { DataContext } from "../context/Context";
import { CheckCircle, Package, User, Phone, MapPin, Weight, ArrowRight } from "lucide-react";

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
const InputField = ({ icon, id, placeholder, value, onChange, type = "text", required = false }) => (
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
    />
  </div>
);

// --- API Base URL ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PARCEL_API_URL = `${API_BASE_URL}/parcels`;
const ROUTES_API_URL = `${API_BASE_URL}/routes`;

const Parcel = () => {
  const { user } = useContext(DataContext);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [packageType, setPackageType] = useState("document");
  const [weight, setWeight] = useState("");
  const [senderName, setSenderName] = useState(user?.name || "");
  const [senderPhone, setSenderPhone] = useState("");
  const [fare, setFare] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [error, setError] = useState("");
  const [allStops, setAllStops] = useState([]);
  const [bookedOrderDetails, setBookedOrderDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Send a Parcel";

    // Pre-fill sender name if user context is available
    if (user?.name) {
      setSenderName(user.name);
    }

    // Fetch all unique stops from routes
    const fetchStops = async () => {
      try {
        const response = await axios.get(ROUTES_API_URL);
        const routesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const stopsSet = new Set();
        routesData.forEach(route => {
          route.stops.forEach(stop => stopsSet.add(stop.name));
        });
        setAllStops([...stopsSet].sort());
      } catch (err) {
        console.error("Failed to fetch stops for parcel form:", err);
      }
    };
    fetchStops();
  }, [user]);

  // --- Calculate Fare ---
  const handleShowFare = async (e) => {
    e.preventDefault();
    setError("");
    if (!source || !destination || !weight || !senderName || !senderPhone) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${PARCEL_API_URL}/fare`, { source, destination, weight });
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
        source, destination, packageType, weight, senderName, senderPhone, fare 
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
    setSource(""); setDestination(""); setPackageType("document");
    setWeight(""); setSenderName(user?.name || ""); setSenderPhone(""); setFare(null);
    setIsBooked(false); setError("");
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 font-sans flex items-center justify-center py-12 px-4 min-h-[calc(100vh-128px)]">
        {isBooked ? (
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your parcel from <span className="font-semibold">{bookedOrderDetails?.source || source}</span> to <span className="font-semibold">{bookedOrderDetails?.destination || destination}</span> is scheduled.</p>
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
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Send a Parcel</h2>
            <p className="text-gray-500 mb-8">Enter details below for an instant quote.</p>

            <form onSubmit={handleShowFare} className="space-y-6">
              {/* Step 1: Route */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</span> Route Details</h3>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></span>
                  <select id="source" value={source} onChange={e => setSource(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                    <option value="" disabled>Select Source Stop</option>
                    {allStops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></span>
                  <select id="destination" value={destination} onChange={e => setDestination(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                    <option value="" disabled>Select Destination Stop</option>
                    {allStops.filter(s => s !== source).map(stop => <option key={stop} value={stop}>{stop}</option>)}
                  </select>
                </div>
              </div>

              {/* Step 2: Package */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">2</span> Package Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Package className="h-5 w-5 text-gray-400" /></span>
                    <select id="packageType" value={packageType} onChange={e => setPackageType(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white">
                      <option value="document">Document</option>
                      <option value="small_box">Small Box</option>
                      <option value="large_box">Large Box</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <InputField icon={<Weight className="h-5 w-5 text-gray-400" />} id="weight" placeholder="e.g., 0.5" value={weight} onChange={e => setWeight(e.target.value)} type="number" required />
                </div>
              </div>

              {/* Step 3: Sender */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-3"><span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">3</span> Sender Information</h3>
              <div >
                <div className="space-y-4">
                  <InputField icon={<User className="h-5 w-5 text-gray-400" />} id="senderName" placeholder="Your Name" value={senderName} onChange={e => setSenderName(e.target.value)} required />
                  <InputField icon={<Phone className="h-5 w-5 text-gray-400" />} id="senderPhone" placeholder="Your Phone Number" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} type="tel" required />
                </div>
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
