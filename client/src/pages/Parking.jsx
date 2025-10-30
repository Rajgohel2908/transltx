import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Car, Bike, Bus } from "lucide-react";
import Footer from "../components/Footer";

// Use environment variable for API base URL
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const API_URL = `${VITE_BACKEND_BASE_URL}/parking`;

// --- Skeleton Loader Card ---
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-200 rounded w-full"></div>
      <div className="h-12 bg-gray-300 rounded-lg"></div>
    </div>
  </div>
);

// --- Parking Lot Card Component ---
const ParkingCard = ({ lot }) => {
  const availabilityPercentage =
    lot.totalSlots > 0 ? (lot.availableSlots / lot.totalSlots) * 100 : 0;

  const getAvailabilityColor = () => {
    if (availabilityPercentage > 50) return "bg-green-500";
    if (availabilityPercentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-6 flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{lot.name}</h3>
        <p className="flex items-center text-gray-500 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          {lot.location}
        </p>

        <div>
          <div className="flex justify-between items-center mb-1 text-sm font-medium">
            <span className="text-gray-700">Availability</span>
            <span className="font-bold text-gray-800">
              {lot.availableSlots} / {lot.totalSlots} Slots
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getAvailabilityColor()}`}
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t">
        <h4 className="font-semibold text-gray-700 mb-3 text-center">
          Hourly Rates
        </h4>
        <div className="flex justify-around text-center">
          <div>
            <Car className="mx-auto h-6 w-6 text-gray-500" />
            <p className="text-sm text-gray-600 mt-1">Car</p>
            <p className="font-bold text-lg text-gray-800">₹{lot.rates.car}</p>
          </div>
          <div>
            <Bus className="mx-auto h-6 w-6 text-gray-500" />
            <p className="text-sm text-gray-600 mt-1">Bus</p>
            <p className="font-bold text-lg text-gray-800">₹{lot.rates.bus}</p>
          </div>
          <div>
            <Bike className="mx-auto h-6 w-6 text-gray-500" />
            <p className="text-sm text-gray-600 mt-1">Bike</p>
            <p className="font-bold text-lg text-gray-800">₹{lot.rates.bike}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Parking Page Component ---
const ParkingPage = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await axios.get(API_URL);
        // Ensure parkingLots is always an array
        setParkingLots(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          "Could not load parking information. Please try again later."
        );
        console.error("Failed to fetch parking lots:", err);
        setParkingLots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParkingLots();
  }, []);

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
              Smart Parking Availability
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find real-time availability and rates for parking lots across the
              city.
            </p>
          </div>

          {error && <p className="text-center text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
              : parkingLots.length > 0
              ? parkingLots.map((lot) => (
                  <ParkingCard key={lot._id} lot={lot} />
                ))
              : (
                <p className="text-center text-gray-500 col-span-full">
                  No parking lots found.
                </p>
              )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ParkingPage;
