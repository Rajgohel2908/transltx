import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from "../../utils/api.js"; // Teri API utility import kar (agar hai toh)
// Agar api utility nahi hai to axios import kar: import axios from 'axios';

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Asli API Call
      // Agar axios use kar raha hai: await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      await api.post('/users/forgot-password', { email }); 
      
      setMessage(`Success! Check ${email} for the reset link.`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 md:p-14 text-center bg-white">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
        <X size={24} />
      </button>
      <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
      <p className="text-gray-600 mb-8">
        Enter your email and we'll send you a link to reset your password.
      </p>
      
      {message && <p className="text-green-600 bg-green-100 p-4 rounded-md mb-4">{message}</p>}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="form-group text-left">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Email Address"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold uppercase disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;