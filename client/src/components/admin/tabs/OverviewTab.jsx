import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Package, Ticket, AlertCircle, Briefcase } from 'lucide-react';
import StatCard from '../StatCard';

const COLORS = {
    Bus: '#3B82F6',   // Blue
    Train: '#F97316', // Orange
    Air: '#8B5CF6',   // Purple
    Parcel: '#10B981',// Green
    Ride: '#F59E0B',  // Yellow
    Carpool: '#F59E0B',
    Confirmed: '#22c55e',
    Pending: '#f59e0b',
    Cancelled: '#ef4444'
};


const OverviewTab = ({ stats, routes, trips, parcels, allBookings, setActiveTab, setEditingRoute, setEditingTrip, setFormMode, error }) => {
    const [timeRange, setTimeRange] = useState('1W');

    const { processedGraphData, granularRevenue, modeDistribution, statusDistribution } = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let dateFormat = 'daily';

        switch (timeRange) {
            case '1W': startDate.setDate(now.getDate() - 7); dateFormat = 'daily'; break;
            case '1M': startDate.setDate(now.getDate() - 30); dateFormat = 'daily'; break;
            case '3M': startDate.setDate(now.getDate() - 90); dateFormat = 'weekly'; break;
            case '1Y': startDate.setFullYear(now.getFullYear() - 1); dateFormat = 'monthly'; break;
            case 'All': startDate = new Date(0); dateFormat = 'monthly'; break;
            default: startDate.setDate(now.getDate() - 7);
        }

        // Filter Data by Time Range
        const filteredBookings = allBookings.filter(b => new Date(b.createdAt) >= startDate);
        const filteredParcels = parcels.filter(p => new Date(p.createdAt) >= startDate);

        // --- 1. Line Chart Data (Trends) ---
        const dataMap = {};
        const addToMap = (dateStr, type) => {
            const date = new Date(dateStr);
            let key = '';
            if (dateFormat === 'daily') {
                key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (dateFormat === 'weekly') {
                const startOfYear = new Date(date.getFullYear(), 0, 1);
                const pastDays = (date - startOfYear) / 86400000;
                const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
                key = `W${weekNum}`;
            } else {
                key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }

            if (!dataMap[key]) dataMap[key] = { date: key, Parcels: 0, Bus: 0, Train: 0, Air: 0, Rides: 0, timestamp: date.getTime() };

            // Normalize Types
            if (type === 'Parcel') dataMap[key].Parcels += 1;
            else if (['Bus', 'Train', 'Air'].includes(type)) dataMap[key][type] += 1;
            else if (['Ride', 'Carpool', 'ride', 'carpool'].includes(type) || type === 'Transport') dataMap[key].Rides += 1;
            else {
                // Unknown types fallback to Rides or ignore
                // dataMap[key].Rides += 1;
            }
        };

        filteredParcels.forEach(p => addToMap(p.createdAt, 'Parcel'));
        filteredBookings.forEach(b => addToMap(b.createdAt, b.bookingType || 'Bus'));

        const sortedTrendData = Object.values(dataMap).sort((a, b) => a.timestamp - b.timestamp);


        // --- 2. Revenue Breakdown (Bar) ---
        const revenueMap = { Bus: 0, Train: 0, Air: 0, Parcel: 0, Ride: 0 };
        filteredParcels.forEach(p => revenueMap.Parcel += (p.fare || 0));
        filteredBookings.forEach(b => {
            let type = b.bookingType;
            if (['Ride', 'Carpool', 'ride'].includes(type)) type = 'Ride';
            // Accumulate if known type, else ignore or map to Other
            if (revenueMap[type] !== undefined) revenueMap[type] += (b.fare || 0);
            else if (type === 'Parcel') revenueMap.Parcel += (b.fare || 0);
        });
        const granularRevenue = Object.keys(revenueMap).map(name => ({ name, revenue: revenueMap[name] }));


        // --- 3. Mode Distribution (Pie) ---
        const modeMap = { Bus: 0, Train: 0, Air: 0, Parcel: 0, Ride: 0 };
        filteredParcels.forEach(p => modeMap.Parcel += 1);
        filteredBookings.forEach(b => {
            let type = b.bookingType;
            if (['Ride', 'Carpool', 'ride'].includes(type)) type = 'Ride';
            if (modeMap[type] !== undefined) modeMap[type] += 1;
            else if (type === 'Parcel') modeMap.Parcel += 1;
        });
        const modeDistribution = Object.keys(modeMap).map(name => ({ name, value: modeMap[name] })).filter(i => i.value > 0);


        // --- 4. Status Distribution (Pie) ---
        const statusMap = { Confirmed: 0, Pending: 0, Cancelled: 0 };
        filteredBookings.forEach(b => {
            let s = b.bookingStatus || 'Confirmed';
            if (s === 'Booked') s = 'Confirmed';
            // Simple mapping for demo, adjust based on actual status values
            if (['pending', 'Pending'].includes(s)) s = 'Pending';
            if (['cancelled', 'Cancelled'].includes(s)) s = 'Cancelled';

            if (statusMap[s] !== undefined) statusMap[s] += 1;
            else statusMap['Confirmed'] += 1; // Default
        });
        const statusDistribution = Object.keys(statusMap).map(name => ({ name, value: statusMap[name] })).filter(i => i.value > 0);


        return { processedGraphData: sortedTrendData, granularRevenue, modeDistribution, statusDistribution };

    }, [timeRange, parcels, allBookings]);

    const rangeOptions = ['1W', '1M', '3M', '1Y', 'All'];

    return (
        <>
            {error && (
                <div className="flex items-center justify-center p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
                    <AlertCircle className="mr-2" /> {error}
                </div>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-6 w-6 text-green-600" />} color="bg-green-100" />
                <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
                <StatCard title="Total Partners" value={stats.totalPartners} icon={<Briefcase className="h-6 w-6 text-indigo-600" />} color="bg-indigo-100" />
                <StatCard title="Parcel Bookings" value={stats.parcelBookings} icon={<Package className="h-6 w-6 text-orange-600" />} color="bg-orange-100" />
                <StatCard title="Trip Bookings" value={stats.tripBookings} icon={<Ticket className="h-6 w-6 text-purple-600" />} color="bg-purple-100" />
            </div>

            {/* Time Filter Controls */}
            <div className="flex justify-end mb-6">
                <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100 inline-flex">
                    {rangeOptions.map(r => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${timeRange === r ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

                {/* 1. Trends Line Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Booking Activity ({timeRange})</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={processedGraphData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="Bus" stroke={COLORS.Bus} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Train" stroke={COLORS.Train} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Air" stroke={COLORS.Air} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Parcels" stroke={COLORS.Parcel} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Rides" stroke={COLORS.Ride} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Revenue Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Breakdown ({timeRange})</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={granularRevenue} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{ fill: '#4B5563', fontWeight: 500 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={30}>
                                {granularRevenue.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3B82F6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Mode Distribution Pie */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings by Mode</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={modeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {modeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#CBD5E1'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Status Distribution Pie */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#CBD5E1'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Recent Routes and Trips Sections */}
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
