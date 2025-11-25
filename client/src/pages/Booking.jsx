import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { Bus, Train, Plane, Users, Calendar, ArrowRight, Minus, Plus, ArrowLeftRight, MapPin, Search, Ticket, BarChart3, Calendar as CalIcon } from 'lucide-react';
import { api } from '../utils/api.js';
import { debounce } from 'lodash';
import ModernCalendar from '../components/ModernCalendar';
import ModernTimer from '../components/ModernTimer';

// --- Reusable Custom Date Picker (Moved outside to prevent re-renders) ---
const CustomDatePicker = ({ label, value, onChange, minDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleDateSelect = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center h-[50px]"
      >
        <CalIcon className="absolute left-3 text-gray-400 h-5 w-5" />
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Select Date"}
        </span>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-2 top-full left-0 shadow-2xl rounded-2xl animate-fade-in bg-white">
          <ModernCalendar 
            selectedDate={value} 
            onChange={handleDateSelect} 
            minDate={minDate} 
          />
        </div>
      )}
    </div>
  );
};

// --- TrainBookingForm ---
const TrainBookingForm = ({ from, setFrom, to, setTo, departureDate, setDepartureDate, classType, setClassType, handleSwap, handleSearch }) => {
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isFromLoading, setIsFromLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);
  const [flexibleDate, setFlexibleDate] = useState(false);
  const [availableBerth, setAvailableBerth] = useState(false);
  const [disabilityConcession, setDisabilityConcession] = useState(false);
  const [railwayPass, setRailwayPass] = useState(false);
  const [quota, setQuota] = useState('GENERAL');
  
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  const searchHandler = (value, type, setSuggestions, setLoading) => {
    setLoading(true);
    if (!value || value.trim() === '') {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    api.get(`/locations?search=${value}&type=${type.toLowerCase()}`)
      .then(res => setSuggestions(res.data || []))
      .catch(err => {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions([]);
      })
      .finally(() => setLoading(false));
  };

  const debouncedSearch = useMemo(() => debounce(searchHandler, 300), []);

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    setIsFromLoading(true);
    debouncedSearch(value, 'train', setFromSuggestions, setIsFromLoading);
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    setIsToLoading(true);
    debouncedSearch(value, 'train', setToSuggestions, setIsToLoading);
  };

  const selectFromSuggestion = (cityObj) => {
    setFrom(cityObj.name);
    setFromSuggestions([]);
    setIsFromFocused(false);
  };

  const selectToSuggestion = (cityObj) => {
    setTo(cityObj.name);
    setToSuggestions([]);
    setIsToFocused(false);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6 p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Stations & Quota */}
        <div className="space-y-4">
          {/* From Station */}
          <div className="relative">
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input 
              type="text" placeholder="From Station" 
              value={from} 
              onChange={handleFromChange} 
              onFocus={() => setIsFromFocused(true)}
              onBlur={() => setTimeout(() => setIsFromFocused(false), 200)} 
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required autoComplete="off" 
            />
            {isFromFocused && from && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {isFromLoading ? <li className="p-2 text-gray-500">Loading...</li> : 
                 fromSuggestions.length > 0 ? 
                   fromSuggestions.map(cityObj => (
                    <li key={cityObj.name} onClick={() => selectFromSuggestion(cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                      {cityObj.name}
                      <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                    </li>
                   )) 
                 : <li className="p-2 text-gray-500">No results found</li>}
              </ul>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button type="button" onClick={handleSwap} className="p-3 rounded-full bg-gray-100 hover:bg-blue-100 border border-gray-300 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeftRight size={20} />
            </button>
          </div>

          {/* To Station */}
          <div className="relative">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input 
              type="text" placeholder="To Station" 
              value={to} 
              onChange={handleToChange} 
              onFocus={() => setIsToFocused(true)}
              onBlur={() => setTimeout(() => setIsToFocused(false), 200)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required autoComplete="off" 
            />
             {isToFocused && to && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {isToLoading ? <li className="p-2 text-gray-500">Loading...</li> : 
                 toSuggestions.length > 0 ? 
                   toSuggestions.map(cityObj => (
                    <li key={cityObj.name} onClick={() => selectToSuggestion(cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                      {cityObj.name}
                      <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                    </li>
                   )) 
                 : <li className="p-2 text-gray-500">No results</li>}
              </ul>
            )}
          </div>

          {/* Quota */}
          <div className="relative">
            <label htmlFor="quota" className="block text-sm font-medium text-gray-700 mb-1">Quota</label>
             <Users className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <select 
              id="quota" 
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              value={quota}
              onChange={e => setQuota(e.target.value)}
            >
              <option value="GENERAL">GENERAL</option>
              <option value="TATKAL">TATKAL</option>
              <option value="LADIES">LADIES</option>
              <option value="LOWER BERTH/SR.CITIZEN">LOWER BERTH/SR.CITIZEN</option>
              <option value="PERSON WITH DISABILITY">PERSON WITH DISABILITY</option>
            </select>
          </div>
        </div>

        {/* Right Column: Date & Class */}
        <div className="space-y-4">
          {/* Departure Date - UPDATED */}
          <CustomDatePicker 
            label="Departure" 
            value={departureDate} 
            onChange={setDepartureDate}
            minDate={new Date()} // Aaj ki date
          />
          
          {/* Train Class */}
          <div className="relative">
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <Ticket className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <select 
              id="class" 
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              value={classType}
              onChange={e => setClassType(e.target.value)}
            >
              <option value="All Classes">All Classes</option>
              <option value="Sleeper">Sleeper (SL)</option>
              <option value="AC 3 Tier">AC 3 Tier (3A)</option>
              <option value="AC 2 Tier">AC 2 Tier (2A)</option>
              <option value="First Class">First Class (1A)</option>
              <option value="AC Chair car">AC Chair car (CC)</option>
            </select>
          </div>
          {/* Empty placeholders for alignment */}
          <div className="h-14 hidden md:block"></div>
          <div className="h-14 hidden md:block"></div>
        </div>
      </div>
      
      {/* Checkboxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={disabilityConcession} onChange={e => setDisabilityConcession(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
          <span className="ml-2">Person With Disability Concession</span>
        </label>
        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={flexibleDate} onChange={e => setFlexibleDate(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
          <span className="ml-2">Flexible With Date</span>
        </label>
        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={availableBerth} onChange={e => setAvailableBerth(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
          <span className="ml-2">Train with Available Berth</span>
        </label>
        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={railwayPass} onChange={e => setRailwayPass(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
          <span className="ml-2">Railway Pass Concession</span>
        </label>
      </div>
      
      {/* --- Search Button (Full width) --- */}
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-6">
        Search
      </button>
    </form>
  );
};

// --- BusAirBookingForm ---
const BusAirBookingForm = ({ mode, from, setFrom, to, setTo, departureDate, setDepartureDate, returnDate, setReturnDate, classType, setClassType, handleSwap, handleSearch }) => {
  const [tripType, setTripType] = useState('one-way');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [isFromLoading, setIsFromLoading] = useState(false);
  const [isToLoading, setIsToLoading] = useState(false);
  
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  const searchHandler = (value, type, setSuggestions, setLoading) => {
    setLoading(true);
    if (!value || value.trim() === '') {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    api.get(`/locations?search=${value}&type=${type.toLowerCase()}`)
      .then(res => setSuggestions(res.data || []))
      .catch(err => {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions([]);
      })
      .finally(() => setLoading(false));
  };

  const debouncedSearch = useMemo(() => debounce(searchHandler, 300), []);

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    setIsFromLoading(true); 
    debouncedSearch(value, mode, setFromSuggestions, setIsFromLoading);
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    setIsToLoading(true); 
    debouncedSearch(value, mode, setToSuggestions, setIsToLoading);
  };

  const selectFromSuggestion = (cityObj) => {
    setFrom(cityObj.name);
    setFromSuggestions([]);
    setIsFromFocused(false);
  };

  const selectToSuggestion = (cityObj) => {
    setTo(cityObj.name);
    setToSuggestions([]);
    setIsToFocused(false);
  };

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
    <form onSubmit={handleSearch} className="space-y-6 p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- Column 1: From, To, Passengers --- */}
        <div className="space-y-4">
          {/* From */}
          <div className="relative">
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input 
              type="text" id="from" placeholder="Source City" 
              value={from} 
              onChange={handleFromChange} 
              onFocus={() => setIsFromFocused(true)}
              onBlur={() => setTimeout(() => setIsFromFocused(false), 200)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required autoComplete="off" 
            />
            {isFromFocused && from && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {isFromLoading ? (
                  <li className="p-2 text-gray-500">Loading...</li>
                ) : fromSuggestions.length > 0 ? (
                  fromSuggestions.map(cityObj => (
                    <li key={cityObj.name} onClick={() => selectFromSuggestion(cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                      {cityObj.name}
                      <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                    </li>
                  ))
                ) : ( <li className="p-2 text-gray-500">No results found</li> )}
              </ul>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button type="button" onClick={handleSwap} className="p-3 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeftRight size={20} />
            </button>
          </div>

          {/* To */}
          <div className="relative">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input 
              type="text" id="to" placeholder="Destination City" 
              value={to} 
              onChange={handleToChange} 
              onFocus={() => setIsToFocused(true)}
              onBlur={() => setTimeout(() => setIsToFocused(false), 200)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              required autoComplete="off" 
            />
            {isToFocused && to && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {isToLoading ? (
                  <li className="p-2 text-gray-500">Loading...</li>
                ) : toSuggestions.length > 0 ? (
                  toSuggestions.map(cityObj => (
                    <li key={cityObj.name} onClick={() => selectToSuggestion(cityObj)} className="p-2 hover:bg-gray-100 cursor-pointer">
                      {cityObj.name}
                      <span className="text-xs text-gray-500 block">{cityObj.state}</span>
                    </li>
                  ))
                ) : ( <li className="p-2 text-gray-500">No results found</li> )}
              </ul>
            )}
          </div>

          {/* Passenger Dropdown */}
          <div className="relative">
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
            <button type="button" onClick={() => setShowPassengerDropdown(!showPassengerDropdown)} className="w-full text-left p-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center">
              <span>{totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}</span>
              <Users size={20} className="text-gray-500" />
            </button>
            {showPassengerDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl p-4 z-10">
                <PassengerInput label="Adults" count={passengers.adults} onIncrement={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))} onDecrement={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} />
                <PassengerInput label="Children" count={passengers.children} onIncrement={() => setPassengers(p => ({ ...p, children: p.children + 1 }))} onDecrement={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))} />
                <PassengerInput label="Infants" count={passengers.infants} onIncrement={() => setPassengers(p => ({ ...p, infants: p.infants + 1 }))} onDecrement={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))} />
                <button type="button" onClick={() => setShowPassengerDropdown(false)} className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg">Done</button>
              </div>
            )}
          </div>
        </div>
        
        {/* --- Column 2: Dates, Class --- */}
        <div className="space-y-4">
          {/* Departure Date - UPDATED */}
          <CustomDatePicker 
            label="Departure" 
            value={departureDate} 
            onChange={setDepartureDate} 
            minDate={new Date()} // Aaj ki date
          />

          {/* Class (Air only) */}
          {mode === 'Air' && (
            <div className="relative">
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <Ticket className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
              <select id="class" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white appearance-none" value={classType} onChange={e => setClassType(e.target.value)}>
                <option value="Economy">Economy</option>
                <option value="Business">Business</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* --- Search Button (Full width) --- */}
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-6">
        Search
      </button>
    </form>
  );
};


// --- MAIN 'Booking' COMPONENT ---
const Booking = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  
  const [mainTab, setMainTab] = useState('Book Ticket'); 
  
  const initialTab = mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : 'Bus';
  const [activeTab, setActiveTab] = useState(initialTab);
  
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
    navigate(`/booking/${activeTab.toLowerCase()}`, { replace: true });
    if (activeTab === 'Train') {
      setClassType('Sleeper');
    } else if (activeTab === 'Air') {
      setClassType('Economy');
    } else {
      setClassType('');
    }
    setFrom('');
    setTo('');
    setDepartureDate('');
    setReturnDate('');
  }, [activeTab, navigate]);
  
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    const updatedBooking = {
      from: e.target.from.value,
      to: e.target.to.value,
    };

    try {
      const response = await api.put(`/bookings/${editingBooking._id}`, updatedBooking);
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
      const response = await api.get(`/bookings/pnr/${trimmedPnr}`);
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

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 py-12">
          
          {/* --- SLIDING TOGGLE (ROUNDED) --- */}
          <div className="flex justify-center mb-8">
            <div className="relative flex w-full max-w-lg p-1 bg-gray-200 rounded-full">
              
              <div
                className="absolute top-1 bottom-1 left-1 w-1/3 bg-white rounded-full shadow-md transition-transform duration-500 ease-in-out" // <-- 'rounded-full'
                style={{
                  transform: 
                    mainTab === 'Book Ticket' ? 'translateX(0%)' :
                    mainTab === 'PNR Status' ? 'translateX(100%)' :
                    'translateX(200%)',
                }}
              />

              <button 
                onClick={() => setMainTab('Book Ticket')}
                className={`relative z-10 w-1/3 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${ // <-- 'rounded-full'
                  mainTab === 'Book Ticket' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Ticket size={20} /> BOOK TICKET
              </button>
              
              <button 
                onClick={() => setMainTab('PNR Status')}
                className={`relative z-10 w-1/3 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${ // <-- 'rounded-full'
                  mainTab === 'PNR Status' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Search size={20} /> PNR STATUS
              </button>
              
              <button 
                onClick={() => setMainTab('Charts / Vacancy')}
                className={`relative z-10 w-1/3 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${ // <-- 'rounded-full'
                  mainTab === 'Charts / Vacancy' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 size={20} /> CHARTS
              </button>
            </div>
          </div>
          {/* --- END SLIDING TOGGLE --- */}
          
          <div className="bg-white rounded-2xl shadow-xl">
            
            {mainTab === 'PNR Status' && (
              <div className="p-6 sm:p-8">
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
            )}
            
            {mainTab === 'Charts / Vacancy' && (
              <div className="p-6 sm:p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Charts & Vacancy</h2>
                <p className="text-gray-600">This feature is coming soon!</p>
              </div>
            )}

            {mainTab === 'Book Ticket' && (
              <>
                <div className="flex border-b">
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

                {/* --- RENDER THE CORRECT FORM --- */}
                {activeTab === 'Train' ? (
                  <TrainBookingForm 
                    from={from} setFrom={setFrom}
                    to={to} setTo={setTo}
                    departureDate={departureDate} setDepartureDate={setDepartureDate}
                    classType={classType} setClassType={setClassType}
                    handleSwap={handleSwap}
                    handleSearch={handleSearch} 
                  />
                ) : (
                  <BusAirBookingForm 
                    mode={activeTab}
                    from={from} setFrom={setFrom}
                    to={to} setTo={setTo}
                    departureDate={departureDate} setDepartureDate={setDepartureDate}
                    returnDate={returnDate} setReturnDate={setReturnDate}
                    classType={classType} setClassType={setClassType}
                    handleSwap={handleSwap}
                    handleSearch={handleSearch} 
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {isEditModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400">
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