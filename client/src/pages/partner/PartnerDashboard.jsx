import React, { useState, useEffect, useCallback, useContext } from "react";
import { api } from "../../utils/api.js";
import { DataContext } from "../../context/Context.jsx";
import Footer from '../../components/Footer';
import TabButton from "../../components/admin/TabButton.jsx";
import PartnerRoutesTab from "../../components/partner/tabs/PartnerRoutesTab.jsx";
import ParkingTab from "../../components/admin/tabs/ParkingTab.jsx";
import DriverTab from "../../components/partner/tabs/DriverTab.jsx"; // Import DriverTab
import { Briefcase, DollarSign, Activity } from 'lucide-react';

import RevenueGraph from "../../components/partner/RevenueGraph.jsx";
import PartnerBookingsList from "../../components/partner/tabs/PartnerBookingsList.jsx";

const PartnerDashboard = () => {
    const { user } = useContext(DataContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data State
    const [myRoutes, setMyRoutes] = useState([]);
    const [myParking, setMyParking] = useState([]);
    const [earnings, setEarnings] = useState(0);

    // Form State
    const [formMode, setFormMode] = useState('none');
    const [routeTypeToCreate, setRouteTypeToCreate] = useState(null);
    const [editingRoute, setEditingRoute] = useState(null);
    const [editingParking, setEditingParking] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters (Required props for Tabs)
    const [routeSearch, setRouteSearch] = useState('');
    const [routeFilter, setRouteFilter] = useState('All');

    const closeAllForms = () => {
        setFormMode('none');
        setEditingRoute(null);
        setEditingParking(null);
        setRouteTypeToCreate(null);
    };

    const fetchPartnerData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch routes and parking for managing items
            // Stats and bookings are fetched inside their own components now for better performance
            const [routesRes, parkingRes] = await Promise.all([
                api.get('/routes'),
                api.get('/parking')
            ]);

            // Filter for items owned by this partner
            // Strictly backend should handle this, keeping client-side filter as fallback/legacy support
            const partnerRoutes = (routesRes.data || []).filter(r => r.partner === user._id || r.operator === user.partnerDetails?.companyName);
            const partnerParking = (parkingRes.data || []).filter(p => p.partner === user._id);

            setMyRoutes(partnerRoutes);
            setMyParking(partnerParking);

            // Earnings are now fetched by RevenueGraph component, but we can keep a simple total here if needed or remove it.
            // For now, let's skip recalculating earnings here to avoid redundant Booking fetches.

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load your partner data.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchPartnerData();
    }, [fetchPartnerData, user]);

    // --- Handlers (Reused logic from Admin) ---
    const handleRouteSaved = () => { fetchPartnerData(); closeAllForms(); };
    const handleParkingSaved = () => { fetchPartnerData(); closeAllForms(); };
    const handleDeleteRoute = async (id) => {
        if (window.confirm("Delete this route?")) {
            await api.delete(`/routes/${id}`);
            fetchPartnerData();
        }
    };
    const handleDeleteParking = async (id) => {
        if (window.confirm("Delete this parking lot?")) {
            await api.delete(`/parking/${id}`);
            fetchPartnerData();
        }
    };

    if (!user || user.role !== 'partner') {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold">Partner Access Only</h1>
                <p>Please log in with a partner account.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <main className="container mx-auto px-4 py-8">


                    {/* Animated Header */}
                    <div className="relative mb-10 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Gradient Background with Animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>

                        {/* Decorative floating circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative px-8 py-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                                    <Briefcase className="text-blue-200" size={32} />
                                    Partner Console
                                </h1>
                                <p className="text-blue-100 text-lg opacity-90 max-w-lg">
                                    Welcome back, <strong className="text-white">{user.partnerDetails?.companyName || user.name}</strong>.
                                    Manage your fleet and track performance in real-time.
                                </p>
                                <div className="mt-4 flex gap-2">
                                    {['Bus', 'Train', 'Air', 'Taxi'].includes(user.partnerDetails?.serviceType) && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                                            {user.partnerDetails?.serviceType} Operator
                                        </span>
                                    )}
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-400/20 backdrop-blur-sm border border-green-400/30 text-green-100">
                                        ● Online
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20" title="Notifications">
                                    <Activity size={24} />
                                </button>
                                <button
                                    onClick={() => window.location.href = '/user-logout'}
                                    className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow px-2 pt-2 mb-8 flex space-x-2 overflow-x-auto">
                        <TabButton tabName="overview" label="Overview" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />

                        {/* Driver Console Tab - Only for Ride/Taxi partners or All */}
                        {(user.partnerDetails?.serviceType === 'All' || ['Ride', 'Taxi', 'Car'].includes(user.partnerDetails?.serviceType)) && (
                            <TabButton tabName="driver" label="Driver Console" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                        )}

                        {(user.partnerDetails?.serviceType === 'All' || ['Bus', 'Train', 'Air', 'Ride'].includes(user.partnerDetails?.serviceType)) && (
                            <TabButton tabName="routes" label="My Routes" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                        )}
                        {(user.partnerDetails?.serviceType === 'All' || user.partnerDetails?.serviceType === 'Parking') && (
                            <TabButton tabName="parking" label="My Parking" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                        )}
                        <TabButton tabName="bookings" label="Bookings" currentTab={activeTab} setTab={setActiveTab} onClick={closeAllForms} />
                    </div>

                    {/* Content */}
                    <div className="mt-8">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Top Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Active Routes</p>
                                            <p className="text-2xl font-bold text-gray-800">{myRoutes.length}</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Briefcase size={20} /></div>
                                    </div>
                                    {(user.partnerDetails?.serviceType === 'All' || user.partnerDetails?.serviceType === 'Parking') && (
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Parking Lots</p>
                                                <p className="text-2xl font-bold text-gray-800">{myParking.length}</p>
                                            </div>
                                            <div className="bg-purple-50 p-3 rounded-full text-purple-600"><Activity size={20} /></div>
                                        </div>
                                    )}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Total Services</p>
                                            <p className="text-2xl font-bold text-gray-800">{myRoutes.length + myParking.length}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-full text-green-600"><DollarSign size={20} /></div>
                                    </div>
                                </div>

                                {/* Revenue Graph Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <RevenueGraph />
                                    </div>
                                    <div className="bg-indigo-600 rounded-xl p-6 text-white flex flex-col justify-center items-center text-center shadow-lg">
                                        <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
                                        <p className="text-indigo-100 mb-6">Add more routes and improve amenities to increase bookings.</p>
                                        <button onClick={() => setActiveTab('routes')} className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors shadow-md">
                                            Manage Routes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'driver' && (
                            <DriverTab />
                        )}

                        {activeTab === 'bookings' && (
                            <PartnerBookingsList />
                        )}

                        {activeTab === 'routes' && (
                            <PartnerRoutesTab
                                routes={myRoutes}
                                formMode={formMode}
                                setFormMode={setFormMode}
                                routeTypeToCreate={routeTypeToCreate}
                                setRouteTypeToCreate={setRouteTypeToCreate}
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
                                serviceType={user.partnerDetails?.serviceType || 'Bus'}
                            />
                        )}

                        {activeTab === 'parking' && (
                            <ParkingTab
                                parkingLots={myParking}
                                formMode={formMode}
                                setFormMode={setFormMode}
                                editingParking={editingParking}
                                setEditingParking={setEditingParking}
                                closeAllForms={closeAllForms}
                                handleParkingSaved={handleParkingSaved}
                                handleDeleteParkingLot={handleDeleteParking}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>

                </main>
            </div>
            <Footer />
        </>
    );
};

export default PartnerDashboard;
