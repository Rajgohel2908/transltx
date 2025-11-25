import React, { useState, useEffect } from "react";
import { api } from "../../utils/api.js";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const ALERTS_API_URL = `${VITE_BACKEND_BASE_URL}/admin/alerts`;

const AlertForm = ({ onAlertSaved, editingAlert, setEditingAlert }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Info");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAlert) {
      setTitle(editingAlert.title);
      setMessage(editingAlert.message);
      setPriority(editingAlert.priority);
    } else {
      setTitle("");
      setMessage("");
      setPriority("Info");
    }
  }, [editingAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const alertData = { title, message, priority };

    try {
      setIsSubmitting(true);
      if (editingAlert) {
        await api.put(`/alerts/${editingAlert._id}`, alertData);
      } else {
        await api.post(`/alerts`, alertData);
      }
      onAlertSaved();
      setEditingAlert(null);
    } catch (err) {
      console.error("Alert save error:", err);
      setError(err.response?.data?.message || "Failed to save alert.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingAlert ? "Edit Alert" : "Create New Alert"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Alert Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <textarea placeholder="Alert Message" value={message} onChange={(e) => setMessage(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" rows="3"></textarea>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
          <option value="Info">Info (Blue)</option>
          <option value="Warning">Warning (Yellow)</option>
          <option value="Critical">Critical (Red)</option>
        </select>
        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? "Saving..." : (editingAlert ? "Save Changes" : "Create Alert")}
          </button>
          {editingAlert && (
            <button type="button" onClick={() => setEditingAlert(null)} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

export default AlertForm;