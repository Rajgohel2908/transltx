import React, { useState, useEffect } from 'react';
import { Home, Calendar, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Transport404 = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Route Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Animated Bus Illustration */}
          <div className="mb-8 relative">
            <div className="relative mx-auto w-64 h-40 md:w-80 md:h-48">
              {/* Road */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-600 rounded-lg shadow-lg">
                <div className="absolute top-2 left-0 right-0 h-1 bg-yellow-400 animate-pulse"></div>
                <div className="absolute bottom-2 left-4 right-4 h-0.5 bg-white opacity-50"></div>
              </div>
              
              {/* Bus */}
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="relative">
                  {/* Bus Body */}
                  <div className="w-32 h-20 md:w-40 md:h-24 bg-blue-600 rounded-lg shadow-xl relative overflow-hidden">
                    {/* Bus Windows */}
                    <div className="absolute top-2 left-2 right-2 h-8 bg-blue-200 rounded opacity-80"></div>
                    <div className="absolute top-3 left-3 w-6 h-6 bg-white rounded opacity-90"></div>
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded opacity-90"></div>
                    
                    {/* Bus Door */}
                    <div className="absolute bottom-2 right-4 w-4 h-12 bg-blue-800 rounded"></div>
                    
                    {/* Bus Stripes */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400"></div>
                  </div>
                  
                  {/* Wheels */}
                  <div className="absolute -bottom-3 left-2 w-6 h-6 bg-gray-800 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                  <div className="absolute -bottom-3 right-2 w-6 h-6 bg-gray-800 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                  
                  {/* Confused/Lost indicator */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>❓</div>
                  </div>
                </div>
              </div>

              {/* GPS Signal Animation */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className={`transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-6xl md:text-8xl font-bold text-blue-600 mb-4 tracking-tight">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-2 max-w-md mx-auto">
              Oops! We can't seem to find the page you're looking for.
            </p>
            <p className="text-base md:text-lg text-gray-500 mb-8 max-w-lg mx-auto">
              It looks like you've taken a wrong turn. Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {/* Primary Button */}
            <Link to="/" className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-6 group">
              <Home className="w-5 h-5 mr-2" />
              Back to Homepage
              <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            {/* Secondary Links */}
            <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
              <Link to="/schedules" className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-blue-200 hover:border-blue-300">
                <Calendar className="w-4 h-4 mr-2" />
                View Schedules
              </Link>
              <Link to="/my-trips" className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-blue-200 hover:border-blue-300">
                <MapPin className="w-4 h-4 mr-2" />
                Plan Your Trip
              </Link>
              <Link to="/contact" className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <Phone className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className={`mt-12 transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Need immediate assistance? Our customer support team is available 24/7 to help you navigate our services.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-4 left-4 opacity-20">
        <div className="w-12 h-12 border-2 border-blue-400 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute top-4 left-4 opacity-20">
        <div className="w-8 h-8 border-2 border-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="absolute bottom-4 right-4 opacity-20">
        <div className="w-10 h-10 border-2 border-blue-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

export default Transport404;