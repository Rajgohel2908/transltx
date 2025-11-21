import React from 'react';
import ParcelManagerCard from '../ParcelManagerCard';

const ParcelsTab = ({ parcels, loading, handleUpdateParcel }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Parcel Orders</h2>
            {loading ? <p>Loading parcel orders...</p> : parcels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parcels.map((parcel) => <ParcelManagerCard key={parcel._id} parcel={parcel} onUpdate={handleUpdateParcel} />)}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center"><p className="text-gray-500">No pending parcel orders to manage.</p></div>
            )}
        </div>
    );
};

export default ParcelsTab;
