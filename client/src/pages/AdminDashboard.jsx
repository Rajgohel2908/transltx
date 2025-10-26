import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, DollarSign, Users, Package, Map } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// API Endpoints
const ALERTS_API_URL = "http://localhost:4000/api/admin/alerts";
const TRIPS_API_URL = "http://localhost:4000/api/trips";
const PARCELS_API_URL = "http://localhost:4000/api/parcels";
const ROUTES_API_URL = "http://localhost:4000/api/routes";
const RIDES_API_URL = "http://localhost:4000/api/rides";
const USERS_API_URL = "http://localhost:4000/api/users/admin/users"; // Correct admin endpoint

// --- Helper Components ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- Form for creating and editing alerts ---
const AlertForm = ({ onAlertSaved, editingAlert, setEditingAlert }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Info");
  const [error, setError] = useState("");

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
      if (editingAlert) {
        await axios.put(`${ALERTS_API_URL}/${editingAlert._id}`, alertData);
      } else {
        await axios.post(ALERTS_API_URL, alertData);
      }
      onAlertSaved();
      setEditingAlert(null);
    } catch (err) {
      console.error("Alert save error:", err);
      setError(err.response?.data?.message || "Failed to save alert.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingAlert ? "Edit Alert" : "Create New Alert"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Alert Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <textarea
          placeholder="Alert Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows="3"
        ></textarea>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white"
        >
          <option value="Info">Info (Blue)</option>
          <option value="Warning">Warning (Yellow)</option>
          <option value="Critical">Critical (Red)</option>
        </select>
        <div className="flex gap-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingAlert ? "Save Changes" : "Create Alert"}
          </button>
          {editingAlert && (
            <button
              type="button"
              onClick={() => setEditingAlert(null)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

// --- Form for creating and editing trips ---
const TripForm = ({ onTripSaved, editingTrip, setEditingTrip }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [features, setFeatures] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTrip) {
      setName(editingTrip.name);
      setDescription(editingTrip.description);
      setDuration(editingTrip.duration);
      // Handle both numeric prices and string prices like "₹500.00"
      const priceValue = typeof editingTrip.price === 'string' ? editingTrip.price.replace(/[^0-9.]/g, '') : editingTrip.price;
      setPrice(priceValue);
      setImage(editingTrip.image);
      setFeatures(editingTrip.features.join(", "));
    } else {
      setName("");
      setDescription("");
      setDuration("");
      setPrice("");
      setImage("");
      setFeatures("");
    }
  }, [editingTrip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const tripData = {
      name,
      description,
      duration,
      price: parseFloat(price), // Send price as a number
      image,
      features: features.split(",").map((f) => f.trim()).filter(f => f),
    };
    try {
      let response;
      if (editingTrip) {
        response = await axios.put(`${TRIPS_API_URL}/${editingTrip._id}`, tripData);
      } else {
        response = await axios.post(TRIPS_API_URL, tripData);
      }
      // Pass the saved trip data from the response back to the parent
      onTripSaved(response.data.trip);
      setEditingTrip(null);
    } catch (err) {
      console.error("Trip save error:", err);
      setError(err.response?.data?.message || "Failed to save trip.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingTrip ? "Edit Trip" : "Create New Trip"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Trip Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" rows="2"></textarea>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Duration (e.g., 5 Days, 4 Nights)" value={duration} onChange={(e) => setDuration(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Features (comma-separated)" value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
        <div className="flex gap-4">
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            {editingTrip ? "Save Changes" : "Create Trip"}
          </button>
          {editingTrip && (
            <button type="button" onClick={() => setEditingTrip(null)} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

// --- Form for creating and editing routes ---
const RouteForm = ({ onRouteSaved, editingRoute, setEditingRoute }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("bus");
  const [color, setColor] = useState("#3B82F6");
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("22:00");
  const [frequency, setFrequency] = useState(15);
  const [stops, setStops] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingRoute) {
      setId(editingRoute.id);
      setName(editingRoute.name);
      setType(editingRoute.type);
      setColor(editingRoute.color);
      setStartTime(editingRoute.startTime);
      setEndTime(editingRoute.endTime);
      setFrequency(editingRoute.frequency);
      setStops(JSON.stringify(editingRoute.stops, null, 2));
    } else {
      setId("");
      setName("");
      setType("bus");
      setColor("#3B82F6");
      setStartTime("06:00");
      setEndTime("22:00");
      setFrequency(15);
      setStops("");
    }
  }, [editingRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Attempt to parse the stops JSON string
      let parsedStops;
      try {
        parsedStops = JSON.parse(stops);
        if (!Array.isArray(parsedStops)) {
          throw new Error("Stops data must be an array.");
        }
      } catch (jsonError) {
        setError("Invalid JSON format for stops. Please provide a valid JSON array.");
        return;
      }

      const routeData = {
        id, name, type, color, startTime, endTime, frequency,
        stops: parsedStops, // Send the parsed array
      };

      let response;
      if (editingRoute) {
        response = await axios.put(`${ROUTES_API_URL}/${editingRoute._id}`, routeData);
      } else {
        response = await axios.post(ROUTES_API_URL, routeData);
      }
      // Pass the saved route data from the response back to the parent
      onRouteSaved(response.data.route);
      setEditingRoute(null);
    } catch (err) {
      console.error("Route save error:", err);
      setError(err.response?.data?.message || "Failed to save route.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {editingRoute ? "Edit Route" : "Create New Route"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Route ID (e.g., bus-101)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Route Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
          >
            <option value="bus">Bus</option>{" "}
            <option value="metro">Metro</option>{" "}
            <option value="car">Car</option>{" "}
            <option value="cycle">Cycle</option>
          </select>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-12 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <textarea
          placeholder="Stops (Paste JSON Array here)"
          value={stops}
          onChange={(e) => setStops(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
          rows="5"
        ></textarea>
        <div className="flex gap-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingRoute ? "Save Changes" : "Create Route"}
          </button>
          {editingRoute && (
            <button
              type="button"
              onClick={() => setEditingRoute(null)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

// --- Component to manage a single parcel ---
const ParcelManagerCard = ({ parcel, onUpdate }) => {
  const [status, setStatus] = useState(parcel.status);
  const [adminTag, setAdminTag] = useState(parcel.adminTag);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(parcel._id, { status, adminTag });
      console.log("hello")
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
          User: {parcel.user.name} ({parcel.user.email})
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

// --- Main Admin Dashboard Page ---
const AdminDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [editingAlert, setEditingAlert] = useState(null);
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // State for the user list
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookingsData, setBookingsData] = useState([]); // New state for chart data
  const [error, setError] = useState('');
  // State for new dashboard stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    parcelBookings: 0,
    tripBookings: 0, // Assuming a way to track this
    carpoolRides: 0,
    activeRoutes: 0,
  });

  // Helper to get day of the week
  const getDayOfWeek = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(date).getDay()];
  };

  // Helper to process data for the bookings chart
  const processBookingsData = (parcels, trips, rides) => {
    const bookings = {
      Sun: { parcels: 0, trips: 0, carpools: 0 },
      Mon: { parcels: 0, trips: 0, carpools: 0 },
      Tue: { parcels: 0, trips: 0, carpools: 0 },
      Wed: { parcels: 0, trips: 0, carpools: 0 },
      Thu: { parcels: 0, trips: 0, carpools: 0 },
      Fri: { parcels: 0, trips: 0, carpools: 0 },
      Sat: { parcels: 0, trips: 0, carpools: 0 },
    };

    parcels.forEach(p => {
      const day = getDayOfWeek(p.createdAt);
      if (bookings[day]) bookings[day].parcels += 1;
    });
    // Assuming trips and rides also have a 'createdAt' field
    // trips.forEach(t => {
    //   const day = getDayOfWeek(t.createdAt);
    //   if (bookings[day]) bookings[day].trips += 1;
    // });
    // rides.forEach(r => {
    //   const day = getDayOfWeek(r.createdAt);
    //   if (bookings[day]) bookings[day].carpools += 1;
    // });

    return Object.keys(bookings).map(day => ({ date: day, ...bookings[day] }));
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const token = localStorage.getItem("token");
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const [alertsRes, tripsRes, parcelsRes, routesRes, ridesRes, usersRes] = await Promise.all([
        axios.get(ALERTS_API_URL).catch(() => ({ data: [] })),
        axios.get(TRIPS_API_URL).catch(() => ({ data: [] })),
        axios.get(`${PARCELS_API_URL}/all`).catch(() => ({ data: [] })),
        axios.get(ROUTES_API_URL).catch(() => ({ data: [] })),
        axios.get(RIDES_API_URL).catch(() => ({ data: [] })),
        // Use the secure admin endpoint for users
        axios.get(USERS_API_URL, authHeaders).catch(() => ({ data: { users: [], totalUsers: 0 } })),
      ]);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
      // Correctly handle both flat array and nested { data: [...] } responses
      const tripsData = Array.isArray(tripsRes.data) ? tripsRes.data : tripsRes.data?.data || [];
      setTrips(tripsData);
      // Safely set user data from the API response structure
      const usersData = usersRes.data?.users || [];
      setAllUsers(usersData);
      setParcels(Array.isArray(parcelsRes.data) ? parcelsRes.data : []);
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);

      // Process and set the real data for the bookings chart
      setBookingsData(processBookingsData(parcelsRes.data, tripsData, ridesRes.data));

      // Calculate stats
      const parcelRevenue = parcelsRes.data.reduce((sum, p) => sum + (p.fare || 0), 0);
      // Assuming trip price is a number, not a string like '$149'
      const tripRevenue = 0; // Placeholder until trip booking is implemented

      setStats({
        totalRevenue: parcelRevenue + tripRevenue,
        totalUsers: usersRes.data?.totalUsers || 0,
        parcelBookings: parcelsRes.data?.length || 0,
        tripBookings: 0, // Placeholder
        carpoolRides: ridesRes.data?.length || 0,
        activeRoutes: routesRes.data?.length || 0,
      });

    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setError(error.response?.data?.error || 'Failed to fetch data. You may not have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleToggleAlertStatus = useCallback(async (alert) => {
    const newStatus = alert.status === "active" ? "inactive" : "active";
    try {
      await axios.patch(`${ALERTS_API_URL}/${alert._id}/status`, {
        status: newStatus,
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to toggle alert status:", error);
    }
  }, []);

  const handleDeleteAlert = useCallback(async (alertId) => {
    if (
      window.confirm("Are you sure you want to permanently delete this alert?")
    ) {
      try {
        await axios.delete(`${ALERTS_API_URL}/${alertId}`);
        fetchAllData();
      } catch (error) {
        console.error("Failed to delete alert:", error);
      }
    }
  }, []);

  const handleTripSaved = useCallback((savedTrip) => {
    const isEditing = trips.some(t => t._id === savedTrip._id);
    if (isEditing) {
      // Update existing trip in the local state
      setTrips(currentTrips => currentTrips.map(t => t._id === savedTrip._id ? savedTrip : t));
    } else {
      // Add new trip to the local state
      setTrips(currentTrips => [savedTrip, ...currentTrips]);
    }
    setEditingTrip(null);
  }, [trips]);

  const handleRouteSaved = useCallback((savedRoute) => {
    const isEditing = routes.some(r => r._id === savedRoute._id);
    if (isEditing) {
      // Update existing route in the local state
      setRoutes(currentRoutes => currentRoutes.map(r => r._id === savedRoute._id ? savedRoute : r));
    } else {
      // Add new route to the local state
      setRoutes(currentRoutes => [savedRoute, ...currentRoutes]);
    }
    setEditingRoute(null);
  }, [routes]);

  const handleDeleteTrip = useCallback(async (tripId) => {
    if (
      window.confirm("Are you sure you want to permanently delete this trip?")
    ) {
        try {
            await axios.delete(`${TRIPS_API_URL}/${tripId}`);
            // Optimistic UI update: remove the trip from the local state
            setTrips(currentTrips => currentTrips.filter(t => t._id !== tripId));
        } catch (error) {
            console.error("Failed to delete trip:", error);
        }
    }
  }, []);

  const handleDeleteRoute = useCallback(async (routeId) => {
    if (
      window.confirm("Are you sure you want to permanently delete this route?")
    ) {
        try {
            await axios.delete(`${ROUTES_API_URL}/${routeId}`);
            // Optimistic UI update: remove the route from the local state
            setRoutes(currentRoutes => currentRoutes.filter(r => r._id !== routeId));
        } catch (error) {
            console.error("Failed to delete route:", error);
        }
    }
  }, []);
  const handleUpdateParcel = useCallback(async (parcelId, updateData) => {
    try {
      await axios.patch(`${PARCELS_API_URL}/${parcelId}/admin`, updateData);
      fetchAllData();
    } catch (error) {
      console.error("Failed to update parcel:", error);
      throw error;
    }
  }, []); // Empty dependency array means this function is created once and never changes

  const handleToggleAdmin = useCallback(async (userToUpdate) => {
    if (window.confirm(`Are you sure you want to ${userToUpdate.is_admin ? 'demote' : 'promote'} ${userToUpdate.name}?`)) {
      try {
        const token = localStorage.getItem("token");
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        const newAdminStatus = !userToUpdate.is_admin;

        await axios.patch(`${USERS_API_URL}/${userToUpdate._id}`, { is_admin: newAdminStatus }, authHeaders);

        // Update the user in the local state for an immediate UI update
        setAllUsers(currentUsers =>
          currentUsers.map(user => user._id === userToUpdate._id ? { ...user, is_admin: newAdminStatus } : user)
        );
      } catch (error) {
        console.error("Failed to toggle admin status:", error);
        setError(error.response?.data?.error || 'Failed to update user status.');
      }
    }
  }, []);


  const getPriorityColor = (priority) => {
    if (priority === "Critical") return "border-red-500";
    if (priority === "Warning") return "border-yellow-500";
    return "border-blue-500";
  };

  const [activeTab, setActiveTab] = useState('overview');

  const revenueData = [
    { name: 'Parcels', revenue: stats.totalRevenue },
    { name: 'Trips', revenue: 0 }, // Placeholder
    { name: 'Carpool', revenue: 0 }, // Placeholder
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'routes':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Routes</h2>
            <RouteForm onRouteSaved={handleRouteSaved} editingRoute={editingRoute} setEditingRoute={setEditingRoute} />
            <div className="space-y-4">
              {routes.map((route) => (
                <div key={route._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg" style={{ color: route.color }}>{route.name}</p>
                    <p className="text-gray-600 text-sm">{route.stops.length} stops, every {route.frequency} mins</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditingRoute(route)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Edit</button>
                    <button onClick={() => handleDeleteRoute(route._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'trips':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Trips</h2>
            <TripForm onTripSaved={handleTripSaved} editingTrip={editingTrip} setEditingTrip={setEditingTrip} />
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div><p className="font-bold text-lg">{trip.name}</p></div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditingTrip(trip)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Edit</button>
                    <button onClick={() => handleDeleteTrip(trip._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Service Alerts</h2>
            <AlertForm onAlertSaved={fetchAllData} editingAlert={editingAlert} setEditingAlert={setEditingAlert} />
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getPriorityColor(alert.priority)}`}>
                  <p className="font-bold">{alert.title} <span className={`text-xs font-semibold ml-2 px-2 py-0.5 rounded-full ${alert.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{alert.status}</span></p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleToggleAlertStatus(alert)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-lg text-xs">Toggle Status</button>
                    <button onClick={() => setEditingAlert(alert)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded-lg text-xs">Edit</button>
                    <button onClick={() => handleDeleteAlert(alert._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-xs">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'parcels':
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
      case 'users':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Is Admin</th>
                    <th className="p-4 font-semibold">Joined On</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {user.is_admin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          className={`font-bold py-1 px-3 rounded-lg text-xs text-white transition-colors ${user.is_admin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                          {user.is_admin ? 'Demote' : 'Promote'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return (
          <>
            {error && (
              <div className="flex items-center justify-center p-4 mb-6 bg-red-100 text-red-700 rounded-lg">
                <AlertCircle className="mr-2" /> {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-6 w-6 text-green-600" />} color="bg-green-100" />
              <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6 text-blue-600" />} color="bg-blue-100" />
              <StatCard title="Parcel Bookings" value={stats.parcelBookings} icon={<Package className="h-6 w-6 text-orange-600" />} color="bg-orange-100" />
              <StatCard title="Active Routes" value={stats.activeRoutes} icon={<Map className="h-6 w-6 text-purple-600" />} color="bg-purple-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Service</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings This Week (Sample)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="parcels" stroke="#8884d8" />
                    <Line type="monotone" dataKey="trips" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="carpools" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Routes and Trips Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Recent Routes */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recently Added Routes</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {routes.slice(0, 5).map(route => (
                    <div key={route._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold" style={{ color: route.color }}>{route.name}</p>
                        <p className="text-sm text-gray-500">{route.stops.length} stops</p>
                      </div>
                      <button onClick={() => { setActiveTab('routes'); setEditingRoute(route); }} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200">Edit</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Trips */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Available Trips</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {trips.slice(0, 5).map(trip => (
                    <div key={trip._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{trip.name}</p>
                        <p className="text-sm text-gray-500">{trip.price}</p>
                      </div>
                      <button onClick={() => { setActiveTab('trips'); setEditingTrip(trip); }} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200">Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  const TabButton = ({ tabName, label, currentTab, setTab }) => (
    <button
      onClick={() => setTab(tabName)}
      className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
        currentTab === tabName
          ? 'bg-blue-600 text-white shadow'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-gray-500 mb-8">Welcome back, Admin! Here's your overview.</p>

          <div className="bg-white rounded-lg shadow p-2 mb-8 flex space-x-2">
            <TabButton tabName="overview" label="Overview" currentTab={activeTab} setTab={setActiveTab} />
            <TabButton tabName="routes" label="Routes" currentTab={activeTab} setTab={setActiveTab} />
            <TabButton tabName="trips" label="Trips" currentTab={activeTab} setTab={setActiveTab} />
            <TabButton tabName="parcels" label="Parcels" currentTab={activeTab} setTab={setActiveTab} />
            <TabButton tabName="alerts" label="Alerts" currentTab={activeTab} setTab={setActiveTab} />
            <TabButton tabName="users" label="Users" currentTab={activeTab} setTab={setActiveTab} />
          </div>

          <div className="mt-8">
            {loading ? <p className="text-center">Loading dashboard data...</p> : renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
