import React, { useState, useEffect, useCallback, useContext } from "react";
import { api } from "../utils/api.js";
import { AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import { DataContext } from "../context/Context.jsx";

// Tab Components
import TabButton from "../components/admin/TabButton.jsx";
import OverviewTab from "../components/admin/tabs/OverviewTab.jsx";
import RoutesTab from "../components/admin/tabs/RoutesTab.jsx";
import TripsTab from "../components/admin/tabs/TripsTab.jsx";
import AlertsTab from "../components/admin/tabs/AlertsTab.jsx";
import ParcelsTab from "../components/admin/tabs/ParcelsTab.jsx";
import ParkingTab from "../components/admin/tabs/ParkingTab.jsx";
import UsersTab from "../components/admin/tabs/UsersTab.jsx";
import BookingsTab from "../components/admin/tabs/BookingsTab.jsx";
import LocationsTab from "../components/admin/tabs/LocationsTab.jsx";
import PartnersTab from "../components/admin/tabs/PartnersTab.jsx"; // New Import

// API Endpoints
const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// --- FIX 1: Removed '/admin' from alerts URL ---
const ALERTS_API_URL = `${VITE_BACKEND_BASE_URL}/alerts`;
const TRIPS_API_URL = `${VITE_BACKEND_BASE_URL}/trips`;
const PARCELS_API_URL = `${VITE_BACKEND_BASE_URL}/parcels`;
const ROUTES_API_URL = `${VITE_BACKEND_BASE_URL}/routes`;
const RIDES_API_URL = `${VITE_BACKEND_BASE_URL}/rides`;
const PARKING_API_URL = `${VITE_BACKEND_BASE_URL}/parking`;
const USERS_API_URL = `${VITE_BACKEND_BASE_URL}/users/admin/users`;
const BOOKINGS_API_URL = `${VITE_BACKEND_BASE_URL}/bookings`;
const PARTNERS_API_URL = `${VITE_BACKEND_BASE_URL}/partners/admin/all`; // Base for fetching
const PARTNER_ACTION_URL = `${VITE_BACKEND_BASE_URL}/partners/admin`;   // Base for actions

const AdminDashboard = () => {
  const { user, loading: userLoading } = useContext(DataContext);
  const [alerts, setAlerts] = useState([]);
  const [editingAlert, setEditingAlert] = useState(null);
  const [trips, setTrips] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPartners, setAllPartners] = useState([]); // New Partner State
  const [parkingLots, setParkingLots] = useState([]);
  const [editingParking, setEditingParking] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [partnerPage, setPartnerPage] = useState(1);
  const [partnerTotalPages, setPartnerTotalPages] = useState(1);

  const [formMode, setFormMode] = useState('none');
  const [routeTypeToCreate, setRouteTypeToCreate] = useState(null);

  const [routeSearch, setRouteSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('All');

  const [bookingsData, setBookingsData] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    parcelBookings: 0,
    tripBookings: 0,
    carpoolRides: 0,
    activeRoutes: 0,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All'); // New Filter State

  const closeAllForms = () => {
    setFormMode('none');
    setEditingAlert(null);
    setEditingTrip(null);
    setEditingRoute(null);
    setEditingParking(null);
    setRouteTypeToCreate(null);
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return 'Sun';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Sun'; // Handle invalid date
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

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

    // --- FIX 2: Added safety check for p.createdAt ---
    if (Array.isArray(parcels)) {
      parcels.forEach(p => {
        if (p && p.createdAt) {
          const day = getDayOfWeek(p.createdAt);
          if (bookings[day]) bookings[day].parcels += 1;
        }
      });
    }

    return Object.keys(bookings).map(day => ({ date: day, ...bookings[day] }));
  };

  const fetchAllData = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      console.log("Fetching Admin Data..."); // Debugging Log

      const results = await Promise.allSettled([
        api.get(ALERTS_API_URL),
        api.get(TRIPS_API_URL),
        api.get(`${PARCELS_API_URL}/all`),
        api.get(ROUTES_API_URL),
        api.get(RIDES_API_URL),
        api.get(PARKING_API_URL),
        api.get(`${USERS_API_URL}?page=${page}`),
        api.get(BOOKINGS_API_URL),
        api.get(`${PARTNERS_API_URL}?page=${page}`), // Fetch Partners
      ]);

      const [alertsRes, tripsRes, parcelsRes, routesRes, ridesRes, parkingRes, usersRes, bookingsRes, partnersRes] = results;

      // Log errors if any request failed
      results.forEach((res, index) => {
        if (res.status === 'rejected') {
          console.error(`Request ${index} failed:`, res.reason);
        }
      });

      const errors = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason.message || 'An unknown error occurred during fetch.');

      if (errors.length > 0) {
        console.error("Admin Dashboard Fetch Errors:", errors);
        // Optional: Don't show error immediately if partial data is available
        // setError(errors.join('\n')); 
      }

      setAlerts(alertsRes.status === 'fulfilled' ? (Array.isArray(alertsRes.value.data) ? alertsRes.value.data : []) : []);
      const tripsData = tripsRes.status === 'fulfilled' ? (Array.isArray(tripsRes.value.data) ? tripsRes.value.data : tripsRes.value.data?.data || []) : [];
      setTrips(tripsData);

      const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data?.users || [] : [];
      setAllUsers(usersData);
      setCurrentPage(usersRes.status === 'fulfilled' ? usersRes.value.data?.currentPage || 1 : 1);
      setTotalPages(usersRes.status === 'fulfilled' ? usersRes.value.data?.totalPages || 1 : 1);

      const partnersData = partnersRes.status === 'fulfilled' ? partnersRes.value.data?.partners || [] : [];
      setAllPartners(partnersData);
      setPartnerPage(partnersRes.status === 'fulfilled' ? partnersRes.value.data?.currentPage || 1 : 1);
      setPartnerTotalPages(partnersRes.status === 'fulfilled' ? partnersRes.value.data?.totalPages || 1 : 1);

      const parcelsData = parcelsRes.status === 'fulfilled' ? (Array.isArray(parcelsRes.value.data) ? parcelsRes.value.data : []) : [];
      setParcels(parcelsData);
      const routesData = routesRes.status === 'fulfilled' ? (Array.isArray(routesRes.value.data) ? routesRes.value.data : []) : [];
      setRoutes(routesData);
      const parkingData = parkingRes.status === 'fulfilled' ? (Array.isArray(parkingRes.value.data) ? parkingRes.value.data : []) : [];
      setParkingLots(parkingData);
      const ridesData = ridesRes.status === 'fulfilled' ? ridesRes.value.data : [];
      const bookingsData = bookingsRes.status === 'fulfilled' ? (Array.isArray(bookingsRes.value.data) ? bookingsRes.value.data : []) : [];
      setAllBookings(bookingsData);

      setBookingsData(processBookingsData(parcelsData, tripsData, ridesData));

      const parcelRevenue = parcelsData.reduce((sum, p) => sum + (p.fare || 0), 0);
      const tripRevenue = bookingsData.filter(b => b.bookingType !== 'Parcel').reduce((sum, b) => sum + (b.fare || 0), 0);

      setStats({
        totalRevenue: parcelRevenue + tripRevenue,
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data?.totalUsers || 0 : 0,
        totalPartners: partnersRes.status === 'fulfilled' ? partnersRes.value.data?.totalPartners || 0 : 0, // ADDED
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
  }, [fetchAllData]);

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
      setTrips(currentTrips => currentTrips.map(t => t._id === savedTrip._id ? savedTrip : t));
    } else {
      setTrips(currentTrips => [savedTrip, ...currentTrips]);
    }
    fetchAllData();
    setEditingTrip(null);
  }, [trips, fetchAllData]);

  const handleRouteSaved = useCallback((savedRoute) => {
    const isEditing = routes.some(r => r._id === savedRoute._id);
    if (isEditing) {
      setRoutes(currentRoutes => currentRoutes.map(r => r._id === savedRoute._id ? savedRoute : r));
    } else {
      setRoutes(currentRoutes => [savedRoute, ...currentRoutes]);
    }
    fetchAllData();
    setEditingRoute(null);
  }, [routes, fetchAllData]);

  const handleParkingSaved = useCallback((savedParking) => {
    const isEditing = parkingLots.some(p => p._id === savedParking._id);
    if (isEditing) {
      setParkingLots(currentLots => currentLots.map(p => p._id === savedParking._id ? savedParking : p));
    } else {
      setParkingLots(currentLots => [savedParking, ...currentLots]);
    }
    fetchAllData();
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
  }, [fetchAllData]);

  const handleToggleAdmin = useCallback(async (userToUpdate) => {
    if (window.confirm(`Are you sure you want to ${userToUpdate.is_admin ? 'demote' : 'promote'} ${userToUpdate.name}?`)) {
      try {
        const newAdminStatus = !userToUpdate.is_admin;
        setIsSubmitting(true);
        setError('');
        await api.patch(`${USERS_API_URL}/${userToUpdate._id}`, { is_admin: newAdminStatus });
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

  const handleTogglePartnerStatus = useCallback(async (partner) => {
    const action = partner.is_frozen ? 'activate' : 'freeze';
    if (window.confirm(`Are you sure you want to ${action} ${partner.name}?`)) {
      try {
        setIsSubmitting(true);
        setError('');
        await api.patch(`${PARTNER_ACTION_URL}/${partner._id}/status`);
        setAllPartners(currentPartners =>
          currentPartners.map(p => p._id === partner._id ? { ...p, is_frozen: !p.is_frozen } : p)
        );
        fetchAllData(currentPage);
      } catch (error) {
        console.error("Failed to toggle partner status:", error);
        setError(error.response?.data?.error || `Failed to ${action} partner.`);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [fetchAllData, currentPage]);

  // Revenue Data Calculation
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
        return (
          <RoutesTab
            routes={routes}
            formMode={'none'} // FORCE NONE: Admin cannot add routes anymore
            setFormMode={() => { }} // No-op
            routeTypeToCreate={null}
            setRouteTypeToCreate={() => { }}
            editingRoute={editingRoute}
            setEditingRoute={setEditingRoute}
            closeAllForms={closeAllForms}
            handleRouteSaved={handleRouteSaved}
            routeSearch={routeSearch}
            setRouteSearch={setRouteSearch}
            routeFilter={routeFilter}
            setRouteFilter={setRouteFilter}
            handleDeleteRoute={handleDeleteRoute}
            isSubmitting={isSubmitting}
            readOnly={true}
          />
        );
      case 'trips':
        return (
          <TripsTab
            trips={trips}
            formMode={formMode}
            setFormMode={setFormMode}
            editingTrip={editingTrip}
            setEditingTrip={setEditingTrip}
            closeAllForms={closeAllForms}
            handleTripSaved={handleTripSaved}
            handleDeleteTrip={handleDeleteTrip}
            isSubmitting={isSubmitting}
          />
        );
      case 'alerts':
        return (
          <AlertsTab
            alerts={alerts}
            editingAlert={editingAlert}
            setEditingAlert={setEditingAlert}
            fetchAllData={fetchAllData}
            handleToggleAlertStatus={handleToggleAlertStatus}
            handleDeleteAlert={handleDeleteAlert}
            isSubmitting={isSubmitting}
          />
        );
      case 'parcels':
        return (
          <ParcelsTab
            parcels={parcels}
            loading={loading}
            handleUpdateParcel={handleUpdateParcel}
          />
        );
      case 'parking':
        return (
          <ParkingTab
            parkingLots={parkingLots}
            formMode={'none'} // FORCE NONE
            setFormMode={() => { }}
            editingParking={editingParking}
            setEditingParking={setEditingParking}
            closeAllForms={closeAllForms}
            handleParkingSaved={handleParkingSaved}
            handleDeleteParkingLot={handleDeleteParkingLot}
            isSubmitting={isSubmitting}
            readOnly={true}
          />
        );
      case 'users':
        return (
          <UsersTab
            allUsers={allUsers}
            loading={loading}
            handleToggleAdmin={handleToggleAdmin}
            isSubmitting={isSubmitting}
            currentPage={currentPage}
            totalPages={totalPages}
            fetchAllData={fetchAllData}
          />
        );
      case 'partners':
        return (
          <PartnersTab
            allPartners={allPartners}
            loading={loading}
            handleTogglePartnerStatus={handleTogglePartnerStatus}
            isSubmitting={isSubmitting}
            currentPage={partnerPage}
            totalPages={partnerTotalPages}
            fetchAllData={fetchAllData}
            partnerFilter={partnerFilter}       // Pass Filter
            setPartnerFilter={setPartnerFilter} // Pass Setter
          />
        );
      case 'bookings':
        return (
          <BookingsTab
            allBookings={allBookings}
            loading={loading}
            bookingFilter={bookingFilter}
            setBookingFilter={setBookingFilter}
          />
        );
      case 'locations':
        return <LocationsTab />;
      case 'overview':
      default:
        return (
          <OverviewTab
            stats={stats}
            revenueData={revenueData}
            bookingsData={bookingsData}
            routes={routes}
            trips={trips}
            parcels={parcels}
            allBookings={allBookings}
            setActiveTab={setActiveTab}
            setEditingRoute={setEditingRoute}
            setEditingTrip={setEditingTrip}
            setFormMode={setFormMode}
            error={error}
          />
        );
    }
  };

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

              <div className="bg-white rounded-lg shadow p-2 mb-8 flex space-x-2 overflow-x-auto">
                <TabButton tabName="overview" label="Overview" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="routes" label="Transport" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="trips" label="Bookable Trips" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="parcels" label="Parcels" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="bookings" label="Bookings" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="parking" label="Parking" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="locations" label="Locations" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="alerts" label="Alerts" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="users" label="Users" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                <TabButton tabName="partners" label="Partners" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
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
  );
};

export default AdminDashboard;