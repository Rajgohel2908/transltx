import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import Footer from '../../components/Footer';
import { ShieldCheck, ArrowRight, User, Mail, Lock, Building, Phone, Briefcase, Loader, AlertCircle } from 'lucide-react';

const PartnerSignup = () => {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') || 'Bus';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '',
        contactNumber: '',
        serviceType: initialType,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/partners/signup', {
                ...formData,
                // role: 'partner', // handled in backend now
                partnerDetails: {
                    companyName: formData.name, // Using Name as Company Name
                    contactNumber: '+91' + formData.contactNumber,
                    serviceType: formData.serviceType
                }
            });
            alert("Registration successful! Please log in.");
            navigate('/partner/login');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || error.response?.data?.details || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col justify-between">

            <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">

                    {/* Left Side - Visuals */}
                    <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-indigo-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
                        <div className="relative z-10 text-center">
                            <div className="bg-white/20 p-5 rounded-full inline-block mb-8 backdrop-blur-sm">
                                <ShieldCheck size={56} className="text-white" />
                            </div>
                            <h2 className="text-4xl font-extrabold mb-6 leading-tight">Join the Network</h2>
                            <p className="text-indigo-100 text-lg mb-8 leading-relaxed max-w-md">
                                Expand your reach. Simplify your operations. Become a TransItIx partner today.
                            </p>

                            <div className="grid grid-cols-2 gap-4 text-left w-full max-w-sm mx-auto">
                                <div className="bg-indigo-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    <h4 className="font-bold flex items-center text-sm gap-2">Grow Revenue</h4>
                                </div>
                                <div className="bg-indigo-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    <h4 className="font-bold flex items-center text-sm gap-2">Manage Fleet</h4>
                                </div>
                                <div className="bg-indigo-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    <h4 className="font-bold flex items-center text-sm gap-2">Real-time Data</h4>
                                </div>
                                <div className="bg-indigo-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    <h4 className="font-bold flex items-center text-sm gap-2">24/7 Support</h4>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500 rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500 rounded-full opacity-30 blur-3xl"></div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white h-auto overflow-y-auto max-h-[90vh] lg:max-h-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Partner Account</h1>
                            <p className="text-gray-500">Enter your details to register as a service provider.</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-start gap-3 animate-shake">
                                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Personal Info Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input name="name" type="text" required className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe" onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input name="email" type="email" required className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="name@company.com" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input name="password" type="password" required className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" onChange={handleChange} />
                                </div>
                            </div>

                            <div className="h-px bg-gray-200 my-4"></div>

                            {/* Business Info Group */}
                            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Business Details</h3>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                                            <option value="Bus">Bus Operator</option>
                                            <option value="Train">Train Partner</option>
                                            <option value="Air">Airline Partner</option>
                                            <option value="Ride">Ride / Carpool</option>
                                            <option value="Parking">Parking Owner</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-medium border-r border-gray-300 pr-2 flex items-center gap-1">
                                                🇮🇳 +91
                                            </span>
                                        </div>
                                        <input
                                            name="contactNumber"
                                            type="tel"
                                            required
                                            className="block w-full pl-24 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="98765 43210"
                                            maxLength="10"
                                            pattern="[0-9]{10}"
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                e.target.value = value;
                                                handleChange(e);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isLoading ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Already have a partner account?{' '}
                                <Link to="/partner/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors pb-1">
                                    Log in here
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
                    50% { opacity: 0.15; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 5s infinite;
                }
            `}</style>
        </div>
    );
};

export default PartnerSignup;
