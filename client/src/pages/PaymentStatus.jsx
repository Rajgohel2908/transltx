import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('VERIFYING'); // VERIFYING, SUCCESS, FAILED
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!orderId) {
            setStatus('FAILED');
            setMessage('Invalid Payment Link');
            return;
        }

        const verifyPayment = async () => {
            try {
                const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
                const response = await axios.post(`${VITE_BACKEND_BASE_URL}/payment/verify`, { orderId });

                if (response.data.status === 'PAID') {
                    setStatus('SUCCESS');
                    setMessage('Payment Successful! Your booking is confirmed.');
                    setTimeout(() => {
                        navigate('/orders');
                    }, 3000);
                } else {
                    setStatus('FAILED');
                    setMessage(`Payment Failed or Pending. Status: ${response.data.status}`);
                }
            } catch (error) {
                console.error("Verification Error:", error);
                setStatus('FAILED');
                setMessage('Failed to verify payment. Please contact support if money was deducted.');
            }
        };

        verifyPayment();
    }, [orderId, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                {status === 'VERIFYING' && (
                    <div className="flex flex-col items-center">
                        <Loader className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Verifying Payment</h2>
                        <p className="text-gray-600 mt-2">Please wait while we confirm your transaction...</p>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirecting to your orders...</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Go to Orders
                        </button>
                    </div>
                )}

                {status === 'FAILED' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => navigate('/booking')}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
