import React, { useState, useEffect, useCallback, useContext } from "react";
import { api } from "../utils/api.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, DollarSign, Users, Package, Map, Ticket } from 'lucide-react';
import Footer from '../components/Footer';
import AlertForm from "./forms/AlertForm.jsx";
import TripForm from "./forms/TripForm.jsx";
import RouteForm from "./forms/RouteForm.jsx";
import ParkingForm from "./forms/ParkingForm.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import Pagination from "../components/Pagination.jsx";
import { DataContext } from "../context/Context.jsx";
// API Endpoints
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const ALERTS_API_URL = `${VITE_BACKEND_BASE_URL}/admin/alerts`;
const TRIPS_API_URL = `${VITE_BACKEND_BASE_URL}/trips`;
const PARCELS_API_URL = `${VITE_BACKEND_BASE_URL}/parcels`;
const ROUTES_API_URL = `${VITE_BACKEND_BASE_URL}/routes`;
const RIDES_API_URL = `${VITE_BACKEND_BASE_URL}/rides`;
const PARKING_API_URL = `${VITE_BACKEND_BASE_URL}/parking`;
const USERS_API_URL = `${VITE_BACKEND_BASE_URL}/users/admin/users`;
const BOOKINGS_API_URL = `${VITE_BACKEND_BASE_URL}/bookings`; // New endpoint for all bookings

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

// --- Main Admin Dashboard Page ---
const AdminDashboard = () => {
  const { user, loading: userLoading } = useContext(DataContext);
  const [alerts, setAlerts] = useState([]);
  const [editingAlert, setEditingAlert] = useState(null);
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // State for the user list
  const [parkingLots, setParkingLots] = useState([]);
  const [editingParking, setEditingParking] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTripForm, setShowTripForm] = useState(false);
  const [allBookings, setAllBookings] = useState([]); // State for all bookings
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For individual actions
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchAllData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const results = await Promise.allSettled([
        api.get(ALERTS_API_URL).catch(() => ({ data: [] })),
        api.get(TRIPS_API_URL).catch(() => ({ data: [] })),
        api.get(`${PARCELS_API_URL}/all`).catch(() => ({ data: [] })),
        api.get(ROUTES_API_URL).catch(() => ({ data: [] })),
        api.get(RIDES_API_URL).catch(() => ({ data: [] })),
        api.get(PARKING_API_URL).catch(() => ({ data: [] })),
        api.get(`${USERS_API_URL}?page=${page}`),
        api.get(BOOKINGS_API_URL).catch(() => ({ data: [] })),
      ]);

      const [alertsRes, tripsRes, parcelsRes, routesRes, ridesRes, parkingRes, usersRes, bookingsRes] = results;

      const errors = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason.message || 'An unknown error occurred during fetch.');
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }

      setAlerts(alertsRes.status === 'fulfilled' ? (Array.isArray(alertsRes.value.data) ? alertsRes.value.data : []) : []);
      const tripsData = tripsRes.status === 'fulfilled' ? (Array.isArray(tripsRes.value.data) ? tripsRes.value.data : tripsRes.value.data?.data || []) : [];
      setTrips(tripsData);
      const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data?.users || [] : [];
      setAllUsers(usersData);
      setCurrentPage(usersRes.status === 'fulfilled' ? usersRes.value.data?.currentPage || 1 : 1);
      setTotalPages(usersRes.status === 'fulfilled' ? usersRes.value.data?.totalPages || 1 : 1);
      const parcelsData = parcelsRes.status === 'fulfilled' ? (Array.isArray(parcelsRes.value.data) ? parcelsRes.value.data : []) : [];
      setParcels(parcelsData);
      const routesData = routesRes.status === 'fulfilled' ? (Array.isArray(routesRes.value.data) ? routesRes.value.data : []) : [];
      setRoutes(routesData);
      const parkingData = parkingRes.status === 'fulfilled' ? (Array.isArray(parkingRes.value.data) ? parkingRes.value.data : []) : [];
      setParkingLots(parkingData);
      const ridesData = ridesRes.status === 'fulfilled' ? ridesRes.value.data : [];
      const bookingsData = bookingsRes.status === 'fulfilled' ? (Array.isArray(bookingsRes.value.data) ? bookingsRes.value.data : []) : [];
      setAllBookings(bookingsData);

      // Process and set the real data for the bookings chart
      setBookingsData(processBookingsData(parcelsData, tripsData, ridesData));

      // Calculate stats
      const parcelRevenue = parcelsData.reduce((sum, p) => sum + (p.fare || 0), 0);
      // Assuming trip price is a number, not a string like '$149'
      const tripRevenue = bookingsData.filter(b => b.bookingType !== 'Parcel').reduce((sum, b) => sum + (b.fare || 0), 0);

      setStats({
        totalRevenue: parcelRevenue + tripRevenue,
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data?.totalUsers || 0 : 0,
        parcelBookings: parcelsData.length || 0,
        tripBookings: bookingsData.filter(b => b.bookingType !== 'Parcel').length,
        carpoolRides: ridesData?.length || 0,
        activeRoutes: routesData?.length || 0,
      });

    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setError(error.response?.data?.error || 'Failed to fetch data. You may not have admin privileges.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]); // This will run once on mount with the default page

  const handleToggleAlertStatus = useCallback(async (alert) => {
    const newStatus = alert.status === "active" ? "inactive" : "active";
    try {
      setIsSubmitting(true);
      setError('');
      await api.patch(`${ALERTS_API_URL}/${alert._id}/status`, {
        status: newStatus,
      });
      fetchAllData();
    } catch (error) {
      console.error("Failed to toggle alert status:", error);
      setError(error.response?.data?.message || "Failed to toggle alert status.");
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchAllData]);

  const handleDeleteAlert = useCallback((alertId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Alert',
      message: 'Are you sure you want to permanently delete this alert? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          setError('');
          await api.delete(`${ALERTS_API_URL}/${alertId}`);
          fetchAllData();
          setConfirmationModal({ isOpen: false });
        } catch (error) {
          console.error("Failed to delete alert:", error);
          setError(error.response?.data?.message || "Failed to delete alert.");
          setConfirmationModal({ isOpen: false });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }, [fetchAllData]);


  const handleTripSaved = useCallback((savedTrip) => {
    const isEditing = trips.some(t => t._id === savedTrip._id);
    if (isEditing) {
      // Update existing trip in the local state
      setTrips(currentTrips => currentTrips.map(t => t._id === savedTrip._id ? savedTrip : t));
    } else {
      // Add new trip to the local state
      setTrips(currentTrips => [savedTrip, ...currentTrips]);
    }
    fetchAllData(); // Re-fetch all data to ensure consistency
    setEditingTrip(null);
  }, [trips, fetchAllData]);

  const handleRouteSaved = useCallback((savedRoute) => {
    const isEditing = routes.some(r => r._id === savedRoute._id);
    if (isEditing) {
      // Update existing route in the local state
      setRoutes(currentRoutes => currentRoutes.map(r => r._id === savedRoute._id ? savedRoute : r));
    } else {
      // Add new route to the local state
      setRoutes(currentRoutes => [savedRoute, ...currentRoutes]);
    }
    fetchAllData(); // Re-fetch all data to ensure consistency
    setEditingRoute(null);
  }, [routes, fetchAllData]);

  const handleParkingSaved = useCallback((savedParking) => {
    const isEditing = parkingLots.some(p => p._id === savedParking._id);
    if (isEditing) {
      setParkingLots(currentLots => currentLots.map(p => p._id === savedParking._id ? savedParking : p));
    } else {
      setParkingLots(currentLots => [savedParking, ...currentLots]);
    }
    fetchAllData(); // Re-fetch all data to ensure consistency
    setEditingParking(null);
  }, [parkingLots, fetchAllData]);

  const handleDeleteTrip = useCallback((tripId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Trip',
      message: 'Are you sure you want to permanently delete this trip? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          setError('');
          await api.delete(`${TRIPS_API_URL}/${tripId}`);
          setTrips(currentTrips => currentTrips.filter(t => t._id !== tripId));
          setConfirmationModal({ isOpen: false });
        } catch (error) {
          console.error("Failed to delete trip:", error);
          setError(error.response?.data?.message || "Failed to delete trip.");
          setConfirmationModal({ isOpen: false });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }, []);

  const handleDeleteRoute = useCallback((routeId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Route',
      message: 'Are you sure you want to permanently delete this route? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          setError('');
          await api.delete(`${ROUTES_API_URL}/${routeId}`);
          fetchAllData();
          setConfirmationModal({ isOpen: false });
        } catch (error) {
          console.error("Failed to delete route:", error);
          setError(error.response?.data?.message || "Failed to delete route.");
          setConfirmationModal({ isOpen: false });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }, [fetchAllData]);

  const handleDeleteParkingLot = useCallback((parkingId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Parking Lot',
      message: 'Are you sure you want to permanently delete this parking lot? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          setError('');
          await api.delete(`${PARKING_API_URL}/${parkingId}`);
          setParkingLots(currentLots => currentLots.filter(p => p._id !== parkingId));
          setConfirmationModal({ isOpen: false });
        } catch (error) {
          console.error("Failed to delete parking lot:", error);
          setError(error.response?.data?.message || "Failed to delete parking lot.");
          setConfirmationModal({ isOpen: false });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  }, []);

  const handleUpdateParcel = useCallback(async (parcelId, updateData) => {
    try {
      await api.patch(`${PARCELS_API_URL}/${parcelId}/admin`, updateData);
      fetchAllData();
    } catch (error) {
      console.error("Failed to update parcel:", error);
      throw error;
    }
  }, [fetchAllData]); // Empty dependency array means this function is created once and never changes

  const handleToggleAdmin = useCallback(async (userToUpdate) => {
    if (window.confirm(`Are you sure you want to ${userToUpdate.is_admin ? 'demote' : 'promote'} ${userToUpdate.name}?`)) {
      try {
        const newAdminStatus = !userToUpdate.is_admin;
        setIsSubmitting(true);
        setError('');
        await api.patch(`${USERS_API_URL}/${userToUpdate._id}`, { is_admin: newAdminStatus });

        // Update the user in the local state for an immediate UI update
        setAllUsers(currentUsers =>
          currentUsers.map(user => user._id === userToUpdate._id ? { ...user, is_admin: newAdminStatus } : user)
        );
      } catch (error) {
        console.error("Failed to toggle admin status:", error);
        setError(error.response?.data?.error || 'Failed to update user status.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, []);


  const getPriorityColor = (priority) => {
    if (priority === "Critical") return "border-red-500";
    if (priority === "Warning") return "border-yellow-500";
    return "border-blue-500";
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('All');

  // Compute revenue breakdown from allBookings
  const parcelRevenue = (allBookings || []).filter(b => b.bookingType === 'Parcel').reduce((s, b) => s + (b.fare || 0), 0);
  const transportRevenue = (allBookings || []).filter(b => ['Bus', 'Train', 'Air', 'bus', 'train', 'air'].includes(b.bookingType)).reduce((s, b) => s + (b.fare || 0), 0);
  const ridesRevenue = (allBookings || []).filter(b => ['Ride', 'ride', 'Rides', 'rides', 'Carpool', 'carpool'].includes(b.bookingType)).reduce((s, b) => s + (b.fare || 0), 0);

  const revenueData = [
    { name: 'Parcels', revenue: parcelRevenue },
    { name: 'Transport', revenue: transportRevenue },
    { name: 'Rides', revenue: ridesRevenue },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'routes':
        return ( // This is now the "Transport" tab
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Manage Transport Routes</h2>
              <button onClick={() => setShowRouteForm(!showRouteForm)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                {showRouteForm ? 'Hide Form' : 'Add New Transport Route'}
              </button>
            </div>
            {showRouteForm && <RouteForm onRouteSaved={handleRouteSaved} editingRoute={editingRoute} setEditingRoute={setEditingRoute} />}
            <div className="space-y-4">
              {routes.map((route) => (
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
                    <button onClick={() => { setEditingRoute(route); setShowRouteForm(true); }} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteRoute(route._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'trips':
        return (
          <div>
            <div className="flex justify-between items-center mb-6"> 
              <h2 className="text-2xl font-bold text-gray-800">Available Trips</h2>
              <button onClick={() => setShowTripForm(!showTripForm)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                {showTripForm ? 'Hide Form' : 'Add New Trip'}
              </button>
            </div>
            {showTripForm && <TripForm onTripSaved={handleTripSaved} editingTrip={editingTrip} setEditingTrip={setEditingTrip} />}
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div><p className="font-bold text-lg">{trip.name}</p></div>
                  <div className="flex gap-2 flex-shrink-0" style={{ minWidth: '150px' }}>
                    <button onClick={() => { setEditingTrip(trip); setShowTripForm(true); }} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTrip(trip._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
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
      case 'parking':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Available Parking Lots</h2>
              <button onClick={() => setShowParkingForm(!showParkingForm)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                {showParkingForm ? 'Hide Form' : 'Add New Parking Lot'}
              </button>
            </div>
            {showParkingForm && <ParkingForm onParkingSaved={handleParkingSaved} editingParking={editingParking} setEditingParking={setEditingParking} />}
            <div className="space-y-4">
              {parkingLots.map((lot) => (
                <div key={lot._id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{lot.name}</p>
                    <p className="text-gray-600 text-sm">{lot.location} - {lot.availableSlots}/{lot.totalSlots} available</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0" style={{ minWidth: '150px' }}>
                    <button onClick={() => { setEditingParking(lot); setShowParkingForm(true); }} disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteParkingLot(lot._id)} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50">{isSubmitting ? '...' : 'Delete'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'users':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              {/* Placeholder for a search or filter bar */}
            </div>
            {loading ? (
              <p>Loading users...</p>
            ) : allUsers.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 break-all">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            disabled={isSubmitting}
                            className={`font-bold py-2 px-4 rounded-lg text-xs text-white transition-colors disabled:opacity-50 ${
                              user.is_admin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {isSubmitting ? 'Updating...' : (user.is_admin ? 'Demote' : 'Promote')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center"><p className="text-gray-500">No users found.</p></div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchAllData(page)} />
          </div>
        );
      case 'bookings':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Bookings</h2>
            <div className="flex items-center gap-3 mb-4">
              {['All','Bus','Train','Air','Trips','Parcel','Ride'].map((t) => (
                <button key={t} onClick={() => setBookingFilter(t)} className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {t}
                </button>
              ))}
            </div>

            {loading ? (
              <p>Loading bookings...</p>
            ) : (() => {
              const filtered = bookingFilter === 'All' ? allBookings : allBookings.filter(b => {
                if (!b.bookingType) return false;
                if (bookingFilter === 'Parcel') return String(b.bookingType).toLowerCase() === 'parcel';
                if (bookingFilter === 'Trips') return !['parcel','ride','carpool'].includes(String(b.bookingType).toLowerCase());
                return String(b.bookingType).toLowerCase() === String(bookingFilter).toLowerCase();
              });

              return filtered.length > 0 ? (
                <div className="space-y-4">
                  {filtered.map((booking) => (
                    <div key={booking._id} className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg">{booking.from} → {booking.to}</p>
                          <p className="text-sm text-gray-500">PNR: {booking.pnrNumber}</p>
                          <p className="text-sm text-gray-500">User: {booking.userId?.name || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{(booking.fare || 0).toLocaleString()}</p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>{booking.bookingStatus}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center"><p className="text-gray-500">No bookings match the selected filter.</p></div>
              );
            })()}
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
              <StatCard title="Trip Bookings" value={stats.tripBookings} icon={<Ticket className="h-6 w-6 text-purple-600" />} color="bg-purple-100" />
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
                        <p className="font-semibold" style={{ color: route.color || '#3B82F6' }}>{route.name}</p>
                        {route.type === 'air' ? (
                          <p className="text-sm text-gray-500">
                            {route.airline} - Flight {route.flightNumber}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">{(route.stops || []).length} stops</p>
                        )}
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
      {userLoading ? (
        <div className="flex justify-center items-center min-h-screen text-xl font-semibold">Loading user data...</div>
      ) : !user || !user.is_admin ? (
        <div className="flex justify-center items-center min-h-screen flex-col">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-lg text-gray-600">You do not have administrative privileges to view this page.</p>
        </div>
      ) : (
        <>
          <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={() => setConfirmationModal({ isOpen: false })}
            onConfirm={confirmationModal.onConfirm}
            title={confirmationModal.title}
            message={confirmationModal.message}
          />
          <div className="bg-gray-50 min-h-screen">
            <main className="container mx-auto px-4 py-12">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Admin Dashboard</h1>
              <p className="text-lg text-gray-500 mb-8">Welcome back, Admin! Here's your overview.</p>

              <div className="bg-white rounded-lg shadow p-2 mb-8 flex space-x-2">
                <TabButton tabName="overview" label="Overview" currentTab={activeTab} setTab={setActiveTab} />
                <TabButton tabName="routes" label="Transport" currentTab={activeTab} setTab={setActiveTab} />
                <TabButton tabName="trips" label="Bookable Trips" currentTab={activeTab} setTab={setActiveTab} />
                <TabButton tabName="parcels" label="Parcels" currentTab={activeTab} setTab={setActiveTab} />
                <TabButton tabName="bookings" label="Bookings" currentTab={activeTab} setTab={setActiveTab} />
                <TabButton tabName="parking" label="Parking" currentTab={activeTab} setTab={setActiveTab} />
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
      )}
    </>
  )
};

export default AdminDashboard;
