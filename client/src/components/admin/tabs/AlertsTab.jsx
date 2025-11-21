import React from 'react';
import AlertForm from '../../../pages/forms/AlertForm';

const AlertsTab = ({ alerts, editingAlert, setEditingAlert, fetchAllData, handleToggleAlertStatus, handleDeleteAlert, isSubmitting }) => {

    const getPriorityColor = (priority) => {
        if (priority === "Critical") return "border-red-500";
        if (priority === "Warning") return "border-yellow-500";
        return "border-blue-500";
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Service Alerts</h2>
            <AlertForm onAlertSaved={fetchAllData} editingAlert={editingAlert} setEditingAlert={setEditingAlert} />
            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert._id} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getPriorityColor(alert.priority)}`}>
                        <p className="font-bold">{alert.title} <span className={`text-xs font-semibold ml-2 px-2 py-0.5 rounded-full ${alert.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{alert.status}</span></p>
                        <div className="flex gap-2 mt-2" style={{ minWidth: '250px' }}>
                            <button onClick={() => handleToggleAlertStatus(alert)} disabled={isSubmitting} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-lg text-xs disabled:opacity-50">{isSubmitting ? '...' : 'Toggle Status'}</button>
                            <button onClick={() => setEditingAlert(alert)} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded-lg text-xs disabled:opacity-50">Edit</button>
                            <button onClick={() => handleDeleteAlert(alert._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-xs disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsTab;
