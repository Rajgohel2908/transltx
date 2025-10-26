import React, { useState, useEffect } from "react";
import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const ROUTES_API_URL = `${VITE_BACKEND_BASE_URL}/routes`;

const RouteForm = ({ onRouteSaved, editingRoute, setEditingRoute }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("bus");
  const [color, setColor] = useState("#3B82F6");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("22:00");
  const [frequency, setFrequency] = useState(15);
  const [stops, setStops] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingRoute) {
      setId(editingRoute.id);
      setName(editingRoute.name);
      setType(editingRoute.type);
      setColor(editingRoute.color);
      setStartTime(editingRoute.startTime);
      setEndTime(editingRoute.endTime);
      setFrequency(editingRoute.frequency);
      setStops(JSON.stringify(editingRoute.stops, null, 2));
    } else {
      setId("");
      setName("");
      setType("bus");
      setColor("#3B82F6");
      setStartTime("06:00");
      setEndTime("22:00");
      setFrequency(15);
      setStops("");
    }
  }, [editingRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let parsedStops;
      try {
        parsedStops = JSON.parse(stops);
        if (!Array.isArray(parsedStops)) {
          throw new Error("Stops data must be an array.");
        }
      } catch (jsonError) {
        setError("Invalid JSON format for stops. Please provide a valid JSON array.");
        return;
      }

      const routeData = {
        id, name, type, color, startTime, endTime, frequency,
        stops: parsedStops,
      };

      let response;
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      if (editingRoute) {
        response = await axios.put(`${ROUTES_API_URL}/${editingRoute._id}`, routeData, authHeaders);
      } else {
        response = await axios.post(ROUTES_API_URL, routeData, authHeaders);
      }
      onRouteSaved(response.data.route);
      setEditingRoute(null);
    } catch (err) {
      console.error("Route save error:", err);
      setError(err.response?.data?.message || "Failed to save route.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingRoute ? "Edit Route" : "Create New Route"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Route ID (e.g., bus-101)" value={id} onChange={(e) => setId(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Route Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="bus">Bus</option>
            <option value="metro">Metro</option>
            <option value="car">Car</option>
            <option value="cycle">Cycle</option>
          </select>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-12 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="number" placeholder="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <textarea placeholder="Stops (Paste JSON Array here)" value={stops} onChange={(e) => setStops(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm" rows="5"></textarea>
        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? "Saving..." : (editingRoute ? "Save Changes" : "Create Route")}
          </button>
          {editingRoute && (
            <button type="button" onClick={() => setEditingRoute(null)} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

export default RouteForm;