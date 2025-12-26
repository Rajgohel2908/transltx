import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/Context';
import {
    Power,
    DollarSign,
    Clock,
    Star,
    MapPin,
    Phone,
    User,
    Wallet,
    Settings,
    Headphones,
    Navigation,
    TrendingUp,
    ArrowRight,
    Activity,
    Award,
    Calendar,
    ChevronRight
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const DriverDashboard = () => {
    const { user } = useContext(DataContext);
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(false);
    const [earnings, setEarnings] = useState(1250);
    const [activeHours, setActiveHours] = useState(8.5);
    const [rating, setRating] = useState(4.8);
    const [displayEarnings, setDisplayEarnings] = useState(0);
    const [hasNewRequest, setHasNewRequest] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });
    }, []);

    // Animated earnings counter
    useEffect(() => {
        if (displayEarnings < earnings) {
            const timer = setTimeout(() => {
                setDisplayEarnings(prev => Math.min(prev + 50, earnings));
            }, 30);
            return () => clearTimeout(timer);
        }
    }, [displayEarnings, earnings]);

    // Simulate ride request
    useEffect(() => {
        if (isOnline) {
            const timer = setTimeout(() => {
                setHasNewRequest(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    const handleToggleOnline = () => {
        setIsOnline(!isOnline);
        if (!isOnline) {
            setDisplayEarnings(0);
        }
    };

    const handleAcceptRide = () => {
        setHasNewRequest(false);
        alert('Ride accepted! Navigation starting...');
    };

    const handleDeclineRide = () => {
        setHasNewRequest(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
            {/* Enhanced Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                <Navigation className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Driver Hub
                                </h1>
                                <p className="text-sm text-gray-600">Welcome, {user?.name || 'Driver'}</p>
                            </div>
                        </div>

                        {/* Unique Online Toggle */}
                        <button
                            onClick={handleToggleOnline}
                            className={`relative px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 ${isOnline
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/50'
                                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500'
                                }`}
                        >
                            {isOnline && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                                </span>
                            )}
                            <Power className="w-5 h-5" />
                            <span>{isOnline ? 'Online' : 'Go Online'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Stats Cards with Unique Designs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Earnings Card - Unique gradient border */}
                    <div className="relative group" data-aos="fade-up">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
                        <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Today's Earnings</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                                ₹{displayEarnings.toLocaleString()}
                            </p>
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(displayEarnings / 2000) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Daily Target: ₹2,000</p>
                        </div>
                    </div>

                    {/* Active Hours Card */}
                    <div className="relative group" data-aos="fade-up" data-aos-delay="100">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
                        <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                {isOnline && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        LIVE
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Active Hours</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                                {activeHours}h
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Today's shift time</p>
                        </div>
                    </div>

                    {/* Rating Card */}
                    <div className="relative group" data-aos="fade-up" data-aos-delay="200">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
                        <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                                    <Star className="w-6 h-6 text-white fill-white" />
                                </div>
                                <Award className="w-5 h-5 text-yellow-500" />
                            </div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Your Rating</p>
                            <div className="flex items-end gap-2 mb-2">
                                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                    {rating}
                                </p>
                                <div className="flex gap-0.5 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">156 total rides</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area with Enhanced States */}
                <div className="relative" data-aos="fade-up">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-2xl opacity-20 blur-xl" />
                    <div className="relative bg-white rounded-2xl shadow-xl p-8 min-h-[500px] flex items-center justify-center">
                        {!isOnline ? (
                            /* Offline State - Enhanced */
                            <div className="text-center max-w-md">
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse" />
                                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                                        <Power className="w-12 h-12 text-gray-400" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">You're Offline</h2>
                                <p className="text-gray-600 mb-8">
                                    Go online to start receiving ride requests and earning money
                                </p>
                                <button
                                    onClick={handleToggleOnline}
                                    className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center gap-3 mx-auto"
                                >
                                    <Power className="w-5 h-5" />
                                    <span>Go Online Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : !hasNewRequest ? (
                            /* Searching State - Enhanced with animated rings */
                            <div className="text-center max-w-md">
                                <div className="relative w-40 h-40 mx-auto mb-8">
                                    {/* Animated rings */}
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping" style={{ animationDuration: '2s' }} />
                                    <div className="absolute inset-4 rounded-full border-4 border-cyan-300 animate-ping" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
                                        <Navigation className="w-12 h-12 text-white animate-pulse" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Searching for Rides...</h2>
                                <p className="text-gray-600 mb-6">
                                    Stay alert! New ride requests will appear here
                                </p>
                                <div className="flex justify-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-bounce"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* New Ride Request - Enhanced Card */
                            <div className="w-full max-w-lg" data-aos="zoom-in">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-75 blur" />
                                    <div className="relative bg-white rounded-2xl p-8 border-2 border-blue-500">
                                        <div className="text-center mb-6">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-xl animate-bounce">
                                                <MapPin className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-gray-900 mb-2">New Ride Request!</h3>
                                            <p className="text-gray-600">Review details and accept</p>
                                        </div>

                                        {/* Enhanced Ride Details */}
                                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 space-y-4 mb-6">
                                            <div className="flex items-start gap-4 p-3 bg-white rounded-lg">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1 font-semibold">PICKUP</p>
                                                    <p className="font-bold text-gray-900">Andheri East, Mumbai</p>
                                                    <p className="text-xs text-gray-500 mt-1">2.3 km away</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-3 bg-white rounded-lg">
                                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1 font-semibold">DROP-OFF</p>
                                                    <p className="font-bold text-gray-900">Bandra West, Mumbai</p>
                                                    <p className="text-xs text-gray-500 mt-1">8.7 km trip</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-white rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                        <p className="text-xs text-gray-500 font-semibold">PASSENGER</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">Raj Patel</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-xs text-gray-600">4.9</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-500">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <DollarSign className="w-4 h-4 text-green-600" />
                                                        <p className="text-xs text-green-700 font-semibold">FARE</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-600">₹320</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Enhanced */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={handleDeclineRide}
                                                className="py-4 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600 font-bold rounded-xl transition-all"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={handleAcceptRide}
                                                className="py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                                            >
                                                Accept
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { icon: Wallet, label: 'Earnings', color: 'blue', delay: 0 },
                        { icon: Navigation, label: 'My Trips', color: 'green', delay: 100 },
                        { icon: User, label: 'Profile', color: 'purple', delay: 200 },
                        { icon: Headphones, label: 'Support', color: 'orange', delay: 300 }
                    ].map(({ icon: Icon, label, color, delay }) => (
                        <button
                            key={label}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-gray-100 hover:border-blue-500 p-6 transition-all transform hover:-translate-y-1"
                            data-aos="fade-up"
                            data-aos-delay={delay}
                        >
                            <Icon className={`w-8 h-8 mx-auto mb-3 text-${color}-600 group-hover:scale-110 transition-transform`} />
                            <p className="font-semibold text-gray-900 text-center">{label}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
