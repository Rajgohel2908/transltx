import React, { useState, useEffect } from "react";
import axios from "axios";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const TRIPS_API_URL = `${VITE_BACKEND_BASE_URL}/trips`;

const TripForm = ({ onTripSaved, editingTrip, setEditingTrip }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [type, setType] = useState("Bus"); // Bus, Train, Air
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [features, setFeatures] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [whatToCarry, setWhatToCarry] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logistics, setLogistics] = useState('');

  useEffect(() => {
    if (editingTrip) {
      setName(editingTrip.name);
      setDescription(editingTrip.description);
      setLongDescription(editingTrip.longDescription || "");
      setType(editingTrip.type || "Bus");
      setFrom(editingTrip.from || "");
      setTo(editingTrip.to || "");
      setDepartureTime(editingTrip.departureTime || "");
      setArrivalTime(editingTrip.arrivalTime || "");
      setDuration(editingTrip.duration);
      const priceValue = typeof editingTrip.price === 'string' ? editingTrip.price.replace(/[^0-9.]/g, '') : editingTrip.price;
      setPrice(priceValue);
      setImage(editingTrip.image);
      setFeatures(editingTrip.features.join(", "));
      setItinerary(JSON.stringify(editingTrip.itinerary || [], null, 2));
      setInclusions(JSON.stringify(editingTrip.inclusions || [], null, 2));
      setExclusions((editingTrip.exclusions || []).join(", "));
      setWhatToCarry((editingTrip.whatToCarry || []).join(", "));
      setLogistics(JSON.stringify(editingTrip.logistics || {}, null, 2));
    } else {
      setName("");
      setDescription("");
      setLongDescription("");
      setType("Bus");
      setFrom("");
      setTo("");
      setDepartureTime("");
      setArrivalTime("");
      setDuration("");
      setPrice("");
      setImage("");
      setFeatures("");
      setItinerary("");
      setInclusions("");
      setExclusions("");
      setWhatToCarry("");
      setLogistics('');
    }
  }, [editingTrip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const tripData = {
        name,
        description,
        longDescription,
        type,
        from,
        to,
        departureTime,
        arrivalTime,
        duration,
        price: parseFloat(price),
        image,
        features: features.split(",").map((f) => f.trim()).filter(f => f),
        itinerary: JSON.parse(itinerary || '[]'),
        inclusions: JSON.parse(inclusions || '[]'),
        exclusions: exclusions.split(",").map(item => item.trim()).filter(item => item),
        whatToCarry: whatToCarry.split(",").map(item => item.trim()).filter(item => item),
        logistics: JSON.parse(logistics || '{}'),
      };
      let response;
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
      if (editingTrip) {
        response = await axios.put(`${TRIPS_API_URL}/${editingTrip._id}`, tripData, authHeaders);
      } else {
        response = await axios.post(TRIPS_API_URL, tripData, authHeaders);
      }
      onTripSaved(response.data.trip);
      setEditingTrip(null);
    } catch (err) {
      console.error("Trip save error:", err);
      setError(err.response?.data?.message || "Failed to save trip. Please check the format of JSON fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{editingTrip ? "Edit Trip" : "Create New Trip"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Trip Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <textarea placeholder="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" rows="2"></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="From (e.g., Delhi)" value={from} onChange={(e) => setFrom(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="To (e.g., Mumbai)" value={to} onChange={(e) => setTo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Departure Time (e.g., 08:30)" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Arrival Time (e.g., 10:45)" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Duration (e.g., 5 Days, 4 Nights)" value={duration} onChange={(e) => setDuration(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Price (INR)" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="Bus">Bus</option>
            <option value="Train">Train</option>
            <option value="Air">Air</option>
          </select>
        </div>
        <textarea placeholder="Long Description" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" rows="4"></textarea>
        <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Features (comma-separated)" value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        <textarea placeholder='Itinerary (JSON format): [{"day": "1", "title": "...", "description": "..."}]' value={itinerary} onChange={(e) => setItinerary(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" rows="4"></textarea>
        <textarea placeholder='Inclusions (JSON format): ["Accommodation", "Breakfast", "Guide"]' value={inclusions} onChange={(e) => setInclusions(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" rows="4"></textarea>
        <input type="text" placeholder="Exclusions (comma-separated)" value={exclusions} onChange={(e) => setExclusions(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="What to Carry (comma-separated)" value={whatToCarry} onChange={(e) => setWhatToCarry(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        <textarea 
  placeholder='Logistics (JSON format): {"meetingPoint": "Surat Station", "reportingTime": "8:00 AM"}' 
  value={logistics} 
  onChange={(e) => setLogistics(e.target.value)} 
  className="w-full p-3 border border-gray-300 rounded-lg" 
  rows="4">
</textarea>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{isSubmitting ? "Saving..." : (editingTrip ? "Save Changes" : "Create Trip")}</button>
          {editingTrip && (<button type="button" onClick={() => setEditingTrip(null)} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>)}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

export default TripForm;