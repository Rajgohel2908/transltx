import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bus, Train, Plane, Ticket, Search, BarChart3, CheckCircle, Clock, Users } from 'lucide-react';
import Footer from '../components/Footer';
import api from '../utils/api';
import BusAirBookingForm from '../components/BusAirBookingForm';
import TrainBookingForm from '../components/TrainBookingForm';

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
                className="absolute top-1 bottom-1 left-1 w-1/3 bg-white rounded-full shadow-md transition-transform duration-500 ease-in-out"
                style={{
                  transform:
                    mainTab === 'Book Ticket' ? 'translateX(0%)' :
                      mainTab === 'PNR Status' ? 'translateX(100%)' :
                        'translateX(200%)',
                }}
              />

              <button
                onClick={() => setMainTab('Book Ticket')}
                className={`relative z-10 w-1/3 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${mainTab === 'Book Ticket' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Ticket size={20} /> BOOK TICKET
              </button>

              <button
                onClick={() => setMainTab('PNR Status')}
                className={`relative z-10 w-1/3 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${mainTab === 'PNR Status' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Search size={20} /> PNR STATUS
              </button>

              <button
                onClick={() => setMainTab('Charts / Vacancy')}
                className={`relative z-10 w-1/3 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300 ${mainTab === 'Charts / Vacancy' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <BarChart3 size={20} /> CHARTS
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl">

            {mainTab === 'PNR Status' && (
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Search className="text-blue-600" /> Check PNR Status
                </h2>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Enter PNR Number (e.g., T123456)"
                      value={pnr}
                      onChange={e => setPnr(e.target.value.toUpperCase())}
                      className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-lg"
                    />
                    <Ticket className="absolute left-4 top-4 text-gray-400 h-6 w-6" />
                  </div>
                  <button
                    onClick={handlePnrSearch}
                    className="bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Search size={20} />
                    Search
                  </button>
                </div>

                {searchError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg animate-fade-in">
                    <p className="text-red-700 font-medium">{searchError}</p>
                  </div>
                )}

                {foundBooking && (
                  <div className="animate-fade-in space-y-6">
                    {/* Status Header */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">PNR Number</p>
                          <p className="text-2xl font-black text-gray-800 tracking-widest">{foundBooking.pnrNumber}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${foundBooking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          foundBooking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {foundBooking.bookingStatus === 'Confirmed' && <CheckCircle size={16} />}
                          {foundBooking.bookingStatus}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Journey Details */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                          <div className="text-center md:text-left">
                            <p className="text-3xl font-bold text-gray-800">{foundBooking.from}</p>
                            <p className="text-gray-500 font-medium">{foundBooking.departureDateTime ? new Date(foundBooking.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(foundBooking.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-sm text-gray-400">{foundBooking.departureDateTime ? new Date(foundBooking.departureDateTime).toDateString() : new Date(foundBooking.departure).toDateString()}</p>
                          </div>

                          <div className="flex-grow flex flex-col items-center w-full md:w-auto">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <Clock size={14} />
                              <span>{foundBooking.duration || 'N/A'}</span>
                            </div>
                            <div className="relative w-full md:w-64 h-1 bg-gray-200 rounded-full">
                              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 px-2 text-gray-400">
                                {foundBooking.bookingType === 'Air' ? <Plane size={20} /> :
                                  foundBooking.bookingType === 'Train' ? <Train size={20} /> : <Bus size={20} />}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{foundBooking.service}</p>
                          </div>

                          <div className="text-center md:text-right">
                            <p className="text-3xl font-bold text-gray-800">{foundBooking.to}</p>
                            <p className="text-gray-500 font-medium">{foundBooking.arrivalDateTime ? new Date(foundBooking.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (foundBooking.arrival ? new Date(foundBooking.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--')}</p>
                            <p className="text-sm text-gray-400">{foundBooking.arrivalDateTime ? new Date(foundBooking.arrivalDateTime).toDateString() : (foundBooking.arrival ? new Date(foundBooking.arrival).toDateString() : 'Arrival Date')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Passenger List */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                              <Users size={16} /> Passengers
                            </h3>
                            <div className="space-y-3">
                              {foundBooking.passengers.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                      <Users size={16} />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-800">{p.fullName}</p>
                                      <p className="text-xs text-gray-500">{p.age} Yrs | {p.gender}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-400">Seat: --</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment & Contact */}
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <BarChart3 size={16} /> Payment Details
                              </h3>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Total Fare</span>
                                <span className="text-xl font-bold text-gray-800">₹{foundBooking.fare}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`text-sm font-bold px-2 py-1 rounded ${foundBooking.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {foundBooking.paymentStatus || 'Pending'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Contact Info</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                                <span className="font-semibold">Email:</span> {foundBooking.contactEmail}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="font-semibold">Phone:</span> {foundBooking.contactPhone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
                        <button
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                          onClick={() => alert("Ticket Download feature coming soon!")}
                        >
                          <Ticket size={16} /> Download Ticket
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          onClick={() => {
                            setEditingBooking(foundBooking);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Search size={16} /> Edit Booking
                        </button>
                      </div>
                    </div>
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
        </main >
      </div >

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