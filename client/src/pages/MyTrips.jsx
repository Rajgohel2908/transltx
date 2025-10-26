import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, ArrowRight, Heart, Search } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Sample Data ---
const sampleTrips = [
  {
    _id: "sample1",
    name: "Mountain Escape to Manali",
    description: "Experience the breathtaking beauty of the Himalayas with our curated trip to Manali.",
    duration: "5 Days, 4 Nights",
    price: "₹15,999",
    image: "https://images.unsplash.com/photo-1565639942524-71145d5186c2?q=80&w=2070&auto=format&fit=crop",
    features: ["Guided Treks", "Bonfire Nights", "Local Cuisine"],
  },
  {
    _id: "sample2",
    name: "Goa Beach Paradise",
    description: "Relax on the sunny beaches of Goa and enjoy the vibrant nightlife.",
    duration: "4 Days, 3 Nights",
    price: "₹12,499",
    image: "https://images.unsplash.com/photo-1590372720110-33d148a398f5?q=80&w=1932&auto=format&fit=crop",
    features: ["Beach Parties", "Water Sports", "Seafood Feast"],
  },
  {
    _id: "sample3",
    name: "Rajasthan Royal Tour",
    description: "Explore the majestic forts and palaces of Jaipur, Udaipur, and Jodhpur.",
    duration: "7 Days, 6 Nights",
    price: "₹25,000",
    image: "https://images.unsplash.com/photo-1524230507669-3ff942193544?q=80&w=2070&auto=format&fit=crop",
    features: ["Palace Stays", "Camel Safari", "Cultural Shows"],
  },
];


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
        // If API returns no trips, use sample data
        if (tripsData.length === 0) {
          setTrips(sampleTrips);
        } else {
          setTrips(tripsData);
        }
      } catch (err) {
        setError("Could not load trips. Please try again later.");
        console.error("Failed to fetch trips:", err);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Next Adventure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from our collection of amazing trips, each designed to
              provide unforgettable experiences.
            </p>
          </div>

          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for your next adventure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {loading && <p className="text-center">Loading trips...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && filteredTrips.length === 0 && (
            <p className="text-center text-gray-600">{searchTerm ? "No trips match your search." : "No trips available."}</p>
          )}

          {!loading && !error && filteredTrips.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.image.startsWith('http') 
                        ? trip.image 
                        : `${API_BASE_URL}${trip.image}`}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleLike(trip._id)}
                        className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
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

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {trip.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{trip.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{trip.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-600 font-bold">
                        <span>{trip.price}</span>
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
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
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
