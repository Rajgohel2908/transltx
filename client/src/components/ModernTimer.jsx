import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ModernTimer = ({ initialMinutes = 10, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0')
    };
  };

  const { mins, secs } = formatTime(timeLeft);
  const isCritical = timeLeft < 60; // Less than 1 min

  return (
    <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl shadow-md border transition-all duration-300
      ${isCritical 
        ? 'bg-red-50 border-red-200 shadow-red-100' 
        : 'bg-white border-gray-200'
      }`}
    >
      <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-blue-50'}`}>
        <Clock className={`h-5 w-5 ${isCritical ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
      </div>
      
      <div className="flex items-center">
        <div className="flex flex-col items-center">
          <span className={`text-2xl font-bold font-mono leading-none ${isCritical ? 'text-red-600' : 'text-gray-800'}`}>
            {mins}
          </span>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Min</span>
        </div>
        
        <span className={`mx-2 text-2xl font-bold pb-3 ${isCritical ? 'text-red-400' : 'text-gray-300'}`}>:</span>
        
        <div className="flex flex-col items-center">
          <span className={`text-2xl font-bold font-mono leading-none ${isCritical ? 'text-red-600' : 'text-gray-800'}`}>
            {secs}
          </span>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default ModernTimer;