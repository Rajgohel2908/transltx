import React, { useState, useEffect } from 'react';
import { api } from "../../utils/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

const RevenueGraph = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7d'); // 7d, 1m, 3m, lifetime

    useEffect(() => {
        setLoading(true);
        api.get(`/partners/stats?range=${range}`)
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [range]);

    // if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>; 
    // Keep showing old data while loading new to avoid flicker, or show spinner overlay

    if (!stats && loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;
    if (!stats) return <div className="text-center py-10 text-gray-400">Unable to load stats.</div>;

    const ranges = [
        { label: '7 Days', value: '7d' },
        { label: '1 Month', value: '1m' },
        { label: '3 Months', value: '3m' },
        { label: 'Lifetime', value: 'lifetime' }
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
            {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                        <TrendingUp size={16} /> Revenue Analytics
                    </h3>
                    <div className="text-3xl font-extrabold text-gray-900 mt-2 flex items-center">
                        <span className="text-lg text-gray-500 mr-1">₹</span>
                        {stats.totalEarnings?.toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-2 mt-2">Total Earnings</span>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {ranges.map(r => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${range === r.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={stats.revenueGraph}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            dy={10}
                            minTickGap={30} // Prevent overlap on mobile/dense data
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                            formatter={(value) => [`₹${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueGraph;
