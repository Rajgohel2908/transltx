import React, { useState, useEffect } from "react";
import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const PARKING_API_URL = `${VITE_BACKEND_BASE_URL}/parking`;

const ParkingForm = ({ onParkingSaved, editingParking, setEditingParking }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");
  const [carRate, setCarRate] = useState("");
  const [busRate, setBusRate] = useState("");
  const [bikeRate, setBikeRate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingParking) {
      setName(editingParking.name);
      setLocation(editingParking.location);
      setTotalSlots(editingParking.totalSlots);
      setAvailableSlots(editingParking.availableSlots);
      setCarRate(editingParking.rates.car);
      setBusRate(editingParking.rates.bus);
      setBikeRate(editingParking.rates.bike);
    } else {
      setName("");
      setLocation("");
      setTotalSlots("");
      setAvailableSlots("");
      setCarRate("");
      setBusRate("");
      setBikeRate("");
    }
  }, [editingParking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const parkingData = {
      name,
      location,
      totalSlots: Number(totalSlots),
      availableSlots: Number(availableSlots),
      rates: {
        car: Number(carRate),
        bus: Number(busRate),
        bike: Number(bikeRate),
      },
    };

    try {
      let response;
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      if (editingParking) {
        response = await axios.put(`${PARKING_API_URL}/${editingParking._id}`, parkingData, authHeaders);
      } else {
        response = await axios.post(PARKING_API_URL, parkingData, authHeaders);
      }
      onParkingSaved(response.data);
      setEditingParking(null);
    } catch (err) {
      console.error("Parking lot save error:", err);
      setError(err.response?.data?.message || "Failed to save parking lot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingParking ? "Edit Parking Lot" : "Create New Parking Lot"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Parking Lot Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" placeholder="Total Slots" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Available Slots" value={availableSlots} onChange={(e) => setAvailableSlots(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
         <h4 className="text-md font-semibold text-gray-700 pt-2">Hourly Rates</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" placeholder="Car Rate (₹)" value={carRate} onChange={(e) => setCarRate(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Bus Rate (₹)" value={busRate} onChange={(e) => setBusRate(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            <input type="number" placeholder="Bike Rate (₹)" value={bikeRate} onChange={(e) => setBikeRate(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? "Saving..." : (editingParking ? "Save Changes" : "Create Parking Lot")}
          </button>
          {editingParking && (
            <button type="button" onClick={() => setEditingParking(null)} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

export default ParkingForm;