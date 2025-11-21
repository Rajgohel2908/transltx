import React from 'react';
import RouteTypeSelector from '../RouteTypeSelector';
import RouteFilters from '../RouteFilters';
import RouteForm from '../../../pages/forms/RouteForm';

const RoutesTab = ({
    routes,
    formMode,
    setFormMode,
    routeTypeToCreate,
    setRouteTypeToCreate,
    editingRoute,
    setEditingRoute,
    closeAllForms,
    handleRouteSaved,
    routeSearch,
    setRouteSearch,
    routeFilter,
    setRouteFilter,
    handleDeleteRoute,
    isSubmitting
}) => {

    const filteredRoutes = routes.filter(route => {
        const matchesFilter = routeFilter === 'All' || (route.type && route.type.toLowerCase() === routeFilter.toLowerCase());
        const matchesSearch = !routeSearch ||
            (route.name && route.name.toLowerCase().includes(routeSearch.toLowerCase())) ||
            (route.id && route.id.toLowerCase().includes(routeSearch.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Transport Routes</h2>
                <button onClick={() => setFormMode('selectType')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Add New Transport Route
                </button>
            </div>

            {formMode === 'selectType' && (
                <RouteTypeSelector
                    setRouteTypeToCreate={setRouteTypeToCreate}
                    setEditingRoute={setEditingRoute}
                    setFormMode={setFormMode}
                    closeAllForms={closeAllForms}
                />
            )}

            {formMode === 'showRouteForm' && (
                <RouteForm
                    onRouteSaved={handleRouteSaved}
                    editingRoute={editingRoute}
                    setEditingRoute={(route) => {
                        setEditingRoute(route);
                        if (route) setFormMode('showRouteForm');
                        else closeAllForms();
                    }}
                    routeType={editingRoute ? editingRoute.type : routeTypeToCreate}
                />
            )}

            <RouteFilters
                routeSearch={routeSearch}
                setRouteSearch={setRouteSearch}
                routeFilter={routeFilter}
                setRouteFilter={setRouteFilter}
            />

            <div className="space-y-4">
                {filteredRoutes.map((route) => (
                    <div key={route._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg" style={{ color: route.color || '#3B82F6' }}>{route.name} <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full ml-2">{route.type || 'Bus'}</span></p>
                            {route.type === 'air' ? (
                                <p className="text-gray-600 text-sm">
                                    {route.airline} - Flight {route.flightNumber}
                                </p>
                            ) : (
                                <p className="text-gray-600 text-sm">{(route.stops || []).length} stops · ETA: {route.estimatedArrivalTime || route.endTime || 'N/A'}</p>
                            )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0" style={{ minWidth: '150px' }}>
                            <button onClick={() => { setEditingRoute(route); setFormMode('showRouteForm'); }} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
                                Edit
                            </button>
                            <button onClick={() => handleDeleteRoute(route._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                ))}
                {filteredRoutes.length === 0 && <p className="text-center text-gray-500">No routes match your filters.</p>}
            </div>
        </div>
    );
};

export default RoutesTab;
