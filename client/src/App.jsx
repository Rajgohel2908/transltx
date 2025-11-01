// File: client/src/App.jsx
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import RouteMap from "./pages/LiveMap.jsx";
import Contact from "./pages/Contact.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import Parcel from "./pages/Parcel.jsx";
import Orders from "./pages/Orders.jsx";
import Login from "./pages/users/Login.jsx";
import Logout from "./pages/users/Logout.jsx";
import { PrivateRoute } from "./components/PrivateRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Context from "./context/Context.jsx";
import AOS from "aos";
import { useEffect } from "react";
import Booking from "./pages/Booking.jsx";
import CarpoolPage from "./pages/CarpoolPage.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Transport404 from "./pages/PageNotFound.jsx";

// Booking Flow Pages
import SearchResults from "./pages/SearchResults.jsx";
import PassengerDetails from "./pages/PassengerDetails.jsx";
import Confirmation from "./pages/Confirmation.jsx";

// --- Step 1: Import Navbar and AlertBanner here ---
import Navbar from "./components/Navbar.jsx";
import AlertBanner from "./components/AlertBanner";
import TripViewPage from "./pages/TripView.jsx";
import ParkingPage from "./pages/Parking.jsx"; 

function App() {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 500, // Animation duration in milliseconds
      once: true, // Whether animation should happen only once
    });
  }, []);
  return (
    <div className="min-h-screen bg-lightgray">
      <Context>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </Context>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();

  const hideNavbarOn = ['/user-login', '/user-signup'];
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
    <>
      {/* Step 3: Place Navbar and AlertBanner here, outside of Routes */}
      {shouldShowNavbar && <Navbar />}
      {shouldShowNavbar && <AlertBanner />}

      <div key={location.pathname} className="fade-scale-in">
        <Routes>
          {/* Step 4: Your routes no longer need to be wrapped in Context individually */}
          <Route path="/" element={<Home />} />
          <Route
            path="/live-map"
            element={
              <PrivateRoute>
                <RouteMap />
              </PrivateRoute>
            }
          />
          <Route
            path="/admindashboard"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:mode"
            element={
              <PrivateRoute>
                <Booking />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:mode/results"
            element={
              <PrivateRoute>
                <SearchResults />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:mode/passenger-details"
            element={
              <PrivateRoute>
                <PassengerDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/booking/:mode/confirmation"
            element={
              <PrivateRoute>
                <Confirmation />
              </PrivateRoute>
            }
          />
          <Route
            path="/carpool"
            element={
              <PrivateRoute>
                <CarpoolPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-trips"
            element={
              <PrivateRoute>
                <MyTrips />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/parcel"
            element={
              <PrivateRoute>
                <Parcel />
              </PrivateRoute>
            }
          />
          <Route
            path="/parking"
            element={
              <PrivateRoute>
                <ParkingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-trips/:id"
            element={
              <PrivateRoute>
                <TripViewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-logout"
            element={
              <PrivateRoute>
                <Logout />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-login" 
            element={<Login />}
          />
          <Route
            path="/user-signup" 
            element={<Login />}
          />
          <Route path="*" element={<Transport404 />} />
        </Routes>
      </div>
    </>
  )
}

export default App;