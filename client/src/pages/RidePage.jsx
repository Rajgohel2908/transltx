import React, { useState, useEffect, useContext, useMemo } from "react";
import { DataContext } from "../context/Context.jsx";
import Footer from "../components/Footer";
import { api } from "../utils/api.js";
import { handlePayment } from "../utils/cashfree.js";
import CarpoolOfferModal from "../components/CarpoolOfferModal.jsx";
import { Users, Phone, Clock, Car as CarIcon, MapPin, DollarSign, Calendar, Search, CheckCircle, Briefcase, UserPlus, ArrowRight, List } from "lucide-react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const startIcon = L.icon({ iconUrl: '/images/gps-green.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
const endIcon = L.icon({ iconUrl: '/images/gps-data.png', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });

const API_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/rides`;

const getMinDateTimeString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const NoRidesIcon = () => <Search className="mx-auto h-16 w-16 text-blue-300" />;

const geocode = async (name) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`);
    if (response.data && response.data.length > 0) {
      return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
};

const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    return response.data.display_name;
  } catch (error) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

function LocationMarker({ setFrom }) {
  const map = useMap();
  
  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, map.getZoom());
      reverseGeocode(e.latlng.lat, e.latlng.lng).then(name => {
        setFrom(prev => prev.name ? prev : { name, coords: [e.latlng.lat, e.latlng.lng] });
      });
    });
  }, [map]);

  return null;
}

function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const BookPrivateRideForm = ({ user, onRideBooked }) => {
  const [from, setFrom] = useState({ name: "", coords: null });
  const [to, setTo] = useState({ name: "", coords: null });
  const [departureTime, setDepartureTime] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [settingPinFor, setSettingPinFor] = useState(null);
  const [routePath, setRoutePath] = useState([]); 

  const defaultCenter = [21.1702, 72.8311]; 

  function MapClickHandler() {
    const map = useMapEvents({
      click(e) {
        if (!settingPinFor) return;
        const { lat, lng } = e.latlng;
        reverseGeocode(lat, lng).then(name => {
          const location = { name, coords: [lat, lng] };
          if (settingPinFor === 'from') {
            setFrom(location);
            setQuote(null); setRoutePath([]); 
          } else if (settingPinFor === 'to') {
            setTo(location);
            setQuote(null); setRoutePath([]); 
          }
        });
        setSettingPinFor(null);
      },
    });
    useEffect(() => {
      map.getContainer().style.cursor = settingPinFor ? 'crosshair' : 'grab';
    }, [settingPinFor, map]);
    return null;
  }

  const handleGetQuote = async () => {
    if (!from.name || !to.name) { setError("Please enter locations."); return; }
    setError(""); setIsLoadingQuote(true); setQuote(null); setRoutePath([]);

    try {
      const fromCoords = from.coords || await geocode(from.name);
      const toCoords = to.coords || await geocode(to.name);

      if (!fromCoords || !toCoords) throw new Error("Could not find coordinates.");

      // --- FIX: Update state with geocoded coords so pins appear ---
      setFrom(prev => ({ ...prev, coords: fromCoords }));
      setTo(prev => ({ ...prev, coords: toCoords }));
      // -----------------------------------------------------------

      const res = await api.post(`${API_URL}/quote`, { 
        from: from.name, 
        to: to.name,
        fromCoords: fromCoords,
        toCoords: toCoords
      });
      setQuote(res.data); 

      if (res.data.coordinates) {
        const swappedCoords = res.data.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePath(swappedCoords);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Could not fetch a quote.");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const onPrivateRidePaymentSuccess = async (paymentResult) => {
    try {
      const bookingPayload = {
        userId: user._id,
        bookingType: "Ride",
        service: "Private Ride",
        from: from.name,
        to: to.name,
        departure: departureTime,
        arrival: departureTime, 
        passengers: [{ fullName: user.name, age: 0, gender: "Unknown" }],
        contactEmail: user.email,
        contactPhone: "N/A",
        fare: quote.price,
        paymentId: paymentResult.cf_payment_id,
        orderId: paymentResult.order_id,
        paymentStatus: "SUCCESS",
        bookingStatus: "Confirmed",
      };
      const res = await api.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/bookings`, bookingPayload);
      onRideBooked(res.data);
    } catch (err) {
      setError("Payment successful, but failed to save booking.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!quote || !departureTime) return setError("Get a quote first.");
    setError(""); setIsBooking(true);
    try {
      await handlePayment({
        item: { name: `Private Ride`, price: quote.price, _id: `ride_${Date.now()}` },
        user,
        onPaymentSuccess: onPrivateRidePaymentSuccess,
      });
      setIsBooking(false);
    } catch (err) {
      setError("Payment initiation failed.");
      setIsBooking(false);
    }
  };
  
  const mapBounds = useMemo(() => {
    if (routePath.length > 0) return L.latLngBounds(routePath); 
    const points = [from.coords, to.coords].filter(Boolean);
    return points.length > 0 ? L.latLngBounds(points) : null;
  }, [from.coords, to.coords, routePath]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><CarIcon className="mr-3 text-blue-600" /> Book a Private Ride</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="flex items-center gap-2">
                <input type="text" value={from.name} onChange={(e) => { setFrom({ name: e.target.value, coords: null }); setQuote(null); setRoutePath([]); }} required className="w-full p-3 border rounded-lg" placeholder="Enter pickup location"/>
                <button type="button" onClick={() => setSettingPinFor('from')} className={`p-3 border rounded-lg ${settingPinFor === 'from' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}><MapPin size={20} /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="flex items-center gap-2">
                <input type="text" value={to.name} onChange={(e) => { setTo({ name: e.target.value, coords: null }); setQuote(null); setRoutePath([]); }} required className="w-full p-3 border rounded-lg" placeholder="Enter destination"/>
                <button type="button" onClick={() => setSettingPinFor('to')} className={`p-3 border rounded-lg ${settingPinFor === 'to' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}><MapPin size={20} /></button>
              </div>
            </div>
            {quote ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Distance:</span> <span>{quote.distance}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Est. Time:</span> <span>{quote.duration}</span></div>
                <div className="flex justify-between font-bold text-xl"><span className="text-gray-700">Price:</span> <span className="text-green-600">₹{quote.price.toLocaleString()}</span></div>
              </div>
            ) : (
              <button type="button" onClick={handleGetQuote} disabled={isLoadingQuote || !from.name || !to.name} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50">{isLoadingQuote ? "Getting Quote..." : "Get Quote"}</button>
            )}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
              <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" min={getMinDateTimeString()}/>
            </div>
            <button type="submit" disabled={!quote || !departureTime || isBooking} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50">{isBooking ? "Processing..." : "Book Ride & Pay"}</button>
            {error && (<p className="text-red-500 text-sm text-center">{error}</p>)}
          </form>
        </div>
        <div className="lg:col-span-2 h-96 lg:h-auto min-h-[400px] rounded-lg overflow-hidden z-0">
          <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <LocationMarker setFrom={setFrom} />
            
            <MapClickHandler />
            {routePath.length > 0 && <Polyline positions={routePath} color="#2563EB" weight={5} opacity={0.8} />}
            {from.coords && (<Marker position={from.coords} icon={startIcon}><Popup>From</Popup></Marker>)}
            {to.coords && (<Marker position={to.coords} icon={endIcon}><Popup>To</Popup></Marker>)}
            {mapBounds && <ChangeView bounds={mapBounds} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

const OfferCarpoolForm = ({ user, onRidePosted }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [driverPhone, setDriverPhone] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!user?._id) {
      setError("You must be logged in to offer a ride.");
      return;
    }

    try {
      const rideData = {
        driver: user._id,
        from,
        to,
        departureTime,
        seatsAvailable,
        driverPhone,
        price: Number(price) || 0,
        notes,
      };
      await api.post(API_URL, rideData);
      setSuccess(true);
      setFrom("");
      setTo("");
      setDepartureTime("");
      setSeatsAvailable(1);
      setPrice("");
      setNotes("");
      setDriverPhone("");
      onRidePosted(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post ride.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <UserPlus className="mr-3 text-blue-600" /> Offer a Carpool
      </h2>
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <p>Your ride has been posted successfully!</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
          <input type="text" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
        </div>
        <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" min={getMinDateTimeString()}/>
        <input type="tel" placeholder="Your Contact Number" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Users className="h-5 w-5 text-gray-400" /></span>
            <input type="number" placeholder="Seats" value={seatsAvailable} onChange={(e) => setSeatsAvailable(e.target.value)} min="1" max="8" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg"/>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><DollarSign className="h-5 w-5 text-gray-400" /></span>
            <input type="number" placeholder="Price per Seat (₹)" value={price} onChange={(e) => setPrice(e.target.value)} min="0" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg"/>
          </div>
        </div>
        <textarea placeholder="Additional notes (e.g., car model)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" rows="2"/>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Post Ride Offer</button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

const AvailableCarpools = ({ rides, currentUserId, onCancel, onBookCarpool, loading }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Search className="mr-3 text-blue-600" /> Join a Carpool
      </h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {loading ? (
          <p>Loading available rides...</p>
        ) : rides.length > 0 ? (
          rides.map((ride) => (
            <RideCard
              key={ride._id}
              ride={ride}
              currentUserId={currentUserId}
              onCancel={onCancel}
              onBookCarpool={() => onBookCarpool(ride)}
            />
          ))
        ) : (
          <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
            <NoRidesIcon />
            <h2 className="text-2xl font-semibold mt-4">No Rides Found</h2>
            <p className="text-gray-500 mt-2">
              There are no active carpools available right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const RideCard = ({ ride, currentUserId, onCancel, onBookCarpool }) => {
  const isDriver = currentUserId && ride.driver?._id && String(currentUserId) === String(ride.driver._id);
  
  return (
    <div className="bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between border">
      <div>
        <div className="flex justify-between items-start mb-4">
          <p className="font-bold text-lg">{ride.from} <ArrowRight className="inline h-4 w-4 mx-1" /> {ride.to}</p>
          <div className="flex items-center bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
            <Users className="h-4 w-4 mr-1" /> {ride.seatsAvailable} Seat{ride.seatsAvailable > 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-gray-600 space-y-2">
          <p className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {new Date(ride.departureTime).toLocaleString()}</p>
          <p className="flex items-center"><CarIcon className="h-4 w-4 mr-2" /> Driver: <span className="font-semibold ml-1">{ride.driver?.name}</span></p>
          {ride.notes && <p className="text-sm pt-2 border-t border-gray-200 mt-2">Notes: "{ride.notes}"</p>}
        </div>
      </div>
      <div className="mt-4">
        {isDriver ? (
          <button onClick={() => onCancel(ride._id)} className="w-full bg-red-100 text-red-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">
            Cancel My Offer
          </button>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-green-600">₹{ride.price.toLocaleString()}</p>
            <button onClick={onBookCarpool} className="bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              Book Seat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AcceptedRideCard = ({ ride }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
    <div className="flex justify-between items-center mb-4">
      <p className="font-bold text-lg">{ride.from} <ArrowRight className="inline h-4 w-4 mx-1" /> {ride.to}</p>
      <div className="flex items-center bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">Ride Accepted!</div>
    </div>
    <div className="text-gray-600 space-y-2">
      <p className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {new Date(ride.departureTime).toLocaleString()}</p>
      <p className="flex items-center"><CarIcon className="h-4 w-4 mr-2" /> Driver: <span className="font-semibold ml-1">{ride.driver?.name}</span></p>
      <p className="flex items-center font-semibold text-gray-800"><Phone className="h-4 w-4 mr-2" /> {ride.driverPhone}</p>
      <p className="flex items-center font-semibold text-green-600"><DollarSign className="h-4 w-4 mr-2" /> Paid: ₹{ride.price.toLocaleString()}</p>
      {ride.notes && <p className="text-sm pt-2 border-t border-gray-200 mt-2">Notes: "{ride.notes}"</p>}
    </div>
  </div>
);

const MyRideActivity = ({ acceptedRides, myOffers, onCancel, onBookCarpool, currentUserId }) => {
  return (
    <div className="mt-12 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <List className="mr-3 text-blue-600" /> My Ride Activity
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">My Booked Seats</h3>
          {acceptedRides.length > 0 ? (
            <div className="space-y-4">
              {acceptedRides.map(r => <AcceptedRideCard key={r._id} ride={r} />)}
            </div>
          ) : (
            <p className="text-gray-500">You haven't booked any carpool seats yet.</p>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">My Active Offers</h3>
          {myOffers.length > 0 ? (
            <div className="space-y-4">
              {myOffers.map(r => (
                <RideCard key={r._id} ride={r} currentUserId={currentUserId} onCancel={onCancel} onBookCarpool={onBookCarpool} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You have no active carpool offers.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ModeToggle = ({ selected, onSelect }) => (
    <div className="relative flex justify-center p-1 bg-gray-200 rounded-full max-w-md mx-auto mb-10">
      <div className={`absolute top-1 bottom-1 left-1 w-1/2 bg-white rounded-full shadow-md transition-transform duration-700 ease-in-out`} style={{ transform: selected === 'private' ? 'translateX(0%)' : 'translateX(98%)' }} />
      <button onClick={() => onSelect("private")} className={`relative z-10 w-1/2 py-3 px-4 rounded-full font-bold text-center transition-colors duration-300 ${selected === "private" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}>
        <div className="flex items-center justify-center"><Briefcase className="h-5 w-5 mr-2" /> Book a Private Ride</div>
      </button>
      <button onClick={() => onSelect("carpool")} className={`relative z-10 w-1/2 py-3 px-4 rounded-full font-bold text-center transition-colors duration-300 ${selected === "carpool" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}>
        <div className="flex items-center justify-center"><Users className="h-5 w-5 mr-2" /> Join/Offer Carpool</div>
      </button>
    </div>
);

const RidePage = () => {
  const [activeMode, setActiveMode] = useState("private");
  const [activeRides, setActiveRides] = useState([]);
  const [acceptedRides, setAcceptedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(DataContext);
  const [showCarpoolModal, setShowCarpoolModal] = useState(false);
  const [bookedRideDetails, setBookedRideDetails] = useState(null);

  const fetchAllRides = async () => {
    setLoading(true);
    try {
      const activeRes = await api.get(API_URL);
      setActiveRides(Array.isArray(activeRes.data) ? activeRes.data : []);
      if (user?._id) {
        const acceptedRes = await api.get(`${API_URL}/accepted/${user._id}`);
        setAcceptedRides(Array.isArray(acceptedRes.data) ? acceptedRes.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch rides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRides();
  }, [user]);

  const handleRideBooked = (newBooking) => {
    setBookedRideDetails(newBooking);
    setShowCarpoolModal(true);
  };

  const handleCancelRide = async (rideId) => {
    if (!user?._id) return alert("You must be logged in to cancel a ride.");
    if (!window.confirm("Are you sure you want to permanently delete this ride offer?")) return;
    try {
      await api.delete(`${API_URL}/${rideId}/cancel`, { data: { userId: user._id } });
      fetchAllRides();
    } catch (err) {
      console.error(err);
      alert("Could not delete ride.");
    }
  };

  const onCarpoolPaymentSuccess = async (rideId, paymentResult) => {
    try {
      await api.patch(`${API_URL}/${rideId}/accept`, { userId: user._id });
      fetchAllRides();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment successful, but failed to confirm booking. Please contact support.");
    }
  };

  const handleBookCarpool = async (ride) => {
    if (!user?._id) return alert("You must be logged in to accept a ride.");
    const paymentItem = { _id: ride._id, name: `Seat: ${ride.from} to ${ride.to}`, price: ride.price };
    try {
      await handlePayment({ item: paymentItem, user: user, onPaymentSuccess: (paymentResult) => onCarpoolPaymentSuccess(ride._id, paymentResult) });
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Could not initiate payment. Please try again.");
    }
  };

  const myRideOffers = activeRides.filter((r) => r.driver?._id && String(r.driver._id) === String(user?._id));
  const otherRides = activeRides.filter((r) => r.driver?._id && String(r.driver._id) !== String(user?._id));

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Book Rides & Carpool</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Book a private ride, or offer/join a community carpool.</p>
          </div>
          <ModeToggle selected={activeMode} onSelect={setActiveMode} />
          <div>
            {activeMode === "private" && (
              <div className="max-w-6xl mx-auto animate-fade-in">
                <BookPrivateRideForm user={user} onRideBooked={handleRideBooked} />
              </div>
            )}
            {activeMode === "carpool" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                <OfferCarpoolForm user={user} onRidePosted={fetchAllRides} />
                <AvailableCarpools rides={otherRides} currentUserId={user?._id} onCancel={handleCancelRide} onBookCarpool={handleBookCarpool} loading={loading} />
              </div>
            )}
          </div>
          {user && (acceptedRides.length > 0 || myRideOffers.length > 0) && (
            <MyRideActivity acceptedRides={acceptedRides} myOffers={myRideOffers} onCancel={handleCancelRide} onBookCarpool={handleBookCarpool} currentUserId={user?._id} />
          )}
        </main>
      </div>
      {showCarpoolModal && (
        <CarpoolOfferModal bookingDetails={bookedRideDetails} user={user} onClose={() => { setShowCarpoolModal(false); fetchAllRides(); }} />
      )}
      <Footer />
      <style>{` .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </>
  );
};

export default RidePage;