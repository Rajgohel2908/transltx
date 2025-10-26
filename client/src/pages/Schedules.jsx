import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- Helper Icons ---
const BusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v11.494m-9-5.494h18"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 18a6 6 0 100-12 6 6 0 000 12z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 12H5"
    />
  </svg>
);
const MetroIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 21a9 9 0 100-18 9 9 0 000 18z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h14"
    />
  </svg>
);
const TimeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 transition-transform duration-300 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

// --- Timetable Generation Logic ---
const generateTimetable = (startTime, endTime, frequency) => {
  const times = [];
  let [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentTime = new Date();
  currentTime.setHours(startHour, startMinute, 0, 0);

  const endTimeObj = new Date();
  endTimeObj.setHours(endHour, endMinute, 0, 0);

  while (currentTime <= endTimeObj) {
    times.push(
      currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
    currentTime.setMinutes(currentTime.getMinutes() + frequency);
  }
  return times;
};

// --- Main Schedules Page Component ---
const Schedules = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/routes");
        setRoutes(response.data);
      } catch (err) {
        setError("Failed to fetch route schedules. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const getRouteIcon = (type) => {
    switch (type) {
      case "bus":
        return <BusIcon />;
      case "metro":
        return <MetroIcon />;
      default:
        return <div className="w-6 h-6" />;
    }
  };

  return (
    <>

  <Navbar />
  <div className="bg-gradient-to-b from-white to-slate-100 min-h-screen">
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">Route Schedules</h1>
        <p className="text-lg text-gray-500">Browse all available routes and view their stops and timetables.</p>
      </div>


      {loading && (
        <p className="text-center text-gray-500 text-lg">Loading schedules...</p>
      )}
      {error && (
        <p className="text-center text-red-500 text-lg">{error}</p>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {routes.map((route, index) => (
            <div
              key={route.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm transition hover:shadow-md"
            >
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-full bg-opacity-20"
                    style={{
                      backgroundColor: `${route.color}20`,
                      color: route.color,
                    }}
                  >
                    {getRouteIcon(route.type)}
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {route.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {route.stops.length} stops • Every {route.frequency} mins
                    </p>
                  </div>
                </div>
                <ChevronDownIcon
                  className={`text-gray-500 group-hover:text-gray-700 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
                  activeIndex === index
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="border-t border-gray-100 px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stops */}
                  <div className="md:col-span-1">
                    <h3 className="text-base font-semibold text-gray-700 mb-3">
                      Stops
                    </h3>
                    <ul className="space-y-2">
                      {route.stops.map((stop, stopIndex) => (
                        <li
                          key={stopIndex}
                          className="flex items-center text-gray-600 text-sm"
                        >
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          {stop.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Timetable */}
                  <div className="md:col-span-2">
                    <h3 className="text-base font-semibold text-gray-700 mb-3">
                      Timetable
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <TimeIcon />
                      <span>
                        First trip at{" "}
                        {new Date(
                          `1970-01-01T${route.startTime}`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}, every {route.frequency} minutes.
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-lg grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 border border-dashed border-gray-200">
                      {generateTimetable(
                        route.startTime,
                        route.endTime,
                        route.frequency
                      ).map((time, timeIndex) => (
                        <span
                          key={timeIndex}
                          className="bg-white text-center py-1.5 px-3 rounded-md shadow-sm text-gray-700 text-sm hover:bg-blue-50 transition"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ))}
        </div>
      )}
    </main>
  </div>
  <Footer />
</>


  );
};

export default Schedules;
