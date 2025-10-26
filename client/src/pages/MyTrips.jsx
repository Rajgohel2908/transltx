import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, ArrowRight, Heart, Search } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]); // State for trips from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedTrips, setLikedTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch trips from the API when the component mounts
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/trips`);
        // Ensure response is always an array
        const tripsData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setTrips(tripsData);
      } catch (err) {
        setError("Could not load trips. Please try again later.");
        console.error("Failed to fetch trips:", err);
        setTrips([]); // Ensure trips is an empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const toggleLike = (tripId) => {
    setLikedTrips((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId]
    );
  };

  const filteredTrips = trips.filter((trip) =>
    trip.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Choose Your Next Adventure
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Select from our collection of amazing trips, each designed to
              provide unforgettable experiences.
            </p>
          </div>

          <div className="mb-16 max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for an adventure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
              />
            </div>
          </div>

          {loading && <p className="text-center text-gray-500">Loading trips...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">{searchTerm ? "No trips match your search." : "No trips available at the moment."}</p>
            </div>
          )}

          {!loading && !error && filteredTrips.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={trip.image.startsWith('http') 
                        ? trip.image 
                        : `${API_BASE_URL}${trip.image}`}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleLike(trip._id)}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all transform active:scale-90"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            likedTrips.includes(trip._id)
                              ? "text-red-500 fill-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {trip.name}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow">{trip.description}</p>

                    <div className="flex items-center justify-between mb-5 text-gray-700">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{trip.duration}</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {trip.price}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(trip.features) ? trip.features : []).map(
                          (feature, index) => (
                            <span
                              key={index}
                              className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/my-trips/${trip._id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 transform group-hover:scale-105"
                    >
                      <span>Select Trip</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyTripsPage;
