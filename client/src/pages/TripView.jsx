// components/TripViewPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom"; // assuming route is /trips/:id
import axios from "axios";
import Footer from "../components/Footer.jsx";
import { DataContext } from "../context/Context.jsx";
import { handlePayment } from "../utils/cashfree.js";

const TripViewPage = () => {
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { id } = useParams(); // trip ID from URL
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(DataContext);
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!user?._id) return alert("Please log in to book a trip.");
    // Instead of calling payment directly, navigate to passenger details page so passenger info can be collected
    // We'll pass the selected trip as `selectedTicket` in location.state so PassengerDetails can use the same flow
    navigate(`/booking/trips/passenger-details`, { state: { selectedTicket: trip, searchType: 'Trips' } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`${VITE_BACKEND_BASE_URL}/trips/${id}`);
        setTrip(res.data);
      } catch (err) {
        console.error("Failed to fetch trip", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, VITE_BACKEND_BASE_URL]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (!trip) return <div className="text-center mt-10 text-red-500">Trip not found.</div>;

  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
        return price;
    }
    return numPrice.toLocaleString('en-IN');
  };

  return (
    <>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
          <img
            src={trip.image.startsWith('http')
              ? trip.image
              : `${VITE_BACKEND_BASE_URL}${trip.image}`}
            alt={trip.name}
            className="w-full h-96 object-cover rounded-lg shadow-md mb-8"
          />
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">{trip.name}</h1>
              <p className="text-gray-500 mt-2">{trip.duration}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">₹{formatPrice(trip.price)}</p>
              <p className="text-sm text-gray-500">per person</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed my-6">{trip.longDescription}</p>

          <div className="my-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Itinerary</h2>
            <div className="space-y-6">
              {trip.itinerary.map((item) => (
                <div key={item.day} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">{item.day}</div>
                    {trip.itinerary.length > item.day && <div className="w-px h-full bg-gray-300"></div>}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Inclusions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {trip.inclusions.map((item, index) => (
                <div key={index}>
                  <h3 className="font-bold text-gray-800">{item.category}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Exclusions</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {trip.exclusions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">What to Carry</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {trip.whatToCarry.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="my-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Logistics</h2>
            <div className="space-y-2">
              <p><span className="font-bold">Meeting Point:</span> {trip.logistics.meetingPoint}</p>
              <p><span className="font-bold">Reporting Time:</span> {trip.logistics.reportingTime}</p>
              <p><span className="font-bold">Departure Time:</span> {trip.logistics.departureTime}</p>
            </div>
          </div>

          <button onClick={handleBooking} className="w-full bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg shine-effect">
            Book Now & Pay
          </button>
        </div>
      </div>
      <Footer />
    </>
  );};

export default TripViewPage;
