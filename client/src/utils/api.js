import axios from "axios";
import { getToken } from "../pages/users/auth.js";

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

// Fetch current user safely
async function fetchCurrentUser() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const res = await axios.get(`${VITE_BACKEND_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.log("fetchCurrentUser error:", err.response?.data || err.message);
    // Clear both storages on auth error
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
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
    const res = await axios.post(`${VITE_BACKEND_BASE_URL}/users/signup`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Signup failed" };
  }
}

// Login user
async function loginUser(data) {
  try {
    const res = await axios.post(`${VITE_BACKEND_BASE_URL}/users/login`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
}

async function getAdminUsers() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found.");
    }
    const response = await axios.get(`${VITE_BACKEND_BASE_URL}/users/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
}

export { fetchCurrentUser, signupUser, loginUser, getAdminUsers };
