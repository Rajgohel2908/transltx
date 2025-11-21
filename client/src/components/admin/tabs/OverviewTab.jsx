import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Users, Package, Ticket, AlertCircle } from 'lucide-react';
import StatCard from '../StatCard';

const OverviewTab = ({ stats, revenueData, bookingsData, routes, trips, setActiveTab, setEditingRoute, setEditingTrip, setFormMode, error }) => {
    return (
        <>
            {error && (
                <div className="flex items-center justify-center p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
                    <AlertCircle className="mr-2" /> {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-6 w-6 text-green-600" />} color="bg-green-100" />
                <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
                <StatCard title="Parcel Bookings" value={stats.parcelBookings} icon={<Package className="h-6 w-6 text-orange-600" />} color="bg-orange-100" />
                <StatCard title="Trip Bookings" value={stats.tripBookings} icon={<Ticket className="h-6 w-6 text-purple-600" />} color="bg-purple-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Service</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value}`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#2563EB" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings This Week (Sample)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bookingsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="parcels" stroke="#8884d8" />
                            <Line type="monotone" dataKey="trips" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="carpools" stroke="#ffc658" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Routes and Trips Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent Routes */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recently Added Routes</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {routes.slice(0, 5).map(route => (
                            <div key={route._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold" style={{ color: route.color || '#3B82F6' }}>{route.name}</p>
                                    {route.type === 'air' ? (
                                        <p className="text-sm text-gray-500">
                                            {route.airline} - Flight {route.flightNumber}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500">{(route.stops || []).length} stops</p>
                                    )}
                                </div>
                                <button onClick={() => { setActiveTab('routes'); setEditingRoute(route); setFormMode('showRouteForm'); }} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200">Edit</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Trips */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Available Trips</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {trips.slice(0, 5).map(trip => (
                            <div key={trip._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{trip.name}</p>
                                    <p className="text-sm text-gray-500">{trip.price}</p>
                                </div>
                                <button onClick={() => { setActiveTab('trips'); setEditingTrip(trip); setFormMode('showTripForm'); }} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200">Edit</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewTab;
