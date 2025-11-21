import React, { useState } from 'react';

const ParcelManagerCard = ({ parcel, onUpdate }) => {
    const [status, setStatus] = useState(parcel.status);
    const [adminTag, setAdminTag] = useState(parcel.adminTag);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(parcel._id, { status, adminTag });
        } catch (error) {
            console.error("Failed to update parcel", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 flex flex-col">
            <div className="flex-grow">
                <p className="font-bold text-lg">
                    {parcel.source} → {parcel.destination}
                </p>
                <p className="text-sm text-gray-500">
                    User: {parcel.user?.name || 'N/A'} ({parcel.user?.email || 'N/A'})
                </p>
                <p className="text-xs text-gray-400">Order ID: {parcel._id}</p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Update Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="in-transit">In-Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Tag / Message
                    </label>
                    <input
                        type="text"
                        value={adminTag}
                        onChange={(e) => setAdminTag(e.target.value)}
                        placeholder="e.g., Arriving in 15 mins"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
                {isSaving ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
};

export default ParcelManagerCard;
