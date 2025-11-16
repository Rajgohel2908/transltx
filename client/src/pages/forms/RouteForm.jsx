import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../utils/api.js";
import { debounce } from 'lodash';

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
  const [stops, setStops] = useState([]);
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [price, setPrice] = useState({ default: "" });
  
  // --- STATE MODIFIED ---
  const [totalSeats, setTotalSeats] = useState({ default: 40 });
  // --------------------------

  const [scheduleType, setScheduleType] = useState("daily");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [specificDate, setSpecificDate] = useState('');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
      // --- SET SEATS (MODIFIED) ---
      if (typeof editingRoute.totalSeats === 'object' && editingRoute.totalSeats !== null) {
        setTotalSeats(editingRoute.totalSeats);
      } else {
        setTotalSeats({ default: editingRoute.totalSeats || 40 });
      }
      // ----------------
      const normalized = (editingRoute.stops || []).map(s => ({
        stopName: s.stopName || s.name || '',
        priceFromStart: s.priceFromStart || 0,
        estimatedTimeAtStop: s.estimatedTimeAtStop || ''
      }));
      setStops(normalized);
      setFlightNumber(editingRoute.flightNumber || "");
      setAirline(editingRoute.airline || "");
      if (typeof editingRoute.price === 'object' && editingRoute.price !== null) {
        setPrice(editingRoute.price);
      } else {
        setPrice({ default: editingRoute.price || "" });
      }
      setScheduleType(editingRoute.scheduleType || (editingRoute.type === 'air' ? 'specific_date' : 'daily'));
      setDaysOfWeek(editingRoute.daysOfWeek || []);
      setSpecificDate(editingRoute.specificDate ? new Date(editingRoute.specificDate).toISOString().split('T')[0] : '');
      setAmenitiesInput(Array.isArray(editingRoute.amenities) ? editingRoute.amenities.join(', ') : (editingRoute.amenities || ''));
    } else {
      setId("");
      setName("");
      setStartPoint("");
      setEndPoint("");
      setOperator('');
      setEstimatedArrivalTime('12:00');
      setStartTime("06:00");
      setStops([]);
      setFlightNumber("");
      setAirline("");
      setPrice({ default: "" });
      // --- RESET SEATS (MODIFIED) ---
      setTotalSeats({ default: 40 }); 
      // ----------------
      setDaysOfWeek([]);
      setSpecificDate('');
      setAmenitiesInput('');
      setType("bus");
      setScheduleType('daily');
    }
  }, [editingRoute]);

  useEffect(() => {
    setPrice({ default: "" });
    if (type === 'air') {
      setScheduleType('specific_date');
      // --- MODIFIED ---
      setTotalSeats({ Economy: 150, Business: 20 });
    } else if (type === 'train') {
      // --- MODIFIED ---
      setTotalSeats({ Sleeper: 300, AC: 200, "First Class": 100 });
      if (scheduleType === 'specific_date') setScheduleType('daily');
    } else {
      // --- MODIFIED ---
      setTotalSeats({ default: 40 });
      if (scheduleType === 'specific_date') setScheduleType('daily');
    }
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (type !== 'air' && scheduleType === 'weekly' && daysOfWeek.length === 0) {
      setError("Please select at least one day for a weekly schedule.");
      return;
    }

    try {
      let finalPrice;
      if (type === 'bus') {
        finalPrice = parseFloat(price.default) || 0;
      } else {
        finalPrice = {};
        for (const key in price) {
          if (price[key]) {
            finalPrice[key] = parseFloat(price[key]);
          }
        }
      }
      
      // --- LOGIC FOR finalSeats (NEW) ---
      let finalSeats;
      if (type === 'bus') {
        finalSeats = { default: Number(totalSeats.default) || 40 };
      } else {
        finalSeats = {};
        for (const key in totalSeats) {
          if (totalSeats[key]) {
            finalSeats[key] = Number(totalSeats[key]);
          }
        }
      }
      // ---------------------------------

      let routeData = {
        id,
        name,
        type,
        operator,
        amenities: amenitiesInput ? amenitiesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        estimatedArrivalTime: estimatedArrivalTime,
        startPoint,
        endPoint,
        price: finalPrice,
        // --- PASS finalSeats (MODIFIED) ---
        totalSeats: finalSeats,
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

  const handlePriceChange = (key, value) => {
    setPrice(prev => ({ ...prev, [key]: value }));
  };
  
  // --- NEW FUNCTION ---
  const handleSeatsChange = (key, value) => {
    setTotalSeats(prev => ({ ...prev, [key]: value }));
  };
  // ------------------

  const handleAddStop = () => setStops(prev => ([...prev, { stopName: '', priceFromStart: 0, estimatedTimeAtStop: '' }]));
  const handleRemoveStop = (index) => setStops(prev => prev.filter((_, i) => i !== index));

  const searchHandler = (value, searchType, setSuggestions, setLoading) => {
    // --- (FIX) Prevent API call on empty search ---
    if (!value || value.trim() === '') {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    api.get(`/locations?search=${value}&type=${searchType.toLowerCase()}`)
      .then(res => setSuggestions(res.data || []))
      .catch(err => { console.error(err); setSuggestions([]); })
      .finally(() => setLoading(false));
  };

  const debouncedSearch = useMemo(() => debounce(searchHandler, 300), []);

  const handleStartPointChange = (e) => {
    const value = e.target.value;
    setStartPoint(value);
    setLoadingSuggestions(true);
    debouncedSearch(value, type, setStartSuggestions, setLoadingSuggestions); 
  };

  // --- BUG FIX ---
  const selectStartSuggestion = (cityObj) => { 
    setStartPoint(cityObj.name); 
    setStartSuggestions([]); 
  };
  // -------------

  const handleEndPointChange = (e) => {
    const value = e.target.value;
    setEndPoint(value);
    setLoadingSuggestions(true); 
    debouncedSearch(value, type, setEndSuggestions, setLoadingSuggestions);
  };

  // --- BUG FIX ---
  const selectEndSuggestion = (cityObj) => { 
    setEndPoint(cityObj.name); 
    setEndSuggestions([]); 
  };
  // -------------

  const handleStopChange = (index, field, value) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: field === 'priceFromStart' ? Number(value) : value } : s));
    if (field === 'stopName') {
      setLoadingSuggestions(true);
      debouncedSearch(value, type, (suggestions) => {
        setStopSuggestions(prev => ({ ...prev, [index]: suggestions }));
      }, setLoadingSuggestions);
    }
  };

  // --- BUG FIX ---
  const selectStopSuggestion = (index, cityObj) => {
    handleStopChange(index, 'stopName', cityObj.name);
    setStopSuggestions(prev => ({ ...prev, [index]: [] }));
  };
  // -------------

  const handleDayOfWeekChange = (day) => {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingRoute ? "Edit Route" : "Create New Route"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Route ID (e.g., bus-101)" value={id} onChange={(e) => setId(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Route Name (e.g., Mumbai-Delhi Express)" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        
        {/* --- Price & Seats Section --- */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="font-semibold text-gray-700">Capacity & Pricing</h4>
          </div>
          
          {/* --- TOTAL SEATS INPUT (MODIFIED) --- */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats/Capacity</label>
             {type === 'bus' && (
                 <input type="number" placeholder="Total Seats" value={totalSeats.default || ''} onChange={(e) => handleSeatsChange('default', e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" min="1" />
             )}
             {type === 'train' && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <input type="number" placeholder="Sleeper Seats" value={totalSeats.Sleeper || ''} onChange={(e) => handleSeatsChange('Sleeper', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                 <input type="number" placeholder="AC Seats" value={totalSeats.AC || ''} onChange={(e) => handleSeatsChange('AC', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                 <input type="number" placeholder="First Class Seats" value={totalSeats['First Class'] || ''} onChange={(e) => handleSeatsChange('First Class', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                 </div>
             )}
             {type === 'air' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="number" placeholder="Economy Seats" value={totalSeats.Economy || ''} onChange={(e) => handleSeatsChange('Economy', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                 <input type="number" placeholder="Business Seats" value={totalSeats.Business || ''} onChange={(e) => handleSeatsChange('Business', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                 </div>
             )}
          </div>
          {/* --------------------------------- */}

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare</label>
            {type === 'bus' && (
                <input type="number" placeholder="Price (INR)" value={price.default || ''} onChange={(e) => handlePriceChange('default', e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            )}
            {type === 'train' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="number" placeholder="Sleeper Price" value={price.Sleeper || ''} onChange={(e) => handlePriceChange('Sleeper', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="AC Price" value={price.AC || ''} onChange={(e) => handlePriceChange('AC', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="First Class Price" value={price['First Class'] || ''} onChange={(e) => handlePriceChange('First Class', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
            )}
            {type === 'air' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" placeholder="Economy Price" value={price.Economy || ''} onChange={(e) => handlePriceChange('Economy', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                <input type="number" placeholder="Business Price" value={price.Business || ''} onChange={(e) => handlePriceChange('Business', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <input type="text" placeholder={type === 'air' ? "Departure Airport" : "Start Point"} value={startPoint} onChange={handleStartPointChange} required className="w-full p-3 border border-gray-300 rounded-lg" autoComplete="off" />
          {/* --- BUG FIX YAHAN HAI --- */}
          {(loadingSuggestions || startSuggestions.length > 0) && startPoint ? (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {loadingSuggestions ? <li className="p-2 text-gray-500">Loading...</li> : startSuggestions.map(cityObj => (
                  <li key={cityObj.name} onClick={() => selectStartSuggestion(cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                    {cityObj.name}
                    <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                  </li>
              ))}
            </ul>
          ) : null}
        </div>
        
        <div className="relative">
          <input type="text" placeholder={type === 'air' ? "Arrival Airport" : "End Point"} value={endPoint} onChange={handleEndPointChange} required className="w-full p-3 border border-gray-300 rounded-lg" autoComplete="off" />
          {/* --- BUG FIX YAHAN HAI --- */}
          {(loadingSuggestions || endSuggestions.length > 0) && endPoint ? (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {loadingSuggestions ? <li className="p-2 text-gray-500">Loading...</li> : endSuggestions.map(cityObj => (
                  <li key={cityObj.name} onClick={() => selectEndSuggestion(cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                    {cityObj.name}
                    <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                  </li>
              ))}
            </ul>
          ) : null}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="air">Air</option>
          </select>
        </div>
        <input type="text" placeholder="Operator" value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        
        {/* Schedule logic handles dates/times */}
        {type === 'air' ? (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Flight Number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Airline" value={airline} onChange={(e) => setAirline(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" min={todayString} />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
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
                  <input type="time" placeholder="ETA" value={estimatedArrivalTime} onChange={(e) => setEstimatedArrivalTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
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
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" min={todayString} />
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intermediate Stops</label>
              {stops.map((stop, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="relative md:col-span-2">
                    <input type="text" placeholder={`Stop ${index + 1} Name`} value={stop.stopName} onChange={(e) => handleStopChange(index, 'stopName', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" autoComplete="off" />
                    {/* --- BUG FIX YAHAN HAI --- */}
                    {(loadingSuggestions || stopSuggestions[index]?.length > 0) && stop.stopName ? (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {loadingSuggestions ? <li className="p-2 text-gray-500">Loading...</li> : stopSuggestions[index]?.map(cityObj => (
                            <li key={cityObj.name} onClick={() => selectStopSuggestion(index, cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                              {cityObj.name}
                              <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                            </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <input type="number" placeholder="Price (INR)" value={stop.priceFromStart} onChange={(e) => handleStopChange(index, 'priceFromStart', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                  <div className="flex items-center gap-2">
                    <input type="time" placeholder="Est. Time" value={stop.estimatedTimeAtStop} onChange={(e) => handleStopChange(index, 'estimatedTimeAtStop', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                    <button type="button" onClick={() => handleRemoveStop(index)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">X</button>
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