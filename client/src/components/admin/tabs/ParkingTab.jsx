import React from 'react';
import ParkingForm from '../../../pages/forms/ParkingForm';

const ParkingTab = ({ parkingLots, formMode, setFormMode, editingParking, setEditingParking, closeAllForms, handleParkingSaved, handleDeleteParkingLot, isSubmitting, readOnly = false }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Available Parking Lots</h2>
                {!readOnly && (
                    <button onClick={() => setFormMode('showParkingForm')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Add New Parking Lot
                    </button>
                )}
            </div>
            {formMode === 'showParkingForm' && (
                <ParkingForm
                    onParkingSaved={handleParkingSaved}
                    editingParking={editingParking}
                    setEditingParking={(parking) => {
                        setEditingParking(parking);
                        if (parking) setFormMode('showParkingForm');
                        else closeAllForms();
                    }}
                />
            )}
            <div className="space-y-4">
                {parkingLots.map((lot) => (
                    <div key={lot._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg">{lot.name}</p>
                            <p className="text-gray-600 text-sm">{lot.location} - {lot.availableSlots}/{lot.totalSlots} available</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0" style={{ minWidth: '150px' }}>
                            {!readOnly && (
                                <button onClick={() => { setEditingParking(lot); setFormMode('showParkingForm'); }} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
                                    Edit
                                </button>
                            )}
                            <button onClick={() => handleDeleteParkingLot(lot._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParkingTab;
