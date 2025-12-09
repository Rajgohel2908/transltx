import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { Users, Clock, MapPin, Search, ChevronDown, ChevronUp } from 'lucide-react';

const PartnerBookingsList = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null); // ID of expanded row

    useEffect(() => {
        api.get('/partners/bookings')
            .then(res => setBookings(res.data.bookings || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredBookings = bookings.filter(b =>
        (b.pnrNumber && b.pnrNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.userId?.name && b.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.routeId?.name && b.routeId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleRow = (id) => {
        if (expandedRow === id) setExpandedRow(null);
        else setExpandedRow(id);
    };

    if (loading) return <div className="text-center py-10 animate-pulse">Loading bookings...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-indigo-600" size={20} /> Passenger Manifest
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search PNR, Name, Route..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">PNR / Date</th>
                            <th className="px-6 py-4">Route Info</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Seats</th>
                            <th className="px-6 py-4">Fare</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBookings.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No bookings found matching your search.</td></tr>
                        ) : filteredBookings.map(b => (
                            <React.Fragment key={b._id}>
                                <tr className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${expandedRow === b._id ? 'bg-blue-50' : ''}`} onClick={() => toggleRow(b._id)}>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                b.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {b.bookingStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{b.pnrNumber}</div>
                                        <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{b.routeId?.name || 'Unknown Route'}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            {b.from} <span className="text-gray-300">→</span> {b.to}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{b.contactEmail}</div>
                                        <div className="text-xs text-gray-500">{b.contactPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-center">{b.passengers.length}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">₹{b.fare}</td>
                                    <td className="px-6 py-4 text-center">
                                        {expandedRow === b._id ? <ChevronUp size={16} className="text-gray-400 mx-auto" /> : <ChevronDown size={16} className="text-gray-400 mx-auto" />}
                                    </td>
                                </tr>
                                {expandedRow === b._id && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan="7" className="px-6 py-4">
                                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Passenger Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {b.passengers.map((p, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                                {p.gender === 'Female' ? 'F' : 'M'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-800 text-sm">{p.fullName}</div>
                                                                <div className="text-xs text-gray-500">{p.age} years • {p.gender}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                                                    <div>
                                                        <span className="font-semibold block mb-1">Departure Time:</span>
                                                        {b.departureDateTime ? new Date(b.departureDateTime).toLocaleString() : 'N/A'}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold block mb-1">Boarding/Drop Info:</span>
                                                        {/* If pickup info saved in future, display here. For now show from/to */}
                                                        {b.from} to {b.to}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartnerBookingsList;
