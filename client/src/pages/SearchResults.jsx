import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Filter, Plane, Bus, Train, ChevronDown, Wind, Wifi, Utensils, Users, Calendar } from 'lucide-react'; // <-- Calendar icon add kiya
import Footer from '../components/Footer';
import axios from 'axios';

// --- NAYA COMPONENT (FEATURE REQUEST) ---
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
      activeDays.add(date.getUTCDay()); // Use getUTCDay for consistency
    } catch (e) {
      console.error("Invalid specificDate for ScheduleDisplay", e);
    }
  }

  if (activeDays.size === 0 && scheduleType !== 'specific_date') {
    // Hide if no schedule info
    return null;
  }
  
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
// --- END NAYA COMPONENT ---


const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  
  const { searchType, from, to, departureDate, class: classType } = location.state || {};

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
        
        setResults(response.data || []);
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
      price: priceToShow, // Override price with the selected class price
    };

    navigate(`/booking/${mode}/passenger-details`, { state: { selectedTicket: ticketToBook, searchType: mode } });
  };

  const classTypeToPriceKey = {
    // Train
    "Sleeper": "Sleeper",
    "AC 3 Tier": "AC",
    "AC 2 Tier": "AC",
    "First Class": "First Class",
    "AC Chair car": "AC",
    // Air
    "Economy": "Economy",
    "Business": "Business",
    // Default
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
    
    const seatsData = result.totalSeats;
    let seatsLabel = 'Total Seats';

    if (typeof seatsData === 'number') { 
      seats = seatsData;
    } else if (typeof seatsData === 'object' && seatsData !== null) {
      if (isBus && seatsData.default) {
        seats = seatsData.default;
        seatsLabel = 'Total Seats';
      } else if (seatsData[mappedKey]) { 
        seats = seatsData[mappedKey];
        seatsLabel = `${classType} Seats`; 
      } else if (seatsData.default) { 
        seats = seatsData.default;
        seatsLabel = 'Total Seats';
      } else if (!isBus) {
        seats = Object.values(seatsData).reduce((acc, val) => acc + (Number(val) || 0), 0);
        seatsLabel = 'Total Seats';
      } else {
        seats = 'N/A';
      }
    }

    return {
      priceToShow: price,
      seatsToShow: seats,
      seatsLabel: seatsLabel
    };
  };


  const ResultCard = ({ result }) => {
    const isExpanded = expandedCard === result._id;
    const { priceToShow, seatsToShow, seatsLabel } = getDisplayData(result, classType);

    return (
      <div className="bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
        
        {/* --- YEH HAI NAYI LOCATION --- */}
        <div className="pt-4 px-6 flex justify-center">
          <ScheduleDisplay 
            scheduleType={result.scheduleType}
            daysOfWeek={result.daysOfWeek}
            specificDate={result.specificDate}
          />
        </div>
        {/* --- END NAYI LOCATION --- */}
        
        {/* --- Padding change: p-6 se px-6 pb-6 pt-4 --- */}
        <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row items-start justify-between gap-6">
          
          {/* Left Column */}
          <div className="flex items-start gap-4 w-full sm:w-1/4">
            <div className="h-12 w-12 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: result.color || '#3B82F6' }}>
              {result.type === 'air' && <Plane className="text-white" />}
              {result.type === 'bus' && <Bus className="text-white" />}
              {result.type === 'train' && <Train className="text-white" />}
            </div>
            <div className="flex flex-col gap-1"> {/* Gap kam kiya */}
              <p className="font-bold text-lg">{result.airline || result.name}</p>
              <p className="text-sm text-gray-500">{result.flightNumber || result.id}</p>
              {/* --- ScheduleDisplay yahan se HATA diya --- */}
            </div>
          </div>
          
          {/* Middle Column */}
          <div className="flex items-center justify-between w-full sm:w-2/4">
            <div className="text-center">
              <p className="text-xl font-semibold">{result.startTime || 'N/A'}</p>
              <p className="text-gray-600">{result.startPoint || 'Source'}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-sm text-gray-500">{result.duration || ''}</p>
              <div className="w-full h-px bg-gray-200 my-1 relative">
                <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 bg-white px-1" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{result.estimatedArrivalTime || 'N/A'}</p>
              <p className="text-gray-600">{result.endPoint || 'Destination'}</p>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto sm:w-1/4">
            <p className="text-2xl font-bold text-gray-800">{priceToShow !== 'N/A' ? `₹${Number(priceToShow).toLocaleString()}` : 'Fare N/A'}</p>
            <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <Users size={14} />
              {seatsToShow !== 'N/A' ? `${seatsToShow} ${seatsLabel}` : 'Seats N/A'}
            </p>
            <button onClick={() => handleBookNow(result)} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
              Book Now
            </button>
          </div>
        </div>

        {/* Details Toggle */}
        <div className="border-t border-gray-200 px-6 py-2 flex justify-end">
          <button onClick={() => setExpandedCard(isExpanded ? null : result._id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View Details <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={16} />
          </button>
        </div>
        
        {/* Expanded View */}
        {isExpanded && (
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
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Filter size={20} /> Filters</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="500" max="10000" className="w-full" />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>₹500</span>
          <span>₹10,000</span>
        </div>
      </div>

      {searchType === 'Air' && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Stops</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Non-Stop</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> 1 Stop</label>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold mb-2">Departure Time</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Morning</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Afternoon</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Evening</label>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">{searchType === 'Air' ? 'Airlines' : 'Operators'}</h4>
        <div className="space-y-2">
          {(() => {
            const ops = new Set((results || []).map(r => (r.operator || r.airline || r.name || '').trim()).filter(Boolean));
            if (ops.size === 0) return <div className="text-gray-500">No operators available</div>;
            return Array.from(ops).map((op) => (
              <label key={op} className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> {op}</label>
            ));
          })()}
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div> {/* Placeholder for schedule */}
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
                results.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">No routes found for your search</h3>
                    <p className="text-gray-500">Please try a different route or date.</p>
                  </div>
                ) : (
                  results.map(result => <ResultCard key={result._id} result={result} />)
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