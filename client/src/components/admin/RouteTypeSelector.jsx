import React from 'react';
import { Bus, Train, Plane } from 'lucide-react';

const RouteTypeSelector = ({ setRouteTypeToCreate, setEditingRoute, setFormMode, closeAllForms }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Select Route Type</h3>
        <p className="text-gray-600 mb-6">What type of transport route do you want to add?</p>
        <div className="grid grid-cols-3 gap-4">
            <button
                onClick={() => { setRouteTypeToCreate('bus'); setEditingRoute(null); setFormMode('showRouteForm'); }}
                className="p-6 bg-blue-100 text-blue-800 rounded-lg flex flex-col items-center justify-center hover:bg-blue-200 hover:shadow-lg transition-all"
            >
                <Bus size={32} />
                <span className="font-semibold mt-2">Bus Route</span>
            </button>
            <button
                onClick={() => { setRouteTypeToCreate('train'); setEditingRoute(null); setFormMode('showRouteForm'); }}
                className="p-6 bg-green-100 text-green-800 rounded-lg flex flex-col items-center justify-center hover:bg-green-200 hover:shadow-lg transition-all"
            >
                <Train size={32} />
                <span className="font-semibold mt-2">Train Route</span>
            </button>
            <button
                onClick={() => { setRouteTypeToCreate('air'); setEditingRoute(null); setFormMode('showRouteForm'); }}
                className="p-6 bg-indigo-100 text-indigo-800 rounded-lg flex flex-col items-center justify-center hover:bg-indigo-200 hover:shadow-lg transition-all"
            >
                <Plane size={32} />
                <span className="font-semibold mt-2">Air Route</span>
            </button>
        </div>
        <button onClick={closeAllForms} className="w-full mt-6 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
    </div>
);

export default RouteTypeSelector;
