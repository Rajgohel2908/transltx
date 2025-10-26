import React, { useContext, useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom"; // Use NavLink for active styling
import { DataContext } from "../context/Context.jsx";

const Navbar = () => {
  const data = useContext(DataContext);
  const [isAuthenticated, setisAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    if (data.user?._id) {
      setisAuthenticated(true);
      setIsAdmin(!!data.user?.is_admin);
    } else {
      setisAuthenticated(false);
      setIsAdmin(false);
    }
  }, [data.user]);

  const [isOpen, setIsOpen] = useState(false);

  // Style for the active navigation link
  const activeLinkStyle = {
    color: "#2563EB", // This is Tailwind's blue-600
    borderBottom: "2px solid #2563EB",
  };

  // A reusable component for NavLinks to keep code DRY
  const NavItem = ({ to, children, end }) => (
    <NavLink
      to={to}
      end={end}
      className="text-gray-600 hover:text-blue-600 pb-1 transition-colors duration-300"
      style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </NavLink>
  );

  return (
    <nav className="bg-white text-gray-800 px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo / Site Name */}
        <Link to="/" className="text-2xl font-bold text-blue-600 transition">
          TransItIx
        </Link>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-10 h-10 group"
          >
            <div
              className={`w-6 h-0.5 bg-gray-800 my-1 transition-all duration-300 ease-in-out ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-gray-800 my-1 transition-all duration-300 ease-in-out ${
                isOpen ? "opacity-0" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-gray-800 my-1 transition-all duration-300 ease-in-out ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></div>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center text-md font-medium">
          <NavItem to="/" end>Home</NavItem>
          <NavItem to="/live-map">Live Map</NavItem>
          {/* <NavItem to="/schedules">Schedules</NavItem> */}
          <NavItem to="/my-trips">Trips</NavItem>
          <NavItem to="/carpool">Carpool</NavItem>
          <NavItem to="/parking">Parking</NavItem>
          <NavItem to="/parcel">Send a Parcel</NavItem>
          <NavItem to="/orders">My Orders</NavItem>
          <NavItem to="/contact">Contact</NavItem>
          {isAdmin ? <NavItem to="/admin/dashboard">Admin</NavItem> : null}
        </div>

        {/* Desktop Auth Button */}
        <div className="hidden md:flex">
          <Link
            to={isAuthenticated ? "/user-logout" : "/user-login"}
            className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            {isAuthenticated ? "Logout" : "Get Started"}
          </Link>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-screen pt-4" : "max-h-0"
        }`}
      >
        <div className="flex flex-col space-y-4 text-md font-medium">
          <NavItem to="/" end>Home</NavItem>
          <NavItem to="/live-map">Live Map</NavItem>
          <NavItem to="/schedules">Schedules</NavItem>
          <NavItem to="/carpool">Carpool</NavItem>
          <NavItem to="/my-trips">Trips</NavItem>
          <NavItem to="/orders">My Orders</NavItem>
          <NavItem to="/parking">Parking</NavItem>
          {isAdmin ? <NavItem to="/admin/dashboard">Admin</NavItem> : null}
          <NavItem to="/parcel">Send a Parcel</NavItem>
          <div className="pt-4">
            <Link
              to={isAuthenticated ? "/user-logout" : "/user-login"}
              className="bg-blue-600 text-white block text-center w-full font-bold px-5 py-3 rounded-lg hover:bg-blue-700 transition-all"
              onClick={() => setIsOpen(false)}
            >
              {isAuthenticated ? "Logout" : "Get Started"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
