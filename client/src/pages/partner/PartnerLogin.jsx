import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { loginPartner } from '../../utils/api.js';
import AOS from 'aos';
import 'aos/dist/aos.css';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginPartner(formData);

            if (response.token) {
                localStorage.setItem('token', response.token);

                // Full page reload will trigger Context to load user with new token
                if (response.role === 'driver') {
                    window.location.href = '/driver-dashboard';
                } else if (response.role === 'fleet_owner' || response.role === 'partner' || response.role === 'operator') {
                    window.location.href = '/partner/dashboard';
                } else if (response.role === 'parking_owner') {
                    window.location.href = '/parking-dashboard';
                } else {
                    setError('Invalid account type for partner login');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />

            {/* Header */}
            <div className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            TransltIx Partner Portal
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/partner/signup')}
                        className="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold hover:bg-blue-50 rounded-lg transition-all"
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding */}
                    <div className="hidden md:block" data-aos="fade-right">
                        <div className="relative">
                            {/* Decorative card stack */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl transform rotate-6 opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl transform -rotate-6 opacity-20" />

                            <div className="relative bg-white rounded-3xl shadow-2xl p-12">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 shadow-lg">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    Welcome Back,
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        Partner!
                                    </span>
                                </h2>
                                <p className="text-gray-600 text-lg mb-8">
                                    Continue your journey with India's most trusted logistics platform.
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { value: '10K+', label: 'Partners' },
                                        { value: '₹50Cr+', label: 'Paid Out' },
                                        { value: '4.8★', label: 'Rating' }
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                                            <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                                            <div className="text-xs text-gray-600">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div data-aos="fade-left">
                        <div className="relative">
                            {/* Gradient border effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-75 blur" />

                            <div className="relative bg-white rounded-2xl shadow-xl p-8">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-4">
                                        <Sparkles className="w-4 h-4" />
                                        <span>Secure Login</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h3>
                                    <p className="text-gray-600">Access your partner dashboard</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors">
                                                <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors">
                                                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Remember me</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/partner/forgot-password')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-4 bg-white text-sm text-gray-500 font-medium">New to TransltIx?</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/partner/signup')}
                                        className="w-full py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold rounded-xl transition-all"
                                    >
                                        Create Partner Account
                                    </button>

                                    <p className="text-center text-sm text-gray-600 mt-6">
                                        Not a partner?{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/user-login')}
                                            className="text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            User Login
                                        </button>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerLogin;
