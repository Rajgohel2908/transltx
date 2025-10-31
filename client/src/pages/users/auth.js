import { redirect } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function checkAuthLoader() {
  const token = getToken();

  if (!token) {
    return redirect("/login");
  }

  try {
    // Optional: Check if the token is expired
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return redirect("/login");
    }
  } catch (error) {
    // If token is malformed (like an empty string)
    localStorage.removeItem("token");
    return redirect("/login");
  }

  // Token is valid, no redirect
  return null;
}