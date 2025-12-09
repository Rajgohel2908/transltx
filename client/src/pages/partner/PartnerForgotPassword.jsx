import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import Footer from '../../components/Footer';
import { Mail, ArrowRight, Loader, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const PartnerForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/users/forgot-password', { email });
            setStatus({
                type: 'success',
                message: `Reset link sent to ${email}. Check your inbox!`
            });
            setEmail('');
        } catch (error) {
            console.error(error);
            setStatus({
                type: 'error',
                message: error.response?.data?.error || "Failed to send reset link. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-between">
            <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up p-8 md:p-10">

                    <div className="text-center mb-8">
                        <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
                            <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Don't worry! It happens. Please enter the email associated with your partner account.
                        </p>
                    </div>

                    {status.message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 animate-fade-in ${status.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            {status.type === 'success' ? (
                                <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                            )}
                            <p className={`text-sm font-medium ${status.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                {status.message}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    placeholder="partner@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
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
                                <span className="flex items-center gap-2">Send Reset Link <ArrowRight className="w-4 h-4" /></span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/partner/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
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
                 @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PartnerForgotPassword;
