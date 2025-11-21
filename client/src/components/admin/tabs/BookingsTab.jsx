import React from 'react';

const BookingsTab = ({ allBookings, loading, bookingFilter, setBookingFilter }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Bookings</h2>
            <div className="flex items-center gap-3 mb-4">
                {['All', 'Bus', 'Train', 'Air', 'Trips', 'Parcel', 'Ride'].map((t) => (
                    <button key={t} onClick={() => setBookingFilter(t)} className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading bookings...</p>
            ) : (() => {
                const filtered = bookingFilter === 'All' ? allBookings : allBookings.filter(b => {
                    if (!b.bookingType) return false;
                    if (bookingFilter === 'Parcel') return String(b.bookingType).toLowerCase() === 'parcel';
                    if (bookingFilter === 'Trips') return !['parcel', 'ride', 'carpool'].includes(String(b.bookingType).toLowerCase());
                    return String(b.bookingType).toLowerCase() === String(bookingFilter).toLowerCase();
                });

                return filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg">{booking.from} → {booking.to}</p>
                                        <p className="text-sm text-gray-500">PNR: {booking.pnrNumber}</p>
                                        <p className="text-sm text-gray-500">User: {booking.userId?.name || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">₹{(booking.fare || 0).toLocaleString()}</p>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>{booking.bookingStatus}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center"><p className="text-gray-500">No bookings match the selected filter.</p></div>
                );
            })()}
        </div>
    );
};

export default BookingsTab;
