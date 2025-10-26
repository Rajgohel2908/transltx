import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../context/Context.jsx";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

// --- Helper Icons ---
const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mx-2 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2 text-blue-500"
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

const NoOrdersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto h-16 w-16 text-blue-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// --- Order Card Component ---
const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 flex items-center">
              <CalendarIcon />
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-400 mt-1">Order ID: {order._id}</p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-center text-center">
          <div className="flex-1">
            <p className="text-sm text-gray-500">From</p>
            <p className="font-bold text-gray-800 text-lg">{order.source}</p>
          </div>
          <ArrowRightIcon />
          <div className="flex-1">
            <p className="text-sm text-gray-500">To</p>
            <p className="font-bold text-gray-800 text-lg">{order.destination}</p>
          </div>
        </div>

        {order.adminTag && (
          <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 flex items-center">
            <InfoIcon />
            <span>{order.adminTag}</span>
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Fare:{" "}
            <span className="font-bold text-lg text-green-600">
              ₹{order.fare.toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Weight: <span className="font-bold">{order.weight} kg</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Loader Component ---
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    <div className="mt-4 flex items-center justify-center text-center">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
        <div className="h-6 bg-gray-300 rounded w-28 mx-auto"></div>
      </div>
      <div className="h-5 w-5 bg-gray-200 rounded-full mx-2"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
        <div className="h-6 bg-gray-300 rounded w-28 mx-auto"></div>
      </div>
    </div>
    <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between items-center">
      <div className="h-6 bg-gray-300 rounded w-24"></div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

// --- Main Orders Page Component ---
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(DataContext);

  // Use environment variable for API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/parcels/user/${user._id}`
        );
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, API_BASE_URL]);

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-blue-500 pb-2 inline-block">
            My Orders
          </h1>

          {error && <p className="text-center text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            ) : Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => <OrderCard key={order._id} order={order} />)
            ) : (
              <div className="md:col-span-2 lg:col-span-3 text-center py-16 px-6 bg-white rounded-lg shadow-md">
                <NoOrdersIcon />
                <h2 className="text-2xl font-semibold text-gray-700 mt-4">
                  No Orders Found
                </h2>
                <p className="text-gray-500 mt-2">
                  You haven't sent any parcels yet. Let's change that!
                </p>
                <Link
                  to="/parcel"
                  className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Send Your First Parcel
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Orders;
