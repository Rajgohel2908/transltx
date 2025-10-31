import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Filter, Plane, Bus, Train, ChevronDown, Wind, Wifi, Utensils } from 'lucide-react';
import Footer from '../components/Footer';
import axios from 'axios';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const { searchType, from, to, departureDate } = location.state || {};

  useEffect(() => {
    setLoading(true);
    const fetchResults = async () => {
      try {
        const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
        // Build query parameters
        const params = new URLSearchParams();
        if (searchType) params.append('type', searchType);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (departureDate) params.append('date', departureDate);

        const response = await axios.get(`${VITE_BACKEND_BASE_URL}/routes/search?${params.toString()}`);
        
        setResults(response.data || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have the necessary search state
    if (searchType && from && to && departureDate) {
      fetchResults();
    } else {
      // Optional: Handle missing search terms, e.g., redirect or show message
      console.warn("Search terms missing, not fetching results.");
      setLoading(false);
    }
  }, [searchType, from, to, departureDate]);

  const handleBookNow = (result) => {
    // The `result` from the DB is now the `selectedTicket`
    navigate(`/booking/${mode}/passenger-details`, { state: { selectedTicket: result, searchType: mode } });
  };

  const ResultCard = ({ result }) => {
    const isExpanded = expandedCard === result._id;

    return (
      <div className="bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full sm:w-1/4">
            <div className="h-12 w-12 rounded-md flex items-center justify-center" style={{ backgroundColor: result.color || '#3B82F6' }}>
              {result.type === 'air' && <Plane className="text-white" />}
              {result.type === 'bus' && <Bus className="text-white" />}
              {result.type === 'train' && <Train className="text-white" />}
            </div>
            <div>
              <p className="font-bold text-lg">{result.airline || result.name}</p>
              <p className="text-sm text-gray-500">{result.flightNumber || result.id}</p>
            </div>
          </div>
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
              <p className="text-xl font-semibold">{result.endTime || 'N/A'}</p>
              <p className="text-gray-600">{result.endPoint || 'Destination'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto sm:w-1/4">
            <p className="text-2xl font-bold text-gray-800">{result.price ? `₹${Number(result.price).toLocaleString()}` : 'Fare N/A'}</p>
            <button onClick={() => handleBookNow(result)} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
              Book Now
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-2 flex justify-end">
          <button onClick={() => setExpandedCard(isExpanded ? null : result._id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View Details <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={16} />
          </button>
        </div>
        {isExpanded && (
          <div className="border-t bg-gray-50 p-6">
            <h4 className="font-bold mb-2">Details & Amenities</h4>
            <div className="flex gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2"><Wind size={16} className="text-blue-500" /> Air Conditioned</div>
              <div className="flex items-center gap-2"><Wifi size={16} className="text-blue-500" /> WiFi Available</div>
              <div className="flex items-center gap-2"><Utensils size={16} className="text-blue-500" /> Meal Included</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Filter size={20} /> Filters</h3>
      
      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="500" max="10000" className="w-full" />
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>₹500</span>
          <span>₹10,000</span>
        </div>
      </div>

      {/* Stops */}
      {searchType === 'Air' && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Stops</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Non-Stop</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> 1 Stop</label>
          </div>
        </div>
      )}

      {/* Departure Time */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Departure Time</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Morning</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Afternoon</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Evening</label>
        </div>
      </div>

      {/* Operators */}
      <div>
        <h4 className="font-semibold mb-2">{searchType === 'Air' ? 'Airlines' : 'Operators'}</h4>
        <div className="space-y-2">
          {searchType === 'Air' && <>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Indigo</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Vistara</label>
          </>}
          {searchType === 'Bus' && <>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> Zing Bus</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> IntrCity</label>
          </>}
          {searchType === 'Train' && <>
            <label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox" /> IRCTC</label>
          </>}
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
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
              <p className="text-gray-600">{departureDate || new Date().toLocaleDateString()} | 1 Adult</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <FilterPanel />
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <>
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                </>
              ) : (
                results.map(result => <ResultCard key={result._id} result={result} />)
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