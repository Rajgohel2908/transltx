import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Car, Bike, DollarSign, TrendingUp, MapPin, Settings,
    LogOut, Plus, Minus, Save, RefreshCw, Calendar, Users, IndianRupee,
    Clock, CheckCircle, AlertCircle, Edit2, X, Bus, Power
} from 'lucide-react';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ParkingDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [parkingData, setParkingData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showVehicleMenu, setShowVehicleMenu] = useState(null); // 'in' or 'out' or null

    // Revenue tracking (resets daily in production, or stored in backend)
    const [todayRevenue, setTodayRevenue] = useState({
        twoWheeler: 0,
        fourWheeler: 0,
        bus: 0,
        total: 0
    });

    const [formData, setFormData] = useState({
        totalSlots: 0,
        availableSlots: 0,
        twoWheelerPrice: 0,
        fourWheelerPrice: 0,
        busPrice: 0,
        isOpen: true
    });

    useEffect(() => {
        AOS.init({ duration: 600, once: true });
        fetchParkingData();
        // Load today's revenue from localStorage
        const savedRevenue = localStorage.getItem('parkingRevenue_' + new Date().toDateString());
        if (savedRevenue) {
            setTodayRevenue(JSON.parse(savedRevenue));
        }
    }, []);

    const fetchParkingData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/partners/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setParkingData(response.data.user);

            if (response.data.user.parkingDetails) {
                setFormData({
                    totalSlots: response.data.user.parkingDetails.totalSlots || 0,
                    availableSlots: response.data.user.parkingDetails.availableSlots || 0,
                    twoWheelerPrice: response.data.user.parkingDetails.pricing?.twoWheeler || 0,
                    fourWheelerPrice: response.data.user.parkingDetails.pricing?.fourWheeler || 0,
                    busPrice: response.data.user.parkingDetails.pricing?.bus || 0,
                    isOpen: response.data.user.parkingDetails.isOpen !== undefined ? response.data.user.parkingDetails.isOpen : true
                });
            }
        } catch (err) {
            console.error('Error fetching parking data:', err);
            if (err.response?.status === 401) {
                navigate('/partner/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const payload = {
                parkingDetails: {
                    ...parkingData.parkingDetails,
                    totalSlots: parseInt(formData.totalSlots),
                    availableSlots: parseInt(formData.availableSlots),
                    isOpen: formData.isOpen,
                    pricing: {
                        twoWheeler: parseFloat(formData.twoWheelerPrice),
                        fourWheeler: parseFloat(formData.fourWheelerPrice),
                        bus: parseFloat(formData.busPrice)
                    }
                }
            };

            console.log('Sending update payload:', JSON.stringify(payload, null, 2));

            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/partners/me`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('Update response:', response.data);
            setSuccess('Parking details updated successfully!');
            setEditMode(false);
            fetchParkingData();
        } catch (err) {
            console.error('Update error:', err);
            console.error('Error response:', err.response?.data);
            const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to update parking details';
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/partner/login');
    };

    const quickUpdateSlots = async (increment, vehicleType = null) => {
        const newAvailable = Math.max(0, Math.min(formData.totalSlots, formData.availableSlots + increment));

        // Calculate revenue if vehicle is coming IN (decrement means occupied)
        let newRevenue = { ...todayRevenue };
        if (increment < 0 && vehicleType) {
            // Vehicle coming IN - add revenue
            const price = formData[`${vehicleType}Price`] || 0;
            newRevenue[vehicleType] += price;
            newRevenue.total += price;
            setTodayRevenue(newRevenue);
            // Save to localStorage
            localStorage.setItem('parkingRevenue_' + new Date().toDateString(), JSON.stringify(newRevenue));
        }

        // Optimistically update UI
        setFormData({ ...formData, availableSlots: newAvailable });

        try {
            const token = localStorage.getItem('token');
            const payload = {
                parkingDetails: {
                    ...parkingData.parkingDetails,
                    availableSlots: newAvailable
                }
            };

            await axios.patch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/partners/me`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Show vehicle-specific success feedback
            const vehicleNames = {
                twoWheeler: '🏍️ Bike',
                fourWheeler: '🚗 Car',
                bus: '🚌 Bus'
            };
            const vName = vehicleType ? vehicleNames[vehicleType] : 'Vehicle';
            setSuccess(increment > 0 ? `✓ ${vName} departed` : `✓ ${vName} parked${vehicleType ? ` +₹${formData[vehicleType + 'Price']}` : ''}`);
            setTimeout(() => setSuccess(''), 2500);
            setShowVehicleMenu(null);
        } catch (err) {
            console.error('Quick update error:', err);
            // Revert on error
            fetchParkingData();
            if (increment < 0 && vehicleType) {
                setTodayRevenue(todayRevenue); // Revert revenue
            }
            setError('Failed to update. Please try again.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const updateSlots = (increment) => {
        const newAvailable = Math.max(0, Math.min(formData.totalSlots, formData.availableSlots + increment));
        setFormData({ ...formData, availableSlots: newAvailable });
    };

    const occupancyRate = formData.totalSlots > 0
        ? ((formData.totalSlots - formData.availableSlots) / formData.totalSlots * 100).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {parkingData?.parkingDetails?.parkingName || 'Parking Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {parkingData?.parkingDetails?.address || 'No address set'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-semibold">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Success/Error Messages - Toast Style */}
                {success && (
                    <div className="fixed top-24 right-6 z-50 p-4 bg-green-500 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in" data-aos="fade-left">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">{success}</span>
                    </div>
                )}
                {error && (
                    <div className="fixed top-24 right-6 z-50 p-4 bg-red-500 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in" data-aos="fade-left">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg" data-aos="fade-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${formData.availableSlots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {formData.availableSlots > 0 ? 'Available' : 'Full'}
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">{formData.availableSlots}</p>
                        <p className="text-sm text-gray-600 mb-4">Available Slots</p>

                        {/* Quick Action Buttons with Vehicle Selection */}
                        {!showVehicleMenu ? (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowVehicleMenu('in')}
                                    disabled={formData.availableSlots === 0}
                                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <Minus className="w-5 h-5" />
                                    Vehicle In
                                </button>
                                <button
                                    onClick={() => setShowVehicleMenu('out')}
                                    disabled={formData.availableSlots >= formData.totalSlots}
                                    className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <Plus className="w-5 h-5" />
                                    Vehicle Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 mt-4">
                                <p className="text-xs font-semibold text-gray-600 mb-2">
                                    Select Vehicle Type:
                                </p>
                                <button
                                    onClick={() => quickUpdateSlots(showVehicleMenu === 'in' ? -1 : 1, 'twoWheeler')}
                                    className="w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-between shadow-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Bike className="w-5 h-5" />
                                        Bike
                                    </span>
                                    {showVehicleMenu === 'in' && <span className="text-xs">₹{formData.twoWheelerPrice}</span>}
                                </button>
                                <button
                                    onClick={() => quickUpdateSlots(showVehicleMenu === 'in' ? -1 : 1, 'fourWheeler')}
                                    className="w-full py-2.5 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold flex items-center justify-between shadow-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Car className="w-5 h-5" />
                                        Car
                                    </span>
                                    {showVehicleMenu === 'in' && <span className="text-xs">₹{formData.fourWheelerPrice}</span>}
                                </button>
                                <button
                                    onClick={() => quickUpdateSlots(showVehicleMenu === 'in' ? -1 : 1, 'bus')}
                                    className="w-full py-2.5 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all font-semibold flex items-center justify-between shadow-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Bus className="w-5 h-5" />
                                        Bus
                                    </span>
                                    {showVehicleMenu === 'in' && <span className="text-xs">₹{formData.busPrice}</span>}
                                </button>
                                <button
                                    onClick={() => setShowVehicleMenu(null)}
                                    className="w-full py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">{formData.totalSlots - formData.availableSlots}</p>
                        <p className="text-sm text-gray-600">Occupied Slots</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm" data-aos="fade-up" data-aos-delay="200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">{occupancyRate}%</p>
                        <p className="text-sm text-gray-600">Occupancy Rate</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm" data-aos="fade-up" data-aos-delay="300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <IndianRupee className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">₹{todayRevenue.total}</p>
                        <p className="text-sm text-gray-600 mb-3">Today's Revenue</p>
                        {/* Revenue Breakdown */}
                        <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>🏍️ Bikes:</span>
                                <span className="font-semibold">₹{todayRevenue.twoWheeler}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🚗 Cars:</span>
                                <span className="font-semibold">₹{todayRevenue.fourWheeler}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🚌 Buses:</span>
                                <span className="font-semibold">₹{todayRevenue.bus}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Slot Management */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200" data-aos="fade-up">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="w-6 h-6 text-green-600" />
                                    Slot Management
                                </h2>

                                <div className="flex items-center gap-4">
                                    {/* Open/Close Status Toggle */}
                                    <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${formData.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        <Power className="w-4 h-4" />
                                        {formData.isOpen ? 'OPEN' : 'CLOSED'}
                                    </div>

                                    {!editMode && (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {editMode && (
                            <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all font-semibold text-gray-700">
                                    <span className="flex items-center gap-2">
                                        <Power className={`w-5 h-5 ${formData.isOpen ? 'text-green-600' : 'text-red-500'}`} />
                                        Parking Status
                                    </span>
                                    <div className="relative inline-flex items-center cursor-pointer" onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}>
                                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 transition-colors ${formData.isOpen ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                        <div className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform ${formData.isOpen ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                            </div>
                        )}

                        <div className="p-6 space-y-6">
                            {/* Total Slots */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Parking Slots</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={formData.totalSlots}
                                        onChange={(e) => setFormData({ ...formData, totalSlots: parseInt(e.target.value) || 0 })}
                                        disabled={!editMode}
                                        className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all ${editMode
                                            ? 'border-green-500 focus:ring-4 focus:ring-green-100'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Available Slots with Quick Controls */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Slots</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateSlots(-1)}
                                        disabled={!editMode || formData.availableSlots === 0}
                                        className="w-12 h-12 rounded-xl bg-red-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-all flex items-center justify-center"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="number"
                                        value={formData.availableSlots}
                                        onChange={(e) => setFormData({ ...formData, availableSlots: Math.min(formData.totalSlots, parseInt(e.target.value) || 0) })}
                                        disabled={!editMode}
                                        className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all text-center text-2xl font-bold ${editMode
                                            ? 'border-green-500 focus:ring-4 focus:ring-green-100'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    />
                                    <button
                                        onClick={() => updateSlots(1)}
                                        disabled={!editMode || formData.availableSlots >= formData.totalSlots}
                                        className="w-12 h-12 rounded-xl bg-green-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-all flex items-center justify-center"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Use + / - buttons to quickly update availability</p>
                            </div>

                            {/* Action Buttons */}
                            {editMode && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            fetchParkingData();
                                        }}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200" data-aos="fade-up" data-aos-delay="100">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-green-600" />
                                Pricing Configuration
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Two Wheeler Price */}
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                        <Bike className="w-5 h-5 text-white" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-900">Two Wheeler (per hour)</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-gray-600" />
                                    <input
                                        type="number"
                                        value={formData.twoWheelerPrice}
                                        onChange={(e) => setFormData({ ...formData, twoWheelerPrice: parseFloat(e.target.value) || 0 })}
                                        disabled={!editMode}
                                        className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all font-bold text-xl ${editMode
                                            ? 'border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Four Wheeler Price */}
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                                        <Car className="w-5 h-5 text-white" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-900">Four Wheeler (per hour)</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-gray-600" />
                                    <input
                                        type="number"
                                        value={formData.fourWheelerPrice}
                                        onChange={(e) => setFormData({ ...formData, fourWheelerPrice: parseFloat(e.target.value) || 0 })}
                                        disabled={!editMode}
                                        className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all font-bold text-xl ${editMode
                                            ? 'border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Bus Price - NEW */}
                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                                        <Bus className="w-5 h-5 text-white" />
                                    </div>
                                    <label className="text-sm font-bold text-gray-900">Bus / Heavy Vehicle (per hour)</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5 text-gray-600" />
                                    <input
                                        type="number"
                                        value={formData.busPrice}
                                        onChange={(e) => setFormData({ ...formData, busPrice: parseFloat(e.target.value) || 0 })}
                                        disabled={!editMode}
                                        className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none transition-all font-bold text-xl ${editMode
                                            ? 'border-amber-500 focus:ring-4 focus:ring-amber-100 bg-white'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    />
                                </div>
                            </div>

                            {!editMode && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <p className="text-sm text-amber-800">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Click "Edit" to update pricing and slot configuration
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visual Slot Display */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6" data-aos="fade-up">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-green-600" />
                        Parking Slot Visualization
                    </h2>
                    <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: formData.totalSlots || 20 }).map((_, index) => (
                            <div
                                key={index}
                                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${index < formData.availableSlots
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'bg-red-100 text-red-700 border-2 border-red-300'
                                    }`}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-6 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300"></div>
                            <span className="font-semibold text-gray-700">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-300"></div>
                            <span className="font-semibold text-gray-700">Occupied</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkingDashboard;
