import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { DataContext } from '../../context/Context';
import Footer from '../../components/Footer';
import { Briefcase, ArrowRight, Lock, Mail, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(DataContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/partners/login', formData);
            const { token } = response.data;

            localStorage.setItem('token', token);

            // Fetch profile and update context immediately
            try {
                const userRes = await api.get('/partners/me');
                setUser(userRes.data);
                navigate('/partner/dashboard');
            } catch (fetchErr) {
                console.error("Failed to fetch profile:", fetchErr);
                // Fallback: reload page or navigate anyway (auth check might fail but refresh will fix)
                navigate('/partner/dashboard');
                window.location.reload();
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.error || "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-between">

            <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">

                    {/* Left Side - Visuals */}
                    <div className="hidden md:flex flex-col justify-center items-center p-10 bg-blue-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
                        <div className="relative z-10 text-center">
                            <div className="bg-white/20 p-4 rounded-full inline-block mb-6 backdrop-blur-sm">
                                <Briefcase size={48} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-4">Partner Portal</h2>
                            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                Manage your fleet, track earnings, and grow your business with TransItIx.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-medium bg-blue-700/50 py-2 px-4 rounded-full">
                                <span>Trusted by 500+ Operators</span>
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full opacity-50 blur-2xl"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="p-10 md:p-12 flex flex-col justify-center">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                            <p className="text-gray-500">Please login to access your partner dashboard.</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-start gap-3 animate-shake">
                                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="partner@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <Link to="/partner/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have a partner account?{' '}
                                <Link to="/partner/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors pb-1">
                                    Register your business
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
            animation: shake 0.4s ease-in-out;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.2; }
        }
        .animate-pulse-slow {
            animation: pulse-slow 4s infinite;
        }
      `}</style>
        </div>
    );
};

export default PartnerLogin;
