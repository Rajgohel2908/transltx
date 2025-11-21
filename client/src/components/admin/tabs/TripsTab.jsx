import React from 'react';
import TripForm from '../../../pages/forms/TripForm';

const TripsTab = ({ trips, formMode, setFormMode, editingTrip, setEditingTrip, closeAllForms, handleTripSaved, handleDeleteTrip, isSubmitting }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Available Trips</h2>
                <button onClick={() => setFormMode('showTripForm')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Add New Trip
                </button>
            </div>
            {formMode === 'showTripForm' && (
                <TripForm
                    onTripSaved={handleTripSaved}
                    editingTrip={editingTrip}
                    setEditingTrip={(trip) => {
                        setEditingTrip(trip);
                        if (trip) setFormMode('showTripForm');
                        else closeAllForms();
                    }}
                />
            )}
            <div className="space-y-4">
                {trips.map((trip) => (
                    <div key={trip._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                        <div><p className="font-bold text-lg">{trip.name}</p></div>
                        <div className="flex gap-2 flex-shrink-0" style={{ minWidth: '150px' }}>
                            <button onClick={() => { setEditingTrip(trip); setFormMode('showTripForm'); }} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
                                Edit
                            </button>
                            <button onClick={() => handleDeleteTrip(trip._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripsTab;
