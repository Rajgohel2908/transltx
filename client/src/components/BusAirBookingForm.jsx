import React from 'react';
import { MapPin, Calendar, ArrowRightLeft, Armchair } from 'lucide-react';

const BusAirBookingForm = ({
  mode,
  from, setFrom,
  to, setTo,
  departureDate, setDepartureDate,
  returnDate, setReturnDate,
  classType, setClassType,
  handleSwap,
  handleSearch
}) => {
  return (
    <form onSubmit={handleSearch} className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From */}
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-1">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Origin City"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Swap Button (Hidden on mobile, visible on desktop) */}
        <div className="hidden md:flex items-end justify-center pb-3">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowRightLeft className="text-gray-600 h-5 w-5" />
          </button>
        </div>

        {/* To */}
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-1">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Destination City"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Departure Date */}
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-1">Departure</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Return Date (Optional) */}
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-1">Return (Optional)</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        
        {/* Class Selection */}
         <div className="relative md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Class</label>
          <div className="relative">
            <Armchair className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <select
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
            >
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              {mode === 'Bus' && <option value="Sleeper">Sleeper</option>}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Search {mode} Tickets
      </button>
    </form>
  );
};

export default BusAirBookingForm;
