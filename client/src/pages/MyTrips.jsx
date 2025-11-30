import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, ArrowRight, Heart, Search, Filter } from "lucide-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination"; // <-- YEH ADD KAR

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]); // State for trips from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedTrips, setLikedTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [uniqueDurations, setUniqueDurations] = useState([]);
  const [uniqueFeatures, setUniqueFeatures] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- YEH NAYA STATE ADD KAR ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; // Ek page pe 6 card dikha
  // -----------------------------

  // Fetch trips from the API when the component mounts
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/trips`);
        const tripsData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setTrips(tripsData);

        if (tripsData.length > 0) {
          const durations = [...new Set(tripsData.map(trip => trip.duration))];
          setUniqueDurations(durations);

          const allFeatures = tripsData.flatMap(trip => trip.features);
          const features = [...new Set(allFeatures)];
          setUniqueFeatures(features);
        }

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

  const handleFeatureChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedFeatures([...selectedFeatures, value]);
    } else {
      setSelectedFeatures(selectedFeatures.filter(feature => feature !== value));
    }
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return price;
    }
    return numPrice.toLocaleString('en-IN');
  };

  const filteredTrips = trips
    .filter((trip) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((trip) =>
      selectedDuration ? trip.duration === selectedDuration : true
    )
    .filter((trip) =>
      selectedFeatures.length > 0
        ? selectedFeatures.every(feature => trip.features.includes(feature))
        : true
    )
    .sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^0-9.-]+/g, "")) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^0-9.-]+/g, "")) : b.price;

      if (sortOrder === "price-asc") {
        return priceA - priceB;
      }
      if (sortOrder === "price-desc") {
        return priceB - priceA;
      }
      return 0;
    });

  // --- YEH NAYA PAGINATION LOGIC ADD KAR ---
  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  // ---------------------------------

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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

          <div className="mb-8 flex justify-center items-center gap-4">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for an adventure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
              />
            </div>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-3 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {isFilterOpen && (
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Sort by price</h4>
                  <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm">
                    <option value="">Select</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Filter by duration</h4>
                  <select onChange={(e) => setSelectedDuration(e.target.value)} value={selectedDuration} className="w-full border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm">
                    <option value="">All durations</option>
                    {uniqueDurations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Filter by features</h4>
                  <div className="flex flex-wrap gap-4">
                    {uniqueFeatures.map(feature => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={feature}
                          onChange={handleFeatureChange}
                          checked={selectedFeatures.includes(feature)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && <p className="text-center text-gray-500">Loading trips...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">{searchTerm ? "No trips match your search." : "No trips available at the moment."}</p>
            </div>
          )}

          {!loading && !error && filteredTrips.length > 0 && (
            <> {/* <-- Yahan se replacement chalu */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 'filteredTrips' ko 'paginatedTrips' se replace kar */}
                {paginatedTrips.map((trip) => (
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
                            className={`h-5 w-5 ${likedTrips.includes(trip._id)
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
                          ₹{formatPrice(trip.price)}
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

              {/* --- YEH NAYA PAGINATION BLOCK ADD KAR --- */}
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </> /* <-- Yahan tak replace kar */
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyTripsPage;
