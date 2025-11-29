import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../context/Context.jsx";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { Calendar, MapPin, Clock, ArrowRight, Bus, Plane, Train, Car, Briefcase } from "lucide-react";

// --- Helper Icons ---
const getServiceIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'bus': return <Bus className="h-6 w-6 text-blue-500" />;
        case 'train': return <Train className="h-6 w-6 text-orange-500" />;
        case 'air': return <Plane className="h-6 w-6 text-sky-500" />;
        case 'ride': return <Car className="h-6 w-6 text-green-500" />;
        case 'trips': return <Briefcase className="h-6 w-6 text-purple-500" />;
        default: return <Bus className="h-6 w-6 text-gray-500" />;
    }
};

const NoBookingsIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-16 w-16 text-blue-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

// --- Booking Card Component ---
const BookingCard = ({ booking }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "confirmed": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            {getServiceIcon(booking.bookingType)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{booking.bookingType}</h3>
                            <p className="text-xs text-gray-500">PNR: {booking.pnrNumber}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                    </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">From</p>
                        <p className="font-semibold text-gray-800 text-lg truncate">{booking.from}</p>
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.departureDateTime ? new Date(booking.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : booking.departure}
                        </p>
                    </div>

                    <div className="px-4 flex flex-col items-center">
                        <ArrowRight className="text-gray-300 h-5 w-5" />
                        <p className="text-xs text-gray-400 mt-1">{booking.duration}</p>
                    </div>

                    <div className="flex-1 text-right">
                        <p className="text-xs text-gray-500 mb-1">To</p>
                        <p className="font-semibold text-gray-800 text-lg truncate">{booking.to}</p>
                        <p className="text-xs text-gray-400 flex items-center justify-end mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.arrivalDateTime ? new Date(booking.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : booking.arrival}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500">Travel Date</p>
                        <p className="text-sm font-medium text-gray-700 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            {new Date(booking.travelDate || booking.departureDateTime).toLocaleDateString("en-US", {
                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Total Fare</p>
                        <p className="text-lg font-bold text-green-600">₹{booking.fare}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Skeleton Loader ---
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex justify-between mb-6">
            <div className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex justify-between mb-6">
            <div className="h-12 w-24 bg-gray-200 rounded"></div>
            <div className="h-12 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
    </div>
);

// --- Main Page Component ---
const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user } = useContext(DataContext);

    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/bookings/user/${user._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setBookings(response.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to load your bookings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, API_BASE_URL]);

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <main className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-8 border-b-4 border-blue-500 pb-2">
                        <h1 className="text-4xl font-extrabold text-gray-800">My Bookings</h1>
                        <Link to="/booking/bus" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                            Book New Trip <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                        ) : bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <BookingCard key={booking._id} booking={booking} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm">
                                <NoBookingsIcon />
                                <h2 className="text-2xl font-bold text-gray-700 mt-4">No Bookings Found</h2>
                                <p className="text-gray-500 mt-2 mb-6">You haven't made any trip bookings yet.</p>
                                <Link
                                    to="/booking/bus"
                                    className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105"
                                >
                                    Start Exploring
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default MyBookings;
