import React, { useState } from 'react';
import { X } from 'lucide-react';

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically call your API to send a reset link
    // For now, we'll just show a success message.
    console.log('Password reset requested for:', email);
    setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
    // You might want to clear the email field after submission
    // setEmail(''); 
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 md:p-14 text-center bg-white">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
        <X size={24} />
      </button>
      <h1 className="text-3xl font-bold mb-4" data-aos="fade-up">Forgot Password</h1>
      <p className="text-gray-600 mb-8" data-aos="fade-up" data-aos-delay="100">
        Enter your email and we'll send you a link to reset your password.
      </p>
      
      {message ? (
        <p className="text-green-600 bg-green-100 p-4 rounded-md">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="form-group" data-aos="fade-up" data-aos-delay="200">
            <input
              type="email"
              id="forgot-email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
            <label htmlFor="forgot-email" className="form-label">Email Address</label>
          </div>
          <button type="submit" className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold uppercase tracking-wider transform hover:scale-105 transition-transform" data-aos="fade-up" data-aos-delay="300">
            Send Reset Link
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;