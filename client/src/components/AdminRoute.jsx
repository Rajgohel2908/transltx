import { Navigate } from "react-router-dom";
import React, { useContext } from "react";
import { DataContext } from "../context/Context.jsx";

// A simple loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AdminRoute = ({ children }) => {
  // Assuming your context provides `user` and a `loading` state.
  const { user, loading } = useContext(DataContext);

  if (loading) return <LoadingSpinner />;

  return user?.is_admin ? children : <Navigate to="/" />;
};

export default AdminRoute;
