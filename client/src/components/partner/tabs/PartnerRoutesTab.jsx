import React from 'react';
import { Search } from 'lucide-react';
import PartnerRouteForm from './PartnerRouteForm'; // New component we will create

const PartnerRoutesTab = ({
    routes,
    formMode,
    setFormMode,
    routeTypeToCreate, // Will be pre-set by Dashboard based on service type
    setRouteTypeToCreate,
    editingRoute,
    setEditingRoute,
    closeAllForms,
    handleRouteSaved,
    routeSearch,
    setRouteSearch,
    handleDeleteRoute,
    isSubmitting,
    serviceType // 'Bus', 'Train', 'Air', 'Ride', 'All'
}) => {

    // Auto-set route type to create if specific
    const canCreate = serviceType !== 'All'; // Simplified check

    const filteredRoutes = routes.filter(route => {
        // No filter dropdown, so we only filter by search
        const matchesSearch = !routeSearch ||
            (route.name && route.name.toLowerCase().includes(routeSearch.toLowerCase())) ||
            (route.id && route.id.toLowerCase().includes(routeSearch.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Your {serviceType} Routes</h2>
                <button
                    onClick={() => {
                        if (canCreate) {
                            setRouteTypeToCreate(serviceType.toLowerCase());
                            setFormMode('showRouteForm');
                        } else {
                            // If 'All', maybe show selector? But user asked for specific behavior.
                            // Assuming for now partners are 1 type predominantly.
                            setFormMode('selectType');
                        }
                    }}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105"
                >
                    + Add New Route
                </button>
            </div>

            {/* Modern Search Bar - No Filter Dropdown */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex items-center border border-gray-100">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                    type="text"
                    placeholder="Search your routes..."
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                    className="flex-grow bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
            </div>

            {/* If Form Mode is Active */}
            {(formMode === 'showRouteForm' || editingRoute) && (
                <PartnerRouteForm
                    onRouteSaved={handleRouteSaved}
                    editingRoute={editingRoute}
                    setEditingRoute={(route) => {
                        setEditingRoute(route);
                        if (route) setFormMode('showRouteForm');
                        else closeAllForms();
                    }}
                    routeType={editingRoute ? editingRoute.type : serviceType.toLowerCase()}
                    onCancel={closeAllForms}
                />
            )}

            {/* List View (Table) */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Route Name / ID</th>
                                <th className="px-6 py-4">Journey</th>
                                <th className="px-6 py-4">Schedule</th>
                                <th className="px-6 py-4 text-center">Stops</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRoutes.map((route) => (
                                <tr key={route._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{route.name}</div>
                                        <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1 rounded mt-1">{route.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                                            {route.startPoint} <span className="text-gray-400">→</span> {route.endPoint}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 capitalize text-indigo-600 font-semibold bg-indigo-50 inline-block px-2 py-0.5 rounded-full">{route.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{route.startTime}</div>
                                        <div className="text-xs text-gray-500">
                                            {route.scheduleType === 'daily' ? 'Daily' :
                                                route.scheduleType === 'weekly' ? (route.daysOfWeek || []).join(', ') :
                                                    new Date(route.specificDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md text-xs">{(route.stops || []).length}</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2">
                                        <button
                                            onClick={() => { setEditingRoute(route); setFormMode('showRouteForm'); }}
                                            disabled={isSubmitting}
                                            className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors font-medium text-xs flex items-center gap-1 border border-amber-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRoute(route._id)}
                                            disabled={isSubmitting}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium text-xs flex items-center gap-1 border border-red-200"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredRoutes.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No routes found.</p>
                    <button onClick={() => {
                        setRouteTypeToCreate(serviceType.toLowerCase());
                        setFormMode('showRouteForm');
                    }} className="mt-4 text-indigo-600 font-semibold hover:underline">Add your first route</button>
                </div>
            )}
        </div>
    );
};

export default PartnerRoutesTab;
