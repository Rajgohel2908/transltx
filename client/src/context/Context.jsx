import { createContext, useState, useEffect } from "react";
import { fetchCurrentUser } from '@/utils/api.js'

export const DataContext = createContext();

const Context = ({ children }) => {
  const [user, setUser] = useState({
    _id: null,
    name: "Anonymous User",
    email: null,
    createdAt: null,
  });

  useEffect(() => {
    const loadUser = async () => {
      const currUser = await fetchCurrentUser();
      setUser(currUser);
    };
    loadUser();
  }, []);

  return <DataContext.Provider value={{ user }}>{children}</DataContext.Provider>;
};

export default Context;
