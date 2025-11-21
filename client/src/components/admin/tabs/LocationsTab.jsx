import React from 'react';
import LocationForm from '../../../pages/forms/LocationForm';

const LocationsTab = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Locations</h2>
            <LocationForm />
        </div>
    );
};

export default LocationsTab;
