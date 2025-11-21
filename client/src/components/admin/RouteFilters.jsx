import React from 'react';
import { Search } from 'lucide-react';

const RouteFilters = ({ routeSearch, setRouteSearch, routeFilter, setRouteFilter }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search by route name or ID..."
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-600">Filter:</span>
            {['All', 'Bus', 'Train', 'Air'].map(type => (
                <button
                    key={type}
                    onClick={() => setRouteFilter(type)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${routeFilter === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    {type}
                </button>
            ))}
        </div>
    </div>
);

export default RouteFilters;
