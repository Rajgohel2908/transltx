import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api.js";
import {
    MapPin,
    Users,
    Phone,
    Navigation,
    CheckCircle,
    XCircle,
    AlertCircle,
    Car,
    Calendar
} from 'lucide-react';
import { useContext } from "react";
import { DataContext } from "../../../context/Context.jsx";

const DriverTab = () => {
    const { user } = useContext(DataContext);
    const [rides, setRides] = useState([]);
    const [jobs, setJobs] = useState([]); // Available Private Ride Requests
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRide, setSelectedRide] = useState(null); // For Modal
    const [isOnline, setIsOnline] = useState(true); // Toggle state

    // Fetch Driver Rides
    const fetchRides = async () => {
        try {
            setLoading(true);
            const res = await api.get('/rides/driver/rides');
            setRides(res.data);

            // Also fetch available jobs
            const jobsRes = await api.get('/bookings/jobs/available');
            setJobs(jobsRes.data);

            setError('');
        } catch (err) {
            console.error("Error fetching rides:", err);
            setError("Failed to load rides. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
    }, []);

    // Actions
    const handleStartRide = async (rideId) => {
        try {
            await api.patch(`/rides/${rideId}/start`);
            fetchRides(); // Refresh to update status
            alert("Ride Started! Passengers notified.");
        } catch (err) {
            alert("Failed to start ride.");
        }
    };

    const handleCompleteRide = async (rideId) => {
        if (!window.confirm("Are you sure you want to complete this ride?")) return;
        try {
            await api.patch(`/rides/${rideId}/complete`);
            fetchRides();
            alert("Ride Completed! Great job.");
        } catch (err) {
            alert("Failed to complete ride.");
        }
    };

    const handleCancelRide = async (rideId) => {
        if (!window.confirm("Are you sure? This will cancel the ride for all passengers.")) return;
        try {
            await api.delete(`/rides/${rideId}/cancel`);
            fetchRides();
            alert("Ride Cancelled.");
        } catch (err) {
            alert("Failed to cancel ride.");
        }
    };

    const handleAcceptJob = async (bookingId) => {
        try {
            if (!user) return alert("Please log in.");

            await api.patch(`/bookings/${bookingId}/accept-job`, { driverId: user._id });
            fetchRides();
            alert("Job Accepted! Check your Active Rides/Bookings.");
        } catch (err) {
            console.error(err);
            alert("Failed to accept job.");
        }
    };

    const handleApproveRequest = async (rideId, passengerId) => {
        try {
            await api.patch(`/rides/${rideId}/approve`, { passengerId });
            fetchRides();
            alert("Passenger Approved!");
        } catch (err) {
            console.error(err);
            alert("Failed to approve passenger.");
        }
    };

    const handleRejectRequest = async (rideId, passengerId) => {
        if (!window.confirm("Reject this passenger?")) return;
        try {
            await api.patch(`/rides/${rideId}/reject`, { passengerId });
            fetchRides();
            alert("Passenger Rejected.");
        } catch (err) {
            console.error(err);
            alert("Failed to reject passenger.");
        }
    };

    // Derived State
    const activeRide = rides.find(r => r.status === 'active');
    const upcomingRides = rides.filter(r => r.status === 'scheduled' || r.status === 'booked');
    const pastRides = rides.filter(r => r.status === 'completed' || r.status === 'cancelled');

    // --- Components ---

    const RideCard = ({ ride, isActive = false }) => (
        <div
            onClick={() => !isActive && setSelectedRide(ride)}
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                ${isActive
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl scale-[1.02]'
                    : 'bg-white hover:shadow-xl border border-gray-100 hover:-translate-y-1'
                }`}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isActive ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                            <Car size={24} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                {isActive ? 'Current Trip' : 'Scheduled Ride'}
                            </h3>
                            <p className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                                {new Date(ride.departureTime).toLocaleDateString()} • {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${isActive ? 'bg-green-400 text-green-900' : 'bg-gray-100 text-gray-600'}`}>
                        {ride.status}
                    </span>
                </div>

                {/* Route */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400' : 'bg-green-500'}`}></div>
                            <div className={`w-0.5 h-8 ${isActive ? 'bg-white/30' : 'bg-gray-200'}`}></div>
                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-400' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className={`text-xs uppercase tracking-wide ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>From</p>
                                <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>{ride.from}</p>
                            </div>
                            <div>
                                <p className={`text-xs uppercase tracking-wide ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>To</p>
                                <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>{ride.to}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <Users size={16} className={isActive ? 'text-blue-200' : 'text-gray-400'} />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                            {ride.acceptedBy?.length || 0} / {ride.seatsAvailable + (ride.acceptedBy?.length || 0)} Passengers
                        </span>
                    </div>

                    {isActive && (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCompleteRide(ride._id); }}
                                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Complete
                            </button>
                        </div>
                    )}
                    {!isActive && ride.status !== 'cancelled' && (
                        <div className="flex gap-2">
                            {/* Only show Start if within 1 hour (simulated logic, or just always show for demo) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleStartRide(ride._id); }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <Navigation size={16} /> Start
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Modal
    const RideDetailModal = () => {
        if (!selectedRide) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-800">Ride Details</h3>
                        <button onClick={() => setSelectedRide(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                            <XCircle size={24} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Route Info */}
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Route</p>
                                <div className="flex items-center gap-2 font-semibold text-gray-800">
                                    <MapPin size={16} className="text-blue-600" />
                                    {selectedRide.from} <span className="text-gray-400">→</span> {selectedRide.to}
                                </div>
                            </div>
                        </div>

                        {/* Pending Requests */}
                        {selectedRide.requests && selectedRide.requests.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} /> Pending Requests
                                </h4>
                                <div className="space-y-3">
                                    {selectedRide.requests.map((reqUser, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-orange-100 bg-orange-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                                                    {reqUser.name ? reqUser.name[0] : 'R'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{reqUser.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">Requesting a seat</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveRequest(selectedRide._id, reqUser._id)}
                                                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-sm"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(selectedRide._id, reqUser._id)}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-sm"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Passenger List */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Confirmed Passengers</h4>
                            {selectedRide.acceptedBy && selectedRide.acceptedBy.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedRide.acceptedBy.map((passenger, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition bg-white shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                    {passenger.name ? passenger.name[0] : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{passenger.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">Passenger #{idx + 1}</p>
                                                </div>
                                            </div>
                                            {/* Privacy Rule: Show phone only if confirmed (which they are if in acceptedBy) */}
                                            <a href={`tel:${passenger.phone}`} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition">
                                                <Phone size={20} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    No passengers yet.
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={() => handleCancelRide(selectedRide._id)}
                                className="w-full py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                            >
                                Cancel Ride
                            </button>
                            <button
                                onClick={() => { handleStartRide(selectedRide._id); setSelectedRide(null); }}
                                className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                Start Ride
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="space-y-8">
            {/* Header / Status Toggle */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Driver Console</h2>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isOnline ? '● Online' : '○ Offline'}
                    </span>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                    >
                        Toggle Status
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Active Ride Section */}
            {activeRide && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        Active Ride
                    </h2>
                    <RideCard ride={activeRide} isActive={true} />
                </div>
            )}

            {/* Available Jobs Section */}
            {jobs.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                        Available Ride Requests
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {jobs.map(job => (
                            <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                                            <Navigation size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Private Ride Request</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(job.departureDateTime || job.departure).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                        ₹{job.fare}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600"><strong>From:</strong> {job.from}</p>
                                    <p className="text-sm text-gray-600"><strong>To:</strong> {job.to}</p>
                                    <p className="text-sm text-gray-600"><strong>Passenger:</strong> {job.passengers[0]?.fullName}</p>
                                </div>

                                <button
                                    onClick={() => handleAcceptJob(job._id)}
                                    className="w-full py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition"
                                >
                                    Accept Job
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Rides */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Upcoming Rides
                </h2>
                {upcomingRides.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {upcomingRides.map(ride => (
                            <RideCard key={ride._id} ride={ride} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No upcoming rides scheduled.</p>
                    </div>
                )}
            </div>

            {/* Past Rides (Optional) */}
            {pastRides.length > 0 && (
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <h2 className="text-lg font-bold text-gray-600 mb-4">Past Activity</h2>
                    <div className="space-y-4">
                        {pastRides.map(ride => (
                            <div key={ride._id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${ride.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {ride.status === 'completed' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{ride.from} → {ride.to}</p>
                                        <p className="text-xs text-gray-500">{new Date(ride.departureTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-500 capitalize">{ride.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            <RideDetailModal />
        </div>
    );
};

export default DriverTab;
