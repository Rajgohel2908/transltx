// components/TripViewPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom"; // assuming route is /trips/:id
import axios from "axios";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { DataContext } from "../context/Context.jsx";
import { handlePayment } from "../utils/cashfree.js";

const TripViewPage = () => {
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { id } = useParams(); // trip ID from URL
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(DataContext);

  const handleBooking = () => {
    if (!user?._id) return alert("Please log in to book a trip.");
    handlePayment({ item: trip, user });
  };

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

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
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
              <p className="text-3xl font-bold text-green-600">{trip.price}</p>
              <p className="text-sm text-gray-500">per person</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed my-6">{trip.description}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 border-b pb-2">What's Included:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-8">
            {trip.features.map((feature, index) => (
              <li key={index} className="flex items-center"><span className="text-green-500 mr-2">✔</span>{feature}</li>
            ))}
          </ul>

          <button onClick={handleBooking} className="w-full bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg">
            Book Now & Pay
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TripViewPage;
