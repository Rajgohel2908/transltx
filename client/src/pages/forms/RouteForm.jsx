import React, { useState, useEffect } from "react";
import { api } from "../../utils/api.js";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const ROUTES_API_URL = `${VITE_BACKEND_BASE_URL}/routes`;

const RouteForm = ({ onRouteSaved, editingRoute, setEditingRoute }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [type, setType] = useState("bus");
  const [operator, setOperator] = useState("");
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState("12:00");
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [stops, setStops] = useState([]); // each stop: { stopName, priceFromStart, estimatedTimeAtStop }
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [price, setPrice] = useState("");
  const [scheduleType, setScheduleType] = useState("daily"); // 'daily', 'weekly', 'specific_date'
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [specificDate, setSpecificDate] = useState('');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ADD THIS HELPER FUNCTION ---
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayString = getTodayString();
  useEffect(() => {
    if (editingRoute) {
      setId(editingRoute.id);
      setName(editingRoute.name);
      setType(editingRoute.type);
      setOperator(editingRoute.operator || '');
      setEstimatedArrivalTime(editingRoute.estimatedArrivalTime || '12:00');
      setStartTime(editingRoute.startTime || "06:00");
      setStartPoint(editingRoute.startPoint || "");
      setEndPoint(editingRoute.endPoint || "");
      // Normalize stops to objects
      const existingStops = editingRoute.stops || [];
      const normalized = existingStops.map(s => {
        if (typeof s === 'string') return { stopName: s, priceFromStart: 0, estimatedTimeAtStop: '' };
        return { stopName: s.stopName || s.name || '', priceFromStart: s.priceFromStart || 0, estimatedTimeAtStop: s.estimatedTimeAtStop || '' };
      });
      setStops(normalized);
      setFlightNumber(editingRoute.flightNumber || "");
      setAirline(editingRoute.airline || "");
      setPrice(editingRoute.price || "");
      setScheduleType(editingRoute.scheduleType || (editingRoute.type === 'air' ? 'specific_date' : 'daily'));
      setDaysOfWeek(editingRoute.daysOfWeek || []);
      setSpecificDate(editingRoute.specificDate ? new Date(editingRoute.specificDate).toISOString().split('T')[0] : '');
      setAmenitiesInput(Array.isArray(editingRoute.amenities) ? editingRoute.amenities.join(', ') : (editingRoute.amenities || ''));
    } else {
      setId("");
      setName("");
      setStartPoint("");
      setEndPoint("");
      setType("bus");
      setOperator('');
      setEstimatedArrivalTime('12:00');
      setStartTime("06:00");
      setStops([]);
      setFlightNumber("");
      setAirline("");
      setPrice("");
      setScheduleType("bus" === 'air' ? 'specific_date' : 'daily');
      setDaysOfWeek([]);
      setSpecificDate('');
      setAmenitiesInput('');
    }
  }, [editingRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (type !== 'air' && scheduleType === 'weekly' && daysOfWeek.length === 0) {
      setError("Please select at least one day for a weekly schedule.");
      return;
    }

    try {
      let routeData = {
        id,
        name,
        type,
        operator,
        amenities: amenitiesInput ? amenitiesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        estimatedArrivalTime: estimatedArrivalTime,
        startPoint,
        endPoint,
        price: parseFloat(price) || 0,
      };

      if (type === 'air') {
        routeData = { ...routeData, flightNumber, airline, scheduleType: 'specific_date', specificDate, startTime };
      } else {
        routeData = { ...routeData, scheduleType, stops, startTime };
        if (scheduleType === 'daily') {
          routeData = { ...routeData };
        } else if (scheduleType === 'weekly') {
          routeData = { ...routeData, daysOfWeek };
        } else if (scheduleType === 'specific_date') {
          routeData = { ...routeData, specificDate };
        }
      }

      let response;
      setIsSubmitting(true);
      if (editingRoute) {
        response = await api.put(`${ROUTES_API_URL}/${editingRoute._id}`, routeData);
      } else {
        response = await api.post(ROUTES_API_URL, routeData);
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

  const handleAddStop = () => {
    setStops(prev => ([...prev, { stopName: '', priceFromStart: 0, estimatedTimeAtStop: '' }]));
  };

  const handleRemoveStop = (index) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const handleStopChange = (index, field, value) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: field === 'priceFromStart' ? Number(value) : value } : s));
  };

  const handleDayOfWeekChange = (day) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingRoute ? "Edit Route" : "Create New Route"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Route ID (e.g., bus-101)" value={id} onChange={(e) => setId(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Route Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="number" placeholder="Price (INR)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder={type === 'air' ? "Departure Airport" : "Start Point"} value={startPoint} onChange={(e) => setStartPoint(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder={type === 'air' ? "Arrival Airport" : "End Point"} value={endPoint} onChange={(e) => setEndPoint(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />

        <div className="grid grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="air">Air</option>
          </select>
          <input type="text" placeholder="Operator (e.g., RedBus)" value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        {type === 'air' ? (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
            <h4 className="font-semibold text-gray-700">Flight Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Flight Number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Airline" value={airline} onChange={(e) => setAirline(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="date" 
                placeholder="Departure Date" 
                value={specificDate} 
                onChange={(e) => setSpecificDate(e.target.value)} 
                required className="w-full p-3 border border-gray-300 rounded-lg" 
                min={todayString} />
              <input type="time" placeholder="Departure Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
              <h4 className="font-semibold text-gray-700">Scheduling</h4>
              <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="specific_date">Specific Date</option>
              </select>

              {scheduleType === 'daily' ? (
                <div className="grid grid-cols-2 gap-4">
                  <input type="time" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
                  <input type="time" placeholder="Estimated Arrival Time" value={estimatedArrivalTime} onChange={(e) => setEstimatedArrivalTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              ) : scheduleType === 'weekly' ? (
                <div>
                  <div className="mb-2 text-sm font-medium text-gray-700">Select Days:</div>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <button key={day} type="button" onClick={() => handleDayOfWeekChange(day)} className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${daysOfWeek.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {day}
                      </button>
                    ))}
                  </div>
                  <input type="time" placeholder="Departure Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg mt-4" />
                </div>
              ) : ( // specific_date
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date" 
                    placeholder="Select Date" 
                    value={specificDate} 
                    onChange={(e) => setSpecificDate(e.target.value)} 
                    required className="w-full p-3 border border-gray-300 rounded-lg" 
                    min={todayString} />
                  <input type="time" placeholder="Departure Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intermediate Stops</label>
              {stops.map((stop, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <input type="text" placeholder={`Stop ${index + 1} Name`} value={stop.stopName} onChange={(e) => handleStopChange(index, 'stopName', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                  <input type="number" placeholder="Price From Start (INR)" value={stop.priceFromStart} onChange={(e) => handleStopChange(index, 'priceFromStart', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                  <input type="time" placeholder="Estimated Time" value={stop.estimatedTimeAtStop} onChange={(e) => handleStopChange(index, 'estimatedTimeAtStop', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleRemoveStop(index)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddStop} className="mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Add Stop</button>
            </div>
          </>
        )}
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