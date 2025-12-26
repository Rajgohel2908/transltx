import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bus, Building2, Eye, EyeOff, Loader2, ArrowRight, Sparkles, Check, Mail, Phone, User, Building, FileText, CreditCard, MapPin, Hash, Shield, ChevronRight } from 'lucide-react';
import { signupPartner } from '../../utils/api.js';
import AOS from 'aos';
import 'aos/dist/aos.css';

const PartnerSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        serviceType: 'bus',
        licenseNumber: '',
        gstNumber: '',
        vehicle_type: 'car',
        vehicle_number: '',
        driver_license: '',
        parkingName: '',
        address: ''
    });

    useEffect(() => {
        AOS.init({ duration: 700, once: true, easing: 'ease-out-quart' });
    }, []);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setTimeout(() => setStep(2), 400);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: selectedRole
            };

            if (selectedRole === 'operator') {
                payload.operatorDetails = {
                    companyName: formData.companyName,
                    serviceType: formData.serviceType,
                    licenseNumber: formData.licenseNumber,
                    gstNumber: formData.gstNumber,
                    contactNumber: formData.phone
                };
            } else if (selectedRole === 'driver') {
                payload.driverDetails = {
                    vehicle_type: formData.vehicle_type,
                    vehicle_number: formData.vehicle_number,
                    license_number: formData.driver_license
                };
            } else if (selectedRole === 'parking_owner') {
                payload.parkingDetails = {
                    parkingName: formData.parkingName,
                    address: formData.address
                };
            }

            const response = await signupPartner(payload);

            if (response.token) {
                localStorage.setItem('token', response.token);

                if (selectedRole === 'driver') {
                    window.location.href = '/driver-dashboard';
                } else if (selectedRole === 'operator') {
                    window.location.href = '/operator-dashboard';
                } else if (selectedRole === 'parking_owner') {
                    window.location.href = '/parking-dashboard';
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roleConfig = {
        operator: {
            icon: Bus,
            title: 'Transport Operator',
            subtitle: 'Bus · Train · Airline',
            description: 'Launch and manage your transport business on our platform',
            color: 'purple',
            gradient: 'from-purple-500 via-purple-600 to-pink-600',
            lightGradient: 'from-purple-50 to-pink-50',
            stats: '5,000+ Operators'
        },
        driver: {
            icon: Car,
            title: 'Ride Driver',
            subtitle: 'Bike · Auto · Car · Van',
            description: 'Drive on your terms and maximize your earnings',
            color: 'blue',
            gradient: 'from-blue-500 via-blue-600 to-cyan-600',
            lightGradient: 'from-blue-50 to-cyan-50',
            stats: '8,000+ Drivers'
        },
        parking_owner: {
            icon: Building2,
            title: 'Parking Owner',
            subtitle: 'Real-Time Management',
            description: 'Digitize your parking lot with live updates',
            color: 'green',
            gradient: 'from-green-500 via-green-600 to-emerald-600',
            lightGradient: 'from-green-50 to-emerald-50',
            stats: '2,000+ Parking Lots'
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative">
            {/* Animated orbs */}
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />

            {/* Header */}
            <div className="relative bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        TransltIx Partner Portal
                    </h1>
                    <button
                        onClick={() => navigate('/partner/login')}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 py-16">
                {/* Step 1: Partner Type Selection */}
                {step === 1 && (
                    <div>
                        <div className="text-center mb-16" data-aos="fade-down">
                            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                                Join the{' '}
                                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                                    TransltIx Network
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Select your partnership type and unlock powerful tools to grow your business
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {Object.entries(roleConfig).map(([role, config], index) => {
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={role}
                                        onClick={() => handleRoleSelect(role)}
                                        className="group relative cursor-pointer"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 150}
                                    >
                                        <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`} />

                                        <div className={`relative bg-white rounded-3xl border-2 border-gray-200 group-hover:border-transparent overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                                            <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

                                            <div className="p-8">
                                                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                                                </div>

                                                <div className="mb-6">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h3>
                                                    <p className={`text-sm font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}>
                                                        {config.subtitle}
                                                    </p>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{config.description}</p>
                                                </div>

                                                <div className="space-y-2 mb-6">
                                                    {['Instant setup', 'Real-time insights', '24/7 support'].map((feature) => (
                                                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Check className={`w-4 h-4 text-${config.color}-600`} strokeWidth={3} />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${config.lightGradient} rounded-full mb-6`}>
                                                    <Sparkles className="w-3.5 h-3.5 text-gray-600" />
                                                    <span className="text-xs font-semibold text-gray-700">{config.stats}</span>
                                                </div>

                                                <button className={`w-full py-3.5 bg-gradient-to-r ${config.gradient} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all group/btn`}>
                                                    <span>Get Started</span>
                                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2 - FULL SCREEN LAYOUT */}
                {step === 2 && selectedRole && (
                    <div data-aos="fade-in">
                        <button
                            onClick={() => setStep(1)}
                            className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 font-medium group"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to selection</span>
                        </button>

                        {/* Gradient Header Banner */}
                        <div className={`bg-gradient-to-br ${roleConfig[selectedRole].gradient} rounded-2xl p-8 mb-8 shadow-xl`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 text-white">
                                        Step 2 of 2
                                    </div>
                                    <h2 className="text-4xl font-bold text-white mb-2">{roleConfig[selectedRole].title}</h2>
                                    <p className="text-white/90 text-lg">{roleConfig[selectedRole].subtitle}</p>
                                </div>
                                <div className="w-20 h-20 hidden md:block">
                                    {(() => {
                                        const Icon = roleConfig[selectedRole].icon;
                                        return <Icon className="w-full h-full text-white" strokeWidth={1.5} />;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Form Content - Full Width */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                            <form onSubmit={handleSubmit} className="p-12 space-y-10">
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        Personal Details
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputField icon={User} label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" minLength={3} />
                                        <InputField icon={Mail} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                                    </div>
                                    <InputField icon={Phone} label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                                </div>

                                {/* Role-specific fields */}
                                {selectedRole === 'operator' && (
                                    <div className="space-y-6 pt-8 border-t">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <Building className="w-5 h-5 text-purple-600" />
                                            </div>
                                            Business Information
                                        </h3>

                                        <InputField icon={Building} label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="ABC Travels Pvt. Ltd." />

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type *</label>
                                            <select
                                                name="serviceType"
                                                value={formData.serviceType}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all bg-white text-gray-900 font-medium"
                                            >
                                                <option value="bus">🚌 Bus Service</option>
                                                <option value="train">🚆 Train Service (IRCTC)</option>
                                                <option value="airline">✈️ Airline Service</option>
                                            </select>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField icon={FileText} label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="LIC123456" />
                                            <InputField icon={CreditCard} label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                                        </div>
                                    </div>
                                )}

                                {selectedRole === 'driver' && (
                                    <div className="space-y-6 pt-8 border-t">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Car className="w-5 h-5 text-blue-600" />
                                            </div>
                                            Vehicle Information
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">Vehicle Type *</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { value: 'bike', emoji: '🏍️', label: 'Bike' },
                                                    { value: 'auto', emoji: '🛺', label: 'Auto' },
                                                    { value: 'car', emoji: '🚗', label: 'Car' },
                                                    { value: 'van', emoji: '🚐', label: 'Van' }
                                                ].map(({ value, emoji, label }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, vehicle_type: value })}
                                                        className={`p-4 rounded-xl border-2 transition-all text-center ${formData.vehicle_type === value
                                                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="text-3xl mb-1">{emoji}</div>
                                                        <div className="text-xs font-bold text-gray-700">{label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField icon={Hash} label="Vehicle Number" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} placeholder="MH-01-AB-1234" uppercase />
                                            <InputField icon={FileText} label="License Number" name="driver_license" value={formData.driver_license} onChange={handleChange} placeholder="DL-1234567890" uppercase />
                                        </div>
                                    </div>
                                )}

                                {selectedRole === 'parking_owner' && (
                                    <div className="space-y-6 pt-8 border-t">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            Parking Information
                                        </h3>

                                        <InputField icon={Building2} label="Parking Name" name="parkingName" value={formData.parkingName} onChange={handleChange} required placeholder="City Center Parking" />
                                        <InputField icon={MapPin} label="Address" name="address" value={formData.address} onChange={handleChange} required placeholder="123 Main Street, Mumbai" />

                                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <p className="text-sm text-green-800">
                                                <Sparkles className="w-4 h-4 inline mr-2" />
                                                You can add parking slots and pricing details after registration in your dashboard
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Security */}
                                <div className="space-y-6 pt-8 border-t">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        Security
                                    </h3>

                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                                className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
                                                placeholder="Create a strong password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">Minimum 6 characters</p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 bg-gradient-to-r ${roleConfig[selectedRole].gradient} text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create Partner Account</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/partner/login')}
                                        className={`font-semibold text-${roleConfig[selectedRole].color}-600 hover:underline`}
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable Input Field Component
const InputField = ({ icon: Icon, label, name, type = 'text', value, onChange, required, placeholder, uppercase, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label} {required && '*'}
        </label>
        <div className="relative group">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all ${uppercase ? 'uppercase' : ''}`}
                placeholder={placeholder}
                {...props}
            />
        </div>
    </div>
);

export default PartnerSignup;
