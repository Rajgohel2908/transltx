import axios from "axios";
import { getToken } from "../pages/users/auth.js";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000/api"; // Fallback to localhost:3000/api

console.log("API Base URL:", VITE_BACKEND_BASE_URL);

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
  console.log("🔍 fetchCurrentUser: Token exists?", !!token);

  if (!token) {
    console.log("❌ No token found - user not authenticated");
    return null;
  }

  try {
    console.log("📡 Attempting to fetch user from /users/me...");
    const res = await api.get(`/users/me`);
    console.log("✅ User fetched successfully:", res.data.email);
    return res.data;
  } catch (err) {
    console.log("⚠️ /users/me failed:", err.response?.status, err.response?.data || err.message);

    // If User not found (404), it might be a Partner
    if (err.response && err.response.status === 404) {
      try {
        console.log("📡 Trying /partners/me...");
        const partnerRes = await api.get('/partners/me');
        // Partner endpoint returns {user: partner}, so extract the user
        const partnerData = partnerRes.data.user || partnerRes.data;
        console.log("✅ Partner fetched successfully:", partnerData?.email);
        return partnerData;
      } catch (partnerErr) {
        console.log("❌ Partner fetch also failed:", partnerErr.message);
      }
    }

    // Clear token if it's an auth error (401/403)
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      console.log("🔐 Invalid/expired token - clearing storage");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }

    // IMPORTANT: Return null on any error, not a fake user object
    console.log("❌ Returning null - user will be redirected to login");
    return null;
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

// Partner signup
async function signupPartner(data) {
  try {
    const res = await api.post(`/partners/signup`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Partner signup failed" };
  }
}

// Partner login
async function loginPartner(data) {
  try {
    const res = await api.post(`/partners/login`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Partner login failed" };
  }
}

export { fetchCurrentUser, signupUser, loginUser, getAdminUsers, signupPartner, loginPartner, api };