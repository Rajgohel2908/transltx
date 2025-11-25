import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Filter, Plane, Bus, Train, ChevronDown, Wind, Wifi, Utensils, Users, Calendar } from 'lucide-react'; 
import Footer from '../components/Footer';
import axios from 'axios';

// --- Helper for Schedule ---
const ScheduleDisplay = ({ scheduleType, daysOfWeek = [], specificDate }) => {
  const weekInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayStringMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  let activeDays = new Set();
  if (scheduleType === 'daily') {
    activeDays = new Set([0, 1, 2, 3, 4, 5, 6]);
  } else if (scheduleType === 'weekly' && Array.isArray(daysOfWeek)) {
    daysOfWeek.forEach(dayStr => {
      if (dayStringMap.hasOwnProperty(dayStr)) {
        activeDays.add(dayStringMap[dayStr]);
      }
    });
  } else if (scheduleType === 'specific_date' && specificDate) {
    try {
      const date = new Date(specificDate);
      activeDays.add(date.getUTCDay());
    } catch (e) { console.error("Invalid specificDate", e); }
  }
  if (activeDays.size === 0 && scheduleType !== 'specific_date') return null;
  if (scheduleType === 'specific_date' && activeDays.size === 0) {
     return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={14} />
            <span>Runs on: {new Date(specificDate).toLocaleDateString()}</span>
        </div>
     );
  }
  return (
    <div className="flex space-x-1.5" aria-label="Weekly schedule">
      {weekInitials.map((initial, index) => (
        <span 
          key={index} 
          className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${activeDays.has(index) ? 'font-bold bg-blue-100 text-blue-700' : 'font-light text-gray-400'}`}
        >
          {initial}
        </span>
      ))}
    </div>
  );
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  
  const { searchType, from, to, departureDate, class: classType } = location.state || {};

  // --- 1. Filter State ---
  const [filters, setFilters] = useState({
    maxPrice: 10000,
    stops: [],
    times: [],
    operators: []
  });

  // Helper to determine max price from current results for the slider range
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    setLoading(true);
    const fetchResults = async () => {
      try {
        const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
        const params = new URLSearchParams();
        if (searchType) params.append('type', searchType);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (departureDate) params.append('date', departureDate);
        if (classType && classType !== 'All Classes') params.append('class', classType);

        const response = await axios.get(`${VITE_BACKEND_BASE_URL}/routes/search?${params.toString()}`);
        
        const fetchedData = response.data || [];
        setResults(fetchedData);

        // Calculate Price Bounds for Filters
        if (fetchedData.length > 0) {
            const prices = fetchedData.map(r => {
                const { priceToShow } = getDisplayData(r, classType);
                return Number(priceToShow) || 0;
            }).filter(p => p > 0);
            
            if (prices.length > 0) {
                const max = Math.max(...prices);
                const min = Math.min(...prices);
                setPriceBounds({ min, max });
                setFilters(prev => ({ ...prev, maxPrice: max }));
            }
        }

      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    if (searchType && from && to && departureDate) {
      fetchResults();
    } else {
      console.warn("Search terms missing, not fetching results.");
      setLoading(false);
    }
  }, [searchType, from, to, departureDate, classType]);


  const handleBookNow = (result) => {
    const { priceToShow } = getDisplayData(result, classType);
    
    const ticketToBook = {
      ...result,
      price: priceToShow, 
    };

    navigate(`/booking/${mode}/passenger-details`, { 
      state: { 
        selectedTicket: ticketToBook, 
        searchType: mode,
        departureDate: departureDate, 
        classType: classType || 'default'
      } 
    });
  };

  const classTypeToPriceKey = {
    "Sleeper": "Sleeper",
    "AC 3 Tier": "AC",
    "AC 2 Tier": "AC",
    "First Class": "First Class",
    "AC Chair car": "AC",
    "Economy": "Economy",
    "Business": "Business",
    "default": "default"
  };

  const getDisplayData = (result, classType) => {
    const isBus = result.type === 'bus';
    let price = 'N/A';
    let seats = 'N/A';
    
    const mappedKey = classTypeToPriceKey[classType] || 'default';

    if (typeof result.price === 'number') {
      price = result.price; 
    } else if (typeof result.price === 'object' && result.price !== null) {
      if (result.price[mappedKey]) {
        price = result.price[mappedKey];
      }
      else if (price === 'N/A' && result.price.default) {
        price = result.price.default;
      }
      else if (price === 'N/A') {
        const firstKey = Object.keys(result.price)[0];
        price = result.price[firstKey] || 'N/A';
      }
    }
    
    const seatsData = result.availableSeats || result.totalSeats;
    let seatsLabel = 'Total Seats';

    if (typeof seatsData === 'number') { 
      seats = seatsData;
    } else if (typeof seatsData === 'object' && seatsData !== null) {
      if (isBus && seatsData.default) {
        seats = seatsData.default;
        seatsLabel = 'Available Seats';
      } else if (seatsData[mappedKey]) { 
        seats = seatsData[mappedKey];
        seatsLabel = `${classType} Seats`; 
      } else if (seatsData.default) { 
        seats = seatsData.default;
        seatsLabel = 'Available Seats';
      } else if (!isBus) {
        seats = Object.values(seatsData).reduce((acc, val) => acc + (Number(val) || 0), 0);
        seatsLabel = 'Total Seats';
      } else {
        seats = 'N/A';
      }
    }
    
    if (Number(seats) <= 0) seats = 'N/A';

    return {
      priceToShow: price,
      seatsToShow: seats,
      seatsLabel: seatsLabel
    };
  };

  // --- 2. Filter Logic ---
  const getFilteredResults = () => {
    return results.filter(result => {
        const { priceToShow } = getDisplayData(result, classType);
        const price = Number(priceToShow) || 0;

        // Price Filter
        if (price > filters.maxPrice) return false;

        // Operator Filter
        const opName = (result.operator || result.airline || result.name || '').trim();
        if (filters.operators.length > 0 && !filters.operators.includes(opName)) return false;

        // Stops Filter (Air only usually, but logic is generic)
        if (filters.stops.length > 0) {
            const stopCount = (result.stops || []).length;
            const isNonStop = stopCount === 0;
            const isOneStop = stopCount === 1;
            
            let matchStop = false;
            if (filters.stops.includes('Non-Stop') && isNonStop) matchStop = true;
            if (filters.stops.includes('1 Stop') && isOneStop) matchStop = true;
            // Add logic for 2+ stops if needed
            
            if (!matchStop) return false;
        }

        // Time Filter
        if (filters.times.length > 0) {
            // Parse start time "HH:MM AM/PM" or "HH:MM"
            const timeStr = result.startTime; 
            if (timeStr) {
                let hour = parseInt(timeStr.split(':')[0]);
                const isPM = timeStr.toLowerCase().includes('pm');
                if (isPM && hour !== 12) hour += 12;
                if (!isPM && hour === 12) hour = 0; // Midnight

                let timeOfDay = '';
                if (hour >= 6 && hour < 12) timeOfDay = 'Morning';
                else if (hour >= 12 && hour < 18) timeOfDay = 'Afternoon';
                else if (hour >= 18) timeOfDay = 'Evening';
                else timeOfDay = 'Night'; // Assuming Night for others

                if (!filters.times.includes(timeOfDay)) return false;
            }
        }

        return true;
    });
  };

  const filteredResults = getFilteredResults();

  // --- 3. Filter Panel Handlers ---
  const handleOperatorChange = (op) => {
    setFilters(prev => {
        const newOps = prev.operators.includes(op) 
            ? prev.operators.filter(o => o !== op)
            : [...prev.operators, op];
        return { ...prev, operators: newOps };
    });
  };

  const handleTimeChange = (time) => {
    setFilters(prev => {
        const newTimes = prev.times.includes(time) 
            ? prev.times.filter(t => t !== time)
            : [...prev.times, time];
        return { ...prev, times: newTimes };
    });
  };

  const handleStopChange = (stopType) => {
    setFilters(prev => {
        const newStops = prev.stops.includes(stopType)
            ? prev.stops.filter(s => s !== stopType)
            : [...prev.stops, stopType];
        return { ...prev, stops: newStops };
    });
  };


  const ResultCard = ({ result }) => {
    const isExpanded = expandedCard === result._id;
    const { priceToShow, seatsToShow, seatsLabel } = getDisplayData(result, classType);

    // Helper function to render card content
    const renderCardContent = (disabled = false) => (
      <div className={`bg-white rounded-xl shadow-md transition-shadow ${disabled ? 'opacity-50' : 'hover:shadow-lg'}`}>
        <div className="pt-4 px-6 flex justify-center">
          <ScheduleDisplay 
            scheduleType={result.scheduleType}
            daysOfWeek={result.daysOfWeek}
            specificDate={result.specificDate}
          />
        </div>
        
        <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4 w-full sm:w-1/4">
            <div className={`h-12 w-12 rounded-md flex items-center justify-center flex-shrink-0 ${disabled ? 'bg-gray-200' : ''}`} style={!disabled ? { backgroundColor: result.color || '#3B82F6' } : {}}>
              {result.type === 'air' && <Plane className={disabled ? "text-gray-500" : "text-white"} />}
              {result.type === 'bus' && <Bus className={disabled ? "text-gray-500" : "text-white"} />}
              {result.type === 'train' && <Train className={disabled ? "text-gray-500" : "text-white"} />}
            </div>
            <div className="flex flex-col gap-1">
              <p className={`font-bold text-lg ${disabled ? "text-gray-500" : ""}`}>{result.airline || result.name}</p>
              <p className={`text-sm ${disabled ? "text-gray-400" : "text-gray-500"}`}>{result.flightNumber || result.id}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-2/4">
            <div className="text-center">
              <p className={`text-xl font-semibold ${disabled ? "text-gray-400" : ""}`}>{result.startTime || 'N/A'}</p>
              <p className={`${disabled ? "text-gray-500" : "text-gray-600"}`}>{result.startPoint || 'Source'}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-sm text-gray-500">{result.duration || ''}</p>
              <div className="w-full h-px bg-gray-200 my-1 relative">
                {!disabled && <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 bg-white px-1" />}
              </div>
            </div>
            <div className="text-center">
              <p className={`text-xl font-semibold ${disabled ? "text-gray-400" : ""}`}>{result.estimatedArrivalTime || 'N/A'}</p>
              <p className={`${disabled ? "text-gray-500" : "text-gray-600"}`}>{result.endPoint || 'Destination'}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto sm:w-1/4">
            <p className={`text-2xl font-bold ${disabled ? "text-gray-500" : "text-gray-800"}`}>{priceToShow !== 'N/A' ? `₹${Number(priceToShow).toLocaleString()}` : 'Fare N/A'}</p>
            <p className={`text-sm font-semibold flex items-center gap-1 ${disabled ? "text-red-500" : "text-green-600"}`}>
              <Users size={14} />
              {disabled ? 'Not Available' : (seatsToShow !== 'N/A' ? `${seatsToShow} ${seatsLabel}` : 'Seats N/A')}
            </p>
            <button 
                onClick={() => !disabled && handleBookNow(result)} 
                disabled={disabled}
                className={`${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} font-semibold py-2 px-6 rounded-lg transition-colors w-full sm:w-auto`}
            >
              Book Now
            </button>
          </div>
        </div>

        {!disabled && (
            <div className="border-t border-gray-200 px-6 py-2 flex justify-end">
            <button onClick={() => setExpandedCard(isExpanded ? null : result._id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View Details <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={16} />
            </button>
            </div>
        )}
        
        {isExpanded && !disabled && (
          <div className="border-t bg-gray-50 p-6">
            <h4 className="font-bold mb-2">Details & Amenities</h4>
            <div className="flex flex-col gap-4 text-sm text-gray-700">
              <div className="flex flex-wrap gap-4">
                {(result.amenities || []).length > 0 ? (
                  result.amenities.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2"><Wind size={16} className="text-blue-500" /> {a}</div>
                  ))
                ) : (
                  <div className="text-gray-500">No amenities listed.</div>
                )}
              </div>
              <div>
                <h5 className="font-semibold">Stops for this journey:</h5>
                {Array.isArray(result.stops) && result.stops.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {result.stops.map((s, i) => (
                      <li key={i}>{s.stopName || s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No intermediate stops.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return renderCardContent(seatsToShow === 'N/A');
  };

  // --- FILTER PANEL (Fixed Logic) ---
  const FilterPanel = () => (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Filter size={20} /> Filters</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input 
            type="range" 
            min={priceBounds.min} 
            max={priceBounds.max} 
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({...prev, maxPrice: Number(e.target.value)}))}
            className="w-full accent-blue-600" 
        />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>₹{priceBounds.min}</span>
          <span className="font-bold text-blue-600">Up to ₹{filters.maxPrice}</span>
          <span>₹{priceBounds.max}</span>
        </div>
      </div>

      {/* Only show stops for Air or generic */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Stops</h4>
        <div className="space-y-2">
        <label className="flex items-center gap-2">
            <input 
                type="checkbox" 
                className="form-checkbox rounded text-blue-600" 
                checked={filters.stops.includes('Non-Stop')}
                onChange={() => handleStopChange('Non-Stop')}
            /> Non-Stop
        </label>
        <label className="flex items-center gap-2">
            <input 
                type="checkbox" 
                className="form-checkbox rounded text-blue-600" 
                checked={filters.stops.includes('1 Stop')}
                onChange={() => handleStopChange('1 Stop')}
            /> 1 Stop
        </label>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Departure Time</h4>
        <div className="space-y-2">
          {['Morning', 'Afternoon', 'Evening'].map(time => (
              <label key={time} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="form-checkbox rounded text-blue-600" 
                    checked={filters.times.includes(time)}
                    onChange={() => handleTimeChange(time)}
                  /> {time}
              </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">{searchType === 'Air' ? 'Airlines' : 'Operators'}</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(() => {
            // Dynamic operators list from ALL results
            const ops = new Set((results || []).map(r => (r.operator || r.airline || r.name || '').trim()).filter(Boolean));
            if (ops.size === 0) return <div className="text-gray-500 text-sm">No operators available</div>;
            return Array.from(ops).map((op) => (
              <label key={op} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="form-checkbox rounded text-blue-600" 
                    checked={filters.operators.includes(op)}
                    onChange={() => handleOperatorChange(op)}
                  /> {op}
              </label>
            ));
          })()}
        </div>
      </div>
    </div>
  );
  // --- END FILTER PANEL ---

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-1/3">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full sm:w-1/3">
          <div className="text-center space-y-2">
            <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-10"></div>
          <div className="text-center space-y-2">
            <div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex items-center gap-4">
            {mode === 'air' && <Plane size={32} className="text-blue-600" />}
            {mode === 'bus' && <Bus size={32} className="text-blue-600" />}
            {mode === 'train' && <Train size={32} className="text-blue-600" />}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{from || 'All'} to {to || 'All'}</h2>
              <p className="text-gray-600">{departureDate || new Date().toLocaleDateString()} | 1 Adult | {classType || 'Any Class'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <FilterPanel />
            </div>

            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <>
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                </>
              ) : (
                filteredResults.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">No routes found matching your filters</h3>
                    <p className="text-gray-500">Try adjusting your filters or search for a different route.</p>
                    <button onClick={() => setFilters({ maxPrice: 10000, stops: [], times: [], operators: [] })} className="mt-4 text-blue-600 font-semibold hover:underline">Reset Filters</button>
                  </div>
                ) : (
                  filteredResults.map(result => <ResultCard key={result._id} result={result} />)
                )
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;