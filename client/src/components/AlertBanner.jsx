import React, { useState, useEffect } from "react";
import axios from "axios";

const AlertIcon = ({ priority }) => {
  const iconColor =
    priority === "Critical"
      ? "text-red-500"
      : priority === "Warning"
      ? "text-yellow-500"
      : "text-blue-500";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-6 w-6 ${iconColor}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

const AlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL; // ✅ Use env

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/alerts/active`);
        setAlerts(response.data);
      } catch (error) {
        console.error("Failed to fetch service alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAlerts();
  }, [BACKEND_URL]);

  const getBannerStyle = () => {
    if (alerts.some((alert) => alert.priority === "Critical")) {
      return "bg-red-100 border-red-500 text-red-800";
    }
    if (alerts.some((alert) => alert.priority === "Warning")) {
      return "bg-yellow-100 border-yellow-500 text-yellow-800";
    }
    return "bg-blue-100 border-blue-500 text-blue-800";
  };

  if (loading || alerts.length === 0) return null;

  const mostRecentAlert = alerts[0];

  return (
    <div className={`border-l-4 p-4 ${getBannerStyle()}`} role="alert">
      <div className="container mx-auto flex items-center">
        <div className="flex-shrink-0">
          <AlertIcon priority={mostRecentAlert.priority} />
        </div>
        <div className="ml-3">
          <p className="font-bold">{mostRecentAlert.title}</p>
          <p className="text-sm">{mostRecentAlert.message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
