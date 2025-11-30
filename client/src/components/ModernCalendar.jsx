import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

const ModernCalendar = ({ selectedDate, onChange, minDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Format as YYYY-MM-DD for HTML input compatibility logic
    const offsetDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));
    onChange(offsetDate.toISOString().split('T')[0]);
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Normalization for accurate comparison (Time hata rahe hain taaki sirf Date compare ho)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minimumDate = minDate ? new Date(minDate) : today;
    minimumDate.setHours(0, 0, 0, 0);

    // Empty slots loop same rahega...
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      // Current day ka object banao
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = dateObj.toDateString();

      const isSelected = selectedDate && new Date(selectedDate).toDateString() === dateStr;
      const isToday = new Date().toDateString() === dateStr;

      // 2. Check kar: Agar date purani hai, toh disable kar de
      const isDisabled = dateObj < minimumDate;

      days.push(
        <button
          type="button"
          key={day}
          disabled={isDisabled} // Button disable kiya
          onClick={() => !isDisabled && handleDateClick(day)} // Click block kiya
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 
            ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
            ${!isSelected && !isDisabled ? 'hover:bg-blue-50 text-gray-700' : ''}
            ${isToday && !isSelected ? 'border border-blue-600 text-blue-600' : ''}
            ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''} // Disabled styling
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <CalIcon className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>
        <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {renderDays()}
      </div>
    </div>
  );
};

export default ModernCalendar;