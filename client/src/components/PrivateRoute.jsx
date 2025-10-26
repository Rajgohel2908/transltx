import { Navigate } from 'react-router-dom';
import React from 'react';
import {jwtDecode} from 'jwt-decode';
import Context from "../context/Context.jsx";

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
};

const PrivateRoute = ({ children }) =>  {
  return (
    <Context>
      {isAuthenticated() ? children : <Navigate to="/user-login" />}
    </Context>
)}

const NotPrivateRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/" /> : children;
}

export { PrivateRoute, NotPrivateRoute };