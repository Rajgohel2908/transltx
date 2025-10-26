// components/TripViewPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // assuming route is /trips/:id
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const TripViewPage = () => {
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { id } = useParams(); // trip ID from URL
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (!trip) return <div className="text-center mt-10 text-red-500">Trip not found.</div>;

  return (
    <>
    <Navbar />
    <div className="max-w-4xl mx-auto p-6">
      <img
        src={trip.image.startsWith('http') 
          ? trip.image 
          : `${VITE_BACKEND_BASE_URL}${trip.image}`}
        alt={trip.name}
        className="w-full h-80 object-cover rounded-lg shadow-md mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
      <p className="text-gray-600 mb-4">{trip.description}</p>

      <div className="flex gap-4 mb-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Duration: {trip.duration}
        </span>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          Price: {trip.price}
        </span>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Features:</h2>
      <ul className="list-disc list-inside text-gray-700">
        {trip.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
    <Footer />
    </>
  );
};

export default TripViewPage;
