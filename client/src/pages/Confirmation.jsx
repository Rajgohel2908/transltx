import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Download, Share2, Plane, Bus, Train } from 'lucide-react';
import Footer from '../components/Footer';

const Confirmation = () => {
  const location = useLocation();
  const { selectedTicket, passengerData, bookingId, searchType } = location.state || {};

  if (!selectedTicket || !passengerData || !bookingId) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Booking details are missing.</h1>
        <Link to="/booking" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg">Start Over</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen flex items-center">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">Your ticket has been successfully booked.</p>

            {/* Ticket Stub */}
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-left relative my-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-50 rounded-full border-2 border-dashed border-gray-300"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-50 rounded-full border-2 border-dashed border-gray-300"></div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID / PNR</p>
                  <p className="font-mono text-lg font-semibold text-blue-600">{bookingId}</p>
                </div>
                {searchType === 'Air' && <Plane className="text-gray-400" />}
                {searchType === 'Bus' && <Bus className="text-gray-400" />}
                {searchType === 'Train' && <Train className="text-gray-400" />}
              </div>
              <div className="border-t"></div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Passenger</p>
                  <p className="font-semibold">{passengerData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-semibold">{selectedTicket.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-semibold">{selectedTicket.from} to {selectedTicket.to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-semibold text-xl">₹{selectedTicket.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"><Download size={18} /> Download</button>
              <button className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"><Share2 size={18} /> Share</button>
            </div>
            <div className="mt-4">
              <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Confirmation;