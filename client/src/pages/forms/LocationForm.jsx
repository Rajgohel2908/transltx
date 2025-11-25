import React, { useState } from "react";
import { api } from "../../utils/api.js";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const LocationForm = () => {
  const [stateName, setStateName] = useState("");
  const [cities, setCities] = useState("");
  const [type, setType] = useState("city"); // <-- NAYA STATE
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await api.post(`/locations`, {
        state: stateName,
        cities: cities,
        type: type, // <-- NAYA DATA BHEJ
      });

      setSuccess(response.data.message);
      // Form reset mat kar, shayad Admin ko aur add karna ho
      // setStateName(""); 
      setCities(""); // Bas cities ko clear kar
    } catch (err) {
      console.error("Location save error:", err);
      setError(err.response?.data?.message || "Failed to save locations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Add New Locations
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Add new cities, stations, or airports.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="State (e.g., Gujarat)"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {/* --- NAYA DROPDOWN --- */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
          >
            <option value="city">City / Bus Stop</option>
            <option value="train_station">Train Station</option> {/* <-- 'station' ko 'train_station' kar diya */}
            <option value="airport">Airport</option>
          </select>
          {/* --- END --- */}
        </div>

        <textarea
          placeholder="Cities (comma-separated, e.g., Surat, Surat Station (ST), Surat Airport (STV))"
          value={cities}
          onChange={(e) => setCities(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows="3"
        ></textarea>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Add Locations"}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm text-center">{success}</p>
        )}
      </form>
    </div>
  );
};

export default LocationForm;