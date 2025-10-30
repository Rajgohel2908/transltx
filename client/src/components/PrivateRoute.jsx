import { Navigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { DataContext } from "../context/Context.jsx";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const PrivateRoute = ({ children }) =>  {
  const { user, loading } = useContext(DataContext);

  if (loading) return <LoadingSpinner />;

  return user ? children : <Navigate to="/user-login" />;
}

const NotPrivateRoute = ({ children }) => {
  const { user, loading } = useContext(DataContext);

  if (loading) return <LoadingSpinner />;

  return user ? <Navigate to="/" /> : children;
}

export { PrivateRoute, NotPrivateRoute };