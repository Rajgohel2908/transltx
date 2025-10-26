import { Navigate } from "react-router-dom";
import React, { useContext } from "react";
import { DataContext } from "../context/Context.jsx";

const AdminRoute = ({ children }) => {
  const { user } = useContext(DataContext);

  // Directly check the user from context.
  const isAdmin = !!user?.is_admin;

  if (!user) return null; // or a loading spinner while user data is loading

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;
