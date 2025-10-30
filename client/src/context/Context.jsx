import { createContext, useState, useEffect } from "react";
import { fetchCurrentUser } from '@/utils/api.js'

export const DataContext = createContext();

const Context = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currUser = await fetchCurrentUser();
        setUser(currUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null); // Or handle error appropriately
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  return <DataContext.Provider value={{ user, loading }}>{children}</DataContext.Provider>;
};

export default Context;
