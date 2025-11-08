import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { Bus, Train, Plane, Users, Calendar, ArrowRight, Minus, Plus, ArrowLeftRight, MapPin, Search } from 'lucide-react';
import { api } from '../utils/api.js';
import { debounce } from 'lodash';

const Booking = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  
  const initialTab = mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : 'Bus';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tripType, setTripType] = useState('one-way');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [pnr, setPnr] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  const [classType, setClassType] = useState(initialTab === 'Train' ? 'Sleeper' : 'Economy'); 
  
  useEffect(() => {
    // Jab bhi tab change ho, URL update kar aur class reset kar
    navigate(`/booking/${activeTab.toLowerCase()}`, { replace: true });
    if (activeTab === 'Train') {
      setClassType('Sleeper');
    } else if (activeTab === 'Air') {
      setClassType('Economy');
    } else {
      setClassType(''); // Bus ke liye koi class nahi
    }
  }, [activeTab, navigate]);
  
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isFromLoading, setIsFromLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayString = getTodayString();
  
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    const updatedBooking = {
      from: e.target.from.value,
      to: e.target.to.value,
    };

    try {
      const response = await api.put(`/api/bookings/${editingBooking._id}`, updatedBooking);
      setFoundBooking(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handlePnrSearch = async () => {
    if (!pnr) return;
    const trimmedPnr = pnr.trim();
    if (!trimmedPnr) return;

    setSearchError('');
    setFoundBooking(null);
    try {
      const response = await api.get(`/api/bookings/pnr/${trimmedPnr}`);
      setFoundBooking(response.data);
    } catch (error) {
      setFoundBooking(null);
      if (error.response && error.response.status === 404) {
        setSearchError(`No booking found with PNR: ${trimmedPnr}`);
      } else {
        setSearchError('An error occurred while searching for the booking.');
        console.error(error);
      }
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    const searchMode = activeTab.toLowerCase();
    navigate(`/booking/${searchMode}/results`, { 
      state: { 
        searchType: activeTab,
        from,
        to,
        departureDate,
        class: classType,
      } 
    });
  };

  const searchHandler = (value, type, setSuggestions, setLoading) => {
    setLoading(true);
    if (value) {
      api.get(`/api/locations?search=${value}&type=${type.toLowerCase()}`)
        .then(res => {
          setSuggestions(res.data || []);
        })
        .catch(err => {
          console.error("Failed to fetch suggestions:", err);
          setSuggestions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(searchHandler, 300),
    [] 
  );

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    setIsFromLoading(true); 
    debouncedSearch(value, activeTab, setFromSuggestions, setIsFromLoading);
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    setIsToLoading(true); 
    debouncedSearch(value, activeTab, setToSuggestions, setIsToLoading);
  };

  const selectFromSuggestion = (city) => {
    setFrom(city);
    setFromSuggestions([]);
  };

  const selectToSuggestion = (city) => {
    setTo(city);
    setToSuggestions([]);
  };

  // --- YEH HAI TERA SWAP BUTTON KA FIX (Task 4) ---
  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setFromSuggestions([]);
    setToSuggestions([]);
  };
  // --- FIX KHATAM ---

  const PassengerInput = ({ label, count, onIncrement, onDecrement }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDecrement} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50" disabled={count === (label === 'Adults' ? 1 : 0)}>
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-semibold">{count}</span>
        <button type="button" onClick={onIncrement} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* PNR Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Find My Booking</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Enter your PNR or Booking ID" 
                value={pnr}
                onChange={e => setPnr(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handlePnrSearch} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                <Search size={20} className="sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
            {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
            {foundBooking && (
              <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg">
                <h3 className="text-xl font-bold text-green-800">Booking Found</h3>
                <p><strong>PNR:</strong> {foundBooking.pnrNumber}</p>
                <p><strong>Route:</strong> {foundBooking.from} <ArrowRight className="inline h-4 w-4" /> {foundBooking.to}</p>
                <p><strong>Departure:</strong> {new Date(foundBooking.departure).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="font-semibold text-green-700">{foundBooking.bookingStatus}</span></p>
                <button 
                  className="mt-4 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                  onClick={() => {
                    setEditingBooking(foundBooking);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit Booking
                </button>
              </div>
            )}
          </div>
          
          {/* Main Booking Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex border-b mb-6">
              {['Bus', 'Train', 'Air'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors duration-300 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                >
                  {tab === 'Bus' && <Bus size={20} />}
                  {tab === 'Train' && <Train size={20} />}
                  {tab === 'Air' && <Plane size={20} />}
                  <span>{tab}</span>
                </button>
              ))}
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-6">
              
              {/* Row 1: From/To */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                
                {/* From */}
                <div className="md:col-span-2 relative">
                  <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                  <input type="text" id="from" placeholder="Source City" value={from} onChange={handleFromChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required autoComplete="off" />
                  {from && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {isFromLoading ? (
                        <li className="p-2 text-gray-500">Loading...</li>
                      ) : fromSuggestions.length > 0 ? (
                        fromSuggestions.map(city => (
                          <li key={city} onClick={() => selectFromSuggestion(city)} className="p-2 hover:bg-gray-100 cursor-pointer">
                            {city}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500">No results found</li> 
                      )}
                    </ul>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center items-end h-full">
                  <button type="button" onClick={handleSwap} className="p-3 mt-6 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeftRight size={20} />
                  </button>
                </div>

                {/* To */}
                <div className="md:col-span-2 relative">
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                  <input type="text" id="to" placeholder="Destination City" value={to} onChange={handleToChange} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required autoComplete="off" />
                  {to && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {isToLoading ? (
                        <li className="p-2 text-gray-500">Loading...</li>
                      ) : toSuggestions.length > 0 ? (
                        toSuggestions.map(city => (
                          <li key={city} onClick={() => selectToSuggestion(city)} className="p-2 hover:bg-gray-100 cursor-pointer">
                            {city}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500">No results found</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 relative">
                    <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                    <Calendar className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                    <input 
                      type="date" 
                      id="departure" 
                      value={departureDate} 
                      onChange={e => setDepartureDate(e.target.value)} 
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                      required 
                      min={todayString}
                    />
                  </div>
                  
                <div className="md:col-span-1"></div>

                <div className={`md:col-span-2 relative transition-opacity duration-300 ${tripType === 'one-way' ? 'opacity-50' : 'opacity-100'}`}>
                      <label htmlFor="return" className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                      <Calendar className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                  <input 
                    type="date" 
                    id="return" 
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                        disabled={tripType === 'one-way'} 
                    min={departureDate || todayString} 
                  />
                </div>
              </div>

              {/* Row 3: Passengers & Class */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Passengers */}
                <div className="relative md:col-span-2">
                  <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <button type="button" onClick={() => setShowPassengerDropdown(!showPassengerDropdown)} className="w-full text-left p-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center">
                    <span>
                      {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}
                    </span>
                    <Users size={20} className="text-gray-500" />
                  </button>
                  {showPassengerDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full md:w-80 bg-white rounded-lg shadow-xl p-4 z-10">
                      <PassengerInput
                        label="Adults"
                        count={passengers.adults}
                        onIncrement={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))}
                        onDecrement={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                      />
                      <PassengerInput
                        label="Children"
                        count={passengers.children}
                        onIncrement={() => setPassengers(p => ({ ...p, children: p.children + 1 }))}
                        onDecrement={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                      />
                      <PassengerInput
                        label="Infants"
                        count={passengers.infants}
                        onIncrement={() => setPassengers(p => ({ ...p, infants: p.infants + 1 }))}
                        onDecrement={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                      />
                      <button type="button" onClick={() => setShowPassengerDropdown(false)} className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg">Done</button>
                    </div>
                  )}
                </div>

                {/* Class */}
                {activeTab !== 'Bus' && (
                  <div className="md:col-span-2">
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select 
                      id="class" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      value={classType}
                      onChange={e => setClassType(e.target.value)}
                    >
                      {activeTab === 'Air' && (
                        <>
                          <option value="Economy">Economy</option>
                          <option value="Business">Business</option>
                        </>
                      )}
                      {activeTab === 'Train' && (
                        <>
                          <option value="Sleeper">Sleeper</option>
                          <option value="AC">AC</option>
                          <option value="First Class">First Class</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* ... Search Button (Desktop) ... */}
                {/* --- ISKA COL-SPAN ADJUST KAR --- */}
                <div className="hidden lg:flex items-end lg:col-span-3"> 
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
      {/* ... Modal and Footer ... */}
      {isEditModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Booking</h2>
            <form onSubmit={handleUpdateBooking}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">From</label>
                <input 
                  type="text" 
                  name="from"
                  defaultValue={editingBooking.from}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input 
                  type="text" 
                  name="to"
                  defaultValue={editingBooking.to}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Booking;