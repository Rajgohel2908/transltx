import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, MapPin, Clock, Calendar, List, CheckCircle, XCircle, Backpack } from "lucide-react";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const TRIPS_API_URL = `${VITE_BACKEND_BASE_URL}/trips`;

// --- Helper Component for Dynamic Lists (Reusable) ---
const DynamicList = ({ title, icon: Icon, items, setItems, placeholder }) => {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;
    setItems([...items, newItem]);
    setNewItem("");
  };

  const handleRemove = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-300 space-y-3">
      <h4 className="font-bold text-gray-700 flex items-center gap-2">
        <Icon size={18} className="text-blue-600" /> {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
            <span className="text-sm text-gray-700">{item}</span>
            <button type="button" onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded text-sm"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <button type="button" onClick={handleAdd} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

const TripForm = ({ onTripSaved, editingTrip, setEditingTrip }) => {
  // Basic Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [type, setType] = useState("Bus");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [features, setFeatures] = useState("");

  // Complex Fields (Arrays/Objects)
  const [itinerary, setItinerary] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [whatToCarry, setWhatToCarry] = useState([]);
  const [logistics, setLogistics] = useState({ meetingPoint: "", reportingTime: "", departureTime: "" });

  // Itinerary Input State
  const [newDay, setNewDay] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      setPrice(editingTrip.price);
      setImage(editingTrip.image);
      setFeatures(Array.isArray(editingTrip.features) ? editingTrip.features.join(", ") : "");

      // Populate Arrays
      setItinerary(editingTrip.itinerary || []);
      setInclusions(editingTrip.inclusions || []);
      setExclusions(editingTrip.exclusions || []);
      setWhatToCarry(editingTrip.whatToCarry || []);
      setLogistics(editingTrip.logistics || { meetingPoint: "", reportingTime: "", departureTime: "" });
    } else {
      resetForm();
    }
  }, [editingTrip]);

  const resetForm = () => {
    setName(""); setDescription(""); setLongDescription("");
    setType("Bus"); setFrom(""); setTo("");
    setDepartureTime(""); setArrivalTime(""); setDuration("");
    setPrice(""); setImage(""); setFeatures("");
    setItinerary([]); setInclusions([]); setExclusions([]); setWhatToCarry([]);
    setLogistics({ meetingPoint: "", reportingTime: "", departureTime: "" });
  };

  // --- Handlers for Itinerary ---
  const addItineraryItem = () => {
    if (!newDay || !newTitle || !newDescription) {
      alert("Please fill Day, Title, and Description!");
      return;
    }
    setItinerary([...itinerary, { day: newDay, title: newTitle, description: newDescription }]);
    setNewDay(""); setNewTitle(""); setNewDescription("");
  };

  const removeItineraryItem = (index) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const tripData = {
        name, description, longDescription, type, from, to,
        departureTime, arrivalTime, duration,
        price: Number(price),
        image,
        features: features.split(",").map(f => f.trim()).filter(Boolean),
        itinerary,
        inclusions,
        exclusions,
        whatToCarry,
        logistics
      };

      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let response;
      if (editingTrip) {
        response = await axios.put(`${TRIPS_API_URL}/${editingTrip._id}`, tripData, config);
      } else {
        response = await axios.post(TRIPS_API_URL, tripData, config);
      }

      onTripSaved(response.data.trip);
      setEditingTrip(null);
    } catch (err) {
      console.error("Trip save error:", err);
      setError(err.response?.data?.message || "Failed to save trip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{editingTrip ? "Edit Trip" : "Create New Trip"}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Info Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Trip Name" value={name} onChange={e => setName(e.target.value)} required className="p-3 border rounded-lg w-full" />
          <select value={type} onChange={e => setType(e.target.value)} className="p-3 border rounded-lg w-full bg-white">
            <option>Bus</option><option>Train</option><option>Air</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="From" value={from} onChange={e => setFrom(e.target.value)} required className="p-3 border rounded-lg w-full" />
          <input type="text" placeholder="To" value={to} onChange={e => setTo(e.target.value)} required className="p-3 border rounded-lg w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <input type="text" placeholder="Duration (e.g. 3D/2N)" value={duration} onChange={e => setDuration(e.target.value)} required className="p-3 border rounded-lg w-full" />
           <input type="number" placeholder="Price (₹)" value={price} onChange={e => setPrice(e.target.value)} required className="p-3 border rounded-lg w-full" />
           <input type="text" placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} required className="p-3 border rounded-lg w-full" />
        </div>

        <textarea placeholder="Short Description" value={description} onChange={e => setDescription(e.target.value)} required className="p-3 border rounded-lg w-full" rows="2" />
        <textarea placeholder="Long Description" value={longDescription} onChange={e => setLongDescription(e.target.value)} className="p-3 border rounded-lg w-full" rows="3" />
        <input type="text" placeholder="Features (Comma separated: Wifi, AC)" value={features} onChange={e => setFeatures(e.target.value)} className="p-3 border rounded-lg w-full" />

        <hr className="border-gray-300" />

        {/* --- DYNAMIC ITINERARY SECTION --- */}
        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/> Itinerary</h4>
          
          {/* Existing Items */}
          <div className="space-y-3 mb-4">
            {itinerary.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100 relative group">
                <div className="w-16 flex-shrink-0 font-bold text-blue-800 bg-white rounded px-2 py-1 text-center shadow-sm">Day {item.day}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <button type="button" onClick={() => removeItineraryItem(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Item */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <input type="text" placeholder="Day" value={newDay} onChange={e => setNewDay(e.target.value)} className="md:col-span-2 p-2 border rounded" />
            <input type="text" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="md:col-span-4 p-2 border rounded" />
            <input type="text" placeholder="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="md:col-span-5 p-2 border rounded" />
            <button type="button" onClick={addItineraryItem} className="md:col-span-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"><Plus /></button>
          </div>
        </div>

        {/* --- DYNAMIC LISTS (Inclusions, etc.) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DynamicList title="Inclusions" icon={CheckCircle} items={inclusions} setItems={setInclusions} placeholder="Add inclusion..." />
          <DynamicList title="Exclusions" icon={XCircle} items={exclusions} setItems={setExclusions} placeholder="Add exclusion..." />
          <DynamicList title="What to Carry" icon={Backpack} items={whatToCarry} setItems={setWhatToCarry} placeholder="Add item..." />
        </div>

        {/* --- LOGISTICS SECTION (Structured) --- */}
        <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={20} className="text-orange-600"/> Logistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Meeting Point</label>
              <input type="text" value={logistics.meetingPoint} onChange={e => setLogistics({...logistics, meetingPoint: e.target.value})} className="w-full p-2 border rounded mt-1" placeholder="e.g. Delhi Station" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Reporting Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-2 top-3 text-gray-400" />
                <input type="text" value={logistics.reportingTime} onChange={e => setLogistics({...logistics, reportingTime: e.target.value})} className="w-full p-2 pl-8 border rounded mt-1" placeholder="e.g. 08:00 AM" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Departure Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-2 top-3 text-gray-400" />
                <input type="text" value={logistics.departureTime} onChange={e => setLogistics({...logistics, departureTime: e.target.value})} className="w-full p-2 pl-8 border rounded mt-1" placeholder="e.g. 09:00 AM" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Submit --- */}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70">
            {isSubmitting ? "Saving..." : (editingTrip ? "Update Trip" : "Create Trip")}
          </button>
          {editingTrip && (
            <button type="button" onClick={() => setEditingTrip(null)} className="px-6 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
          )}
        </div>
        
        {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
      </form>
    </div>
  );
};

export default TripForm;