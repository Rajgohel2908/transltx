import axios from "axios";
import { getToken } from "../pages/users/auth.js";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL; // Yeh ab 'http://localhost:3000/api' hai

const api = axios.create({
  baseURL: VITE_BACKEND_BASE_URL, // baseURL ab '/api' pe 'point' karta hai
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch current user safely
async function fetchCurrentUser() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const res = await api.get(`/users/me`);
    return res.data;
  } catch (err) {
    // If User not found (404), it might be a Partner
    if (err.response && err.response.status === 404) {
      try {
        const partnerRes = await api.get('/partners/me');
        return partnerRes.data;
      } catch (partnerErr) {
        console.log("Partner fetch failed also:", partnerErr.message);
      }
    }

    console.log("fetchCurrentUser error:", err.response?.data || err.message);
    // Only clear token if it's an auth error (401/403) to prevent loops on separate network errors
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }

    return {
      _id: null,
      name: "Anonymous User",
      email: null,
      createdAt: null,
    };
  }
}

// Signup user
async function signupUser(data) {
  try {
    // MODIFIED: '/api' 'prefix' ki zaroorat nahi
    const res = await api.post(`/users/signup`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Signup failed" };
  }
}

// Login user
async function loginUser(data) {
  try {
    // MODIFIED: '/api' 'prefix' ki zaroorat nahi
    const res = await api.post(`/users/login`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
}

async function getAdminUsers() {
  try {
    // MODIFIED: '/api' 'prefix' ki zaroorat nahi
    const response = await api.get(`/users/admin/users`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
}

export { fetchCurrentUser, signupUser, loginUser, getAdminUsers, api };