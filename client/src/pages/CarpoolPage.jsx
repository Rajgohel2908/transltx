import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../context/Context.jsx";
import Footer from "../components/Footer";

// --- Helper Icons ---
const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.494h18" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l-4 4m8-14l4-4m-4 4v14m0-14L5 5m14 14l-4-4" />
  </svg>
);

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NoRidesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

// --- API URL using .env ---
const API_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/rides`;

// --- Offer Ride Form ---
const OfferRideForm = ({ onRidePosted }) => {
  const { user } = useContext(DataContext);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [driverPhone, setDriverPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?._id) {
      setError("You must be logged in to offer a ride.");
      return;
    }

    try {
      const rideData = { driver: user._id, from, to, departureTime, seatsAvailable, driverPhone, notes };
      await axios.post(API_URL, rideData);
      setSuccess("Your ride has been posted successfully!");
      setFrom(""); setTo(""); setDepartureTime(""); setSeatsAvailable(1); setNotes(""); setDriverPhone("");
      onRidePosted();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post ride.");
    }
  };

  if (!user?._id) return <div className="bg-blue-50 text-center p-6 rounded-lg border border-blue-200"><p className="font-semibold text-blue-800">Please log in to offer a ride.</p></div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Offer a Ride</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
          <input type="text" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
          <input type="number" placeholder="Seats" value={seatsAvailable} onChange={(e) => setSeatsAvailable(e.target.value)} min="1" max="8" required className="w-full p-3 border border-gray-300 rounded-lg"/>
        </div>
        <input type="tel" placeholder="Your Contact Number" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg"/>
        <textarea placeholder="Additional notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" rows="2"/>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Post Ride Offer</button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
      </form>
    </div>
  );
};

// --- Ride Card ---
const RideCard = ({ ride, currentUserId, onCancel, onAccept }) => {
  const isDriver = currentUserId && ride.driver?._id && String(currentUserId) === String(ride.driver._id);
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-lg">{ride.from} → {ride.to}</p>
          <div className="flex items-center bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
            <UserGroupIcon /> {ride.seatsAvailable} Seat{ride.seatsAvailable > 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-gray-600 space-y-2">
          <p className="flex items-center"><ClockIcon /> {new Date(ride.departureTime).toLocaleString()}</p>
          <p className="flex items-center"><CarIcon /> Driver: <span className="font-semibold ml-1">{ride.driver?.name}</span></p>
          {ride.notes && <p className="text-sm pt-2 border-t border-gray-200 mt-2">Notes: "{ride.notes}"</p>}
        </div>
      </div>
      <div className="mt-4">
        {isDriver ? (
          <button onClick={() => onCancel(ride._id)} className="w-full bg-red-100 text-red-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">Cancel My Offer</button>
        ) : (
          <button onClick={() => onAccept(ride._id)} className="w-full bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Accept Ride</button>
        )}
      </div>
    </div>
  );
};

// --- Accepted Ride Card ---
const AcceptedRideCard = ({ ride }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
    <div className="flex justify-between items-center mb-4">
      <p className="font-bold text-lg">{ride.from} → {ride.to}</p>
      <div className="flex items-center bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">Ride Accepted!</div>
    </div>
    <div className="text-gray-600 space-y-2">
      <p className="flex items-center"><ClockIcon /> {new Date(ride.departureTime).toLocaleString()}</p>
      <p className="flex items-center"><CarIcon /> Driver: <span className="font-semibold ml-1">{ride.driver?.name}</span></p>
      <p className="flex items-center font-semibold text-gray-800"><PhoneIcon /> {ride.driverPhone}</p>
      {ride.notes && <p className="text-sm pt-2 border-t border-gray-200 mt-2">Notes: "{ride.notes}"</p>}
    </div>
  </div>
);

// --- Main Page ---
const CarpoolPage = () => {
  const [activeRides, setActiveRides] = useState([]);
  const [acceptedRides, setAcceptedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(DataContext);

  const fetchAllRides = async () => {
    setLoading(true);
    try {
      const activeRes = await axios.get(API_URL);
      setActiveRides(Array.isArray(activeRes.data) ? activeRes.data : []);

      if (user?._id) {
        const acceptedRes = await axios.get(`${API_URL}/accepted/${user._id}`);
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

  const handleCancelRide = async (rideId) => {
    if (!user?._id) return alert("You must be logged in to cancel a ride.");
    if (!window.confirm("Are you sure you want to permanently delete this ride offer?")) return;
    try { await axios.delete(`${API_URL}/${rideId}/cancel`, { data: { userId: user._id } }); fetchAllRides(); } 
    catch (err) { console.error(err); alert("Could not delete ride."); }
  };

  const handleAcceptRide = async (rideId) => {
    if (!user?._id) return alert("You must be logged in to accept a ride.");
    try { await axios.patch(`${API_URL}/${rideId}/accept`, { userId: user._id }); fetchAllRides(); } 
    catch (err) { console.error(err); alert("Could not accept ride."); }
  };

  const myRideOffers = activeRides.filter(r => r.driver?._id && String(r.driver._id) === String(user?._id));
  const otherRides = activeRides.filter(r => r.driver?._id && String(r.driver._id) !== String(user?._id));

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Community Carpool</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Share a ride with fellow commuters.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2"><OfferRideForm onRidePosted={fetchAllRides} /></div>
            <div className="lg:col-span-3">
              {user?._id && acceptedRides.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 border-b-2 pb-2">My Accepted Rides</h2>
                  <div className="space-y-6">{acceptedRides.map(r => <AcceptedRideCard key={r._id} ride={r} />)}</div>
                </div>
              )}

              {user?._id && myRideOffers.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 border-b-2 pb-2">My Active Offers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myRideOffers.map(r => <RideCard key={r._id} ride={r} currentUserId={user._id} onCancel={handleCancelRide} onAccept={handleAcceptRide} />)}
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold mb-6 border-b-2 pb-2">Available Rides from Others</h2>
              {loading ? <p>Loading...</p> : otherRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{otherRides.map(r => <RideCard key={r._id} ride={r} currentUserId={user?._id} onCancel={handleCancelRide} onAccept={handleAcceptRide} />)}</div>
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md"><NoRidesIcon /><h2 className="text-2xl font-semibold mt-4">No Other Rides Found</h2><p className="text-gray-500 mt-2">There are no other active rides available right now.</p></div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default CarpoolPage;
