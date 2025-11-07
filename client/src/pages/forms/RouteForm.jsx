import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../utils/api.js";
import { debounce } from 'lodash'; // <-- Import barabar hai

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const ROUTES_API_URL = `${VITE_BACKEND_BASE_URL}/routes`;

const RouteForm = ({ onRouteSaved, editingRoute, setEditingRoute }) => {
  // ... (sare 'useState' hooks same rahenge)
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
  // --- PRICE STATE IS NOW AN OBJECT ---
  const [price, setPrice] = useState({ default: "" });
  // Example for train: { "Sleeper": 500, "AC": 1500 }
  // Example for bus: { "default": 700 }
  const [scheduleType, setScheduleType] = useState("daily");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [specificDate, setSpecificDate] = useState('');
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // <-- Ye hamara 'single' loading state hai

  // ... (getTodayString aur useEffect same rahenge)
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayString = getTodayString();

  useEffect(() => {
    if (editingRoute) { // This block runs when you click "Edit" on a route
      setId(editingRoute.id);
      setName(editingRoute.name);
      setType(editingRoute.type);
      setOperator(editingRoute.operator || '');
      setEstimatedArrivalTime(editingRoute.estimatedArrivalTime || '12:00');
      setStartTime(editingRoute.startTime || "06:00");
      setStartPoint(editingRoute.startPoint || "");
      setEndPoint(editingRoute.endPoint || "");
      const existingStops = editingRoute.stops || [];
      const normalized = existingStops.map(s => {
        if (typeof s === 'string') return { stopName: s, priceFromStart: 0, estimatedTimeAtStop: '' };
        return { stopName: s.stopName || s.name || '', priceFromStart: s.priceFromStart || 0, estimatedTimeAtStop: s.estimatedTimeAtStop || '' };
      });
      setStops(normalized);
      setFlightNumber(editingRoute.flightNumber || "");
      setAirline(editingRoute.airline || "");
      // --- PRICE LOGIC UPDATE ---
      if (typeof editingRoute.price === 'object' && editingRoute.price !== null) {
        setPrice(editingRoute.price);
      } else {
        // Handle old data or bus data
        setPrice({ default: editingRoute.price || "" });
      }
      // --- END ---
      setScheduleType(editingRoute.scheduleType || (editingRoute.type === 'air' ? 'specific_date' : 'daily'));
      setDaysOfWeek(editingRoute.daysOfWeek || []);
      setSpecificDate(editingRoute.specificDate ? new Date(editingRoute.specificDate).toISOString().split('T')[0] : '');
      setAmenitiesInput(Array.isArray(editingRoute.amenities) ? editingRoute.amenities.join(', ') : (editingRoute.amenities || ''));
    } else { // This block runs for a new form or when "Cancel" is clicked
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
      setPrice({ default: "" }); // Reset price state
      setDaysOfWeek([]);
      setSpecificDate('');
      setAmenitiesInput('');
      // Reset type and its dependent fields only when editingRoute changes to null
      setType("bus");
      setScheduleType('daily');
    }
  }, [editingRoute]);

  // Separate useEffect to handle logic when 'type' changes
  useEffect(() => {
    // Reset price structure when type changes
    setPrice({ default: "" });
    // Flights are always on a specific date
    if (type === 'air') {
      setScheduleType('specific_date');
    } else {
      // Reset to daily if switching away from air
      if (scheduleType === 'specific_date') {
        setScheduleType('daily');
      }
    }
  }, [type]);

  // ... (handleSubmit, handleAddStop, handleRemoveStop same rahenge)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (type !== 'air' && scheduleType === 'weekly' && daysOfWeek.length === 0) {
      setError("Please select at least one day for a weekly schedule.");
      return;
    }

    try {
      // --- PRICE LOGIC UPDATE ---
      let finalPrice;
      if (type === 'bus') {
        finalPrice = parseFloat(price.default) || 0;
      } else {
        finalPrice = {};
        for (const key in price) {
          if (price[key]) { // Ensure value is not empty
            finalPrice[key] = parseFloat(price[key]);
          }
        }
      }

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

  // --- NEW HELPER FOR PRICE INPUTS ---
  const handlePriceChange = (key, value) => {
    setPrice(prev => ({ ...prev, [key]: value }));
  };

  // --- END NEW HELPER ---

  const handleAddStop = () => {
    setStops(prev => ([...prev, { stopName: '', priceFromStart: 0, estimatedTimeAtStop: '' }]));
  };

  const handleRemoveStop = (index) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };
  
  // --- YEH HAI ASLI FIX ---
  // Is function me 3 parameters hain: value, setSuggestions, setLoading
  const searchHandler = (value, setSuggestions, setLoading) => {
    if (value) {
      // Admin form hamesha sab search karega (type=... nahi bhejenge)
      api.get(`/api/locations?search=${value}`)
        .then(res => {
          setSuggestions(res.data || []);
        })
        .catch(err => {
          console.error("Failed to fetch suggestions:", err);
          setSuggestions([]);
        })
        .finally(() => {
          setLoading(false); // <-- YEH LOADING KO 'FALSE' KAREGA
        });
    } else {
      setSuggestions([]);
      setLoading(false); // <-- YEH BHI LOADING KO 'FALSE' KAREGA (jab input clear ho)
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(searchHandler, 300),
    []
  );

  const handleStartPointChange = (e) => {
    const value = e.target.value;
    setStartPoint(value);
    setLoadingSuggestions(true); // <-- Loading 'true' set kiya
    // Aur 'setLoadingSuggestions' ko as a parameter pass kiya
    debouncedSearch(value, setStartSuggestions, setLoadingSuggestions); 
  };

  const selectStartSuggestion = (city) => {
    setStartPoint(city);
    setStartSuggestions([]);
  };

  const handleEndPointChange = (e) => {
    const value = e.target.value;
    setEndPoint(value);
    setLoadingSuggestions(true); // <-- Loading 'true' set kiya
    debouncedSearch(value, setEndSuggestions, setLoadingSuggestions);
  };

  const selectEndSuggestion = (city) => {
    setEndPoint(city);
    setEndSuggestions([]);
  };

  const handleStopChange = (index, field, value) => {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: field === 'priceFromStart' ? Number(value) : value } : s));
    
    if (field === 'stopName') {
      setLoadingSuggestions(true); // <-- Loading 'true' set kiya
      debouncedSearch(value, (suggestions) => {
        // Stop ka 'setter' function thoda alag hai
        setStopSuggestions(prev => ({ ...prev, [index]: suggestions }));
      }, setLoadingSuggestions);
    }
  };

  const selectStopSuggestion = (index, city) => {
    handleStopChange(index, 'stopName', city);
    setStopSuggestions(prev => ({ ...prev, [index]: [] }));
  };
  // --- FIX KHATAM ---

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
        {/* ... (input fields same rahenge) ... */}
        <input type="text" placeholder="Route ID (e.g., bus-101)" value={id} onChange={(e) => setId(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Route Name (e.g., Mumbai-Delhi Express, AC Sleeper)" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        
        {/* --- DYNAMIC PRICE INPUTS --- */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <h4 className="font-semibold text-gray-700">Pricing</h4>
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
        {/* --- END DYNAMIC PRICE --- */}
        
        {/* --- Start Point (Patched JSX) --- */}
        <div className="relative">
          <input type="text" placeholder={type === 'air' ? "Departure Airport" : "Start Point"} value={startPoint} onChange={handleStartPointChange} required className="w-full p-3 border border-gray-300 rounded-lg" autoComplete="off" />
          {/* JSX logic update kar diya (ab 'loadingSuggestions' use karega) */}
          {(loadingSuggestions || startSuggestions.length > 0) && startPoint ? (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {loadingSuggestions ? <li className="p-2 text-gray-500">Loading...</li> : 
                startSuggestions.length > 0 ? (
                  startSuggestions.map(city => (
                    <li key={city} onClick={() => selectStartSuggestion(city)} className="p-2 hover:bg-gray-100 cursor-pointer">
                      {city}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No results</li>
                )
              }
            </ul>
          ) : null}
        </div>
        
        {/* --- End Point (Patched JSX) --- */}
        <div className="relative">
          <input type="text" placeholder={type === 'air' ? "Arrival Airport" : "End Point"} value={endPoint} onChange={handleEndPointChange} required className="w-full p-3 border border-gray-300 rounded-lg" autoComplete="off" />
          {(loadingSuggestions || endSuggestions.length > 0) && endPoint ? (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {loadingSuggestions ? <li className="p-2 text-gray-500">Loading...</li> : 
                endSuggestions.length > 0 ? (
                  endSuggestions.map(city => (
                    <li key={city} onClick={() => selectEndSuggestion(city)} className="p-2 hover:bg-gray-100 cursor-pointer">
                      {city}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No results</li>
                )
              }
            </ul>
          ) : null}
        </div>
        
        {/* ... (Baaki poora form same rahega) ... */}
        <div className="grid grid-cols-2 gap-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="air">Air</option>
          </select>
        </div>
        <input type="text" placeholder="Operator (e.g., RedBus)" value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
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
                  <div className="relative md:col-span-2">
                    <input type="text" placeholder={`Stop ${index + 1} Name`} value={stop.stopName} onChange={(e) => handleStopChange(index, 'stopName', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" autoComplete="off" />
                    {(loadingSuggestions || stopSuggestions[index]?.length > 0) && stop.stopName ? (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {loadingSuggestions ? <li className="p-2 text-gray-500">Loading...</li> : 
                          stopSuggestions[index]?.length > 0 ? (
                            stopSuggestions[index].map(city => (
                              <li key={city} onClick={() => selectStopSuggestion(index, city)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                {city}
                              </li>
                            ))
                          ) : (
                            <li className="p-2 text-gray-500">No results</li>
                          )
                        }
                      </ul>
                    ) : null}
                  </div>
                  <input type="number" placeholder="Price From Start (INR)" value={stop.priceFromStart} onChange={(e) => handleStopChange(index, 'priceFromStart', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
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