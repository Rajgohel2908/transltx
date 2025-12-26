import { createContext, useState, useEffect, useCallback } from "react";
import { fetchCurrentUser } from '@/utils/api.js'

// Provide default value to prevent destructuring errors
export const DataContext = createContext({
  user: null,
  loading: true,
  refreshUser: () => { }
});

const Context = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load/refresh user data
  const loadUser = useCallback(async () => {
    console.log("🚀 Context: Loading user...");
    try {
      const currUser = await fetchCurrentUser();
      console.log("👤 Context: User loaded:", currUser ? `${currUser.email} (${currUser._id})` : "null");
      setUser(currUser);
      return currUser;
    } catch (error) {
      console.error("❌ Context: Failed to fetch user:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
      console.log("✅ Context: Loading complete");
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Expose refreshUser function for manual refresh (e.g., after login)
  const refreshUser = useCallback(async () => {
    setLoading(true);
    return await loadUser();
  }, [loadUser]);

  return <DataContext.Provider value={{ user, loading, refreshUser }}>{children}</DataContext.Provider>;
};

export default Context;
