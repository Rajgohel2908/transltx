import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { Bus, Train, Plane, Users, Calendar, ArrowRight, Minus, Plus, ArrowLeftRight, MapPin } from 'lucide-react';
import { api } from '../utils/api.js';

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Booking = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  
  // Capitalize the first letter of the mode from URL
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

  // --- ADD THIS HELPER FUNCTION ---
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
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
      // Handle error display to the user
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
        console.error(error); // Log the full error for debugging
      }
    }
  };
  
  // State for search inputs
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const searchMode = activeTab.toLowerCase();
    navigate(`/booking/${searchMode}/results`, { 
      state: { 
        searchType: activeTab,
        from,
        to,
        departureDate
      } 
    });
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

  return (
    <>
      <div className="bg-gradient-to-b from-white to-slate-100 min-h-screen">
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">Book Your Next Journey</h1>
            <p className="text-lg text-gray-500">Seamlessly book bus, train, and air tickets all in one place.</p>
          </div>

          {/* Find My Booking Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Find My Booking</h2>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Enter your PNR" 
                value={pnr}
                onChange={e => setPnr(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handlePnrSearch} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
            {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
            {foundBooking && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-bold">Booking Details</h3>
                <p><strong>PNR:</strong> {foundBooking.pnrNumber}</p>
                <p><strong>From:</strong> {foundBooking.from}</p>
                <p><strong>To:</strong> {foundBooking.to}</p>
                <p><strong>Departure:</strong> {foundBooking.departure}</p>
                <p><strong>Status:</strong> {foundBooking.bookingStatus}</p>
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
            <form onSubmit={handleSearch}>
              {activeTab !== 'Bus' && (
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tripType" value="one-way" checked={tripType === 'one-way'} onChange={() => setTripType('one-way')} className="form-radio text-blue-600" />
                    One-way
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tripType" value="round-trip" checked={tripType === 'round-trip'} onChange={() => setTripType('round-trip')} className="form-radio text-blue-600" />
                    Round-trip
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
                {/* From */}
                <div className="lg:col-span-3 relative">
                  <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                  <input type="text" id="from" placeholder="Source City" value={from} onChange={e => setFrom(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>

                {/* Swap Button */}
                <div className="hidden lg:flex justify-center items-center lg:col-span-1">
                  <button type="button" className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeftRight size={20} />
                  </button>
                </div>

                {/* To */}
                <div className="lg:col-span-3 relative">
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <MapPin className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                  <input type="text" id="to" placeholder="Destination City" value={to} onChange={e => setTo(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>

                {/* Dates */}
                <div className="flex gap-4 lg:col-span-5">
                  <div className="w-full relative">
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
                  {activeTab !== 'Bus' && (
                    <div className={`w-full relative transition-opacity duration-300 ${tripType === 'one-way' ? 'opacity-50' : 'opacity-100'}`}>
                      <label htmlFor="return" className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                      <Calendar className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                      <input type="date" id="return" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                        disabled={tripType === 'one-way'} 
                        min={departureDate || todayString} />
                    </div>
                  )}
                </div>

                {/* Search Button (Mobile) */}
                <button type="submit" className="lg:hidden w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  Search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mt-6">
                {/* Passengers */}
                <div className="relative lg:col-span-5">
                  <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <button type="button" onClick={() => setShowPassengerDropdown(!showPassengerDropdown)} className="w-full text-left p-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center">
                    <span>
                      {passengers.adults} Adult{passengers.adults > 1 ? 's' : ''}
                      {passengers.children > 0 && `, ${passengers.children} Child`}
                      {passengers.infants > 0 && `, ${passengers.infants} Infant`}
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
                {(activeTab === 'Train' || activeTab === 'Air') && (
                  <div className="lg:col-span-4">
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select id="class" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                      {activeTab === 'Air' && (
                        <>
                          <option>Economy</option>
                          <option>Business</option>
                          <option>First</option>
                        </>
                      )}
                      {activeTab === 'Train' && (
                        <>
                          <option>Sleeper</option>
                          <option>AC</option>
                          <option>First</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Spacer for Bus */}
                {activeTab === 'Bus' && <div className="hidden lg:block lg:col-span-4"></div>}

                {/* Search Button (Desktop) */}
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
