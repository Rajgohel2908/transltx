import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import RouteMap from "./pages/LiveMap.jsx";
import Contact from "./pages/Contact.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import Parcel from "./pages/Parcel.jsx";
import Orders from "./pages/Orders.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Login from "./pages/users/Login.jsx";
import Logout from "./pages/users/Logout.jsx";
import { PrivateRoute } from "./components/PrivateRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Context from "./context/Context.jsx";
import AOS from "aos";
import { useEffect } from "react";
import Booking from "./pages/Booking.jsx";
import RidePage from "./pages/RidePage.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Transport404 from "./pages/PageNotFound.jsx";

// Booking Flow Pages
import SearchResults from "./pages/SearchResults.jsx";
import PassengerDetails from "./pages/PassengerDetails.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import PaymentStatus from "./pages/PaymentStatus.jsx";

// --- Imported Components ---
import Navbar from "./components/Navbar.jsx";
import AlertBanner from "./components/AlertBanner";
import TripViewPage from "./pages/TripView.jsx";
import ParkingPage from "./pages/Parking.jsx";
// Forgot Password Component Import
import ResetPassword from "./pages/users/ResetPassword";
import PartnerSignup from "./pages/partner/PartnerSignup.jsx";
import PartnerLogin from "./pages/partner/PartnerLogin.jsx";
import PartnerForgotPassword from "./pages/partner/PartnerForgotPassword.jsx";
import PartnerDashboard from "./pages/partner/PartnerDashboard.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";
import ParkingDashboard from "./pages/partner/ParkingDashboard.jsx";

function App() {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 500,
      once: true,
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

  const hideNavbarOn = ['/user-login', '/user-signup', '/login', '/signup', '/partner/signup', '/partner/login', '/partner/dashboard', '/driver-dashboard', '/parking-dashboard'];

  // Logic: Hide navbar if path is in array OR if it starts with /reset-password/
  const shouldShowNavbar =
    !hideNavbarOn.includes(location.pathname) &&
    !location.pathname.startsWith("/reset-password/");

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {shouldShowNavbar && <AlertBanner />}

      {/* FIX: 'key={location.pathname}' hata diya hai taaki infinite re-render loop na ho */}
      <div className="fade-scale-in">
        <Routes>
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
            path="/admin/dashboard" // URL standard kar diya (/admin/dashboard)
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </PrivateRoute>
            }
          />

          {/* Booking Routes */}
          <Route
            path="/booking" // Added base route
            element={
              <PrivateRoute>
                <Booking />
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
            path="/booking/confirmation" // Fixed URL
            element={
              <PrivateRoute>
                <Confirmation />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment/status"
            element={
              <PrivateRoute>
                <PaymentStatus />
              </PrivateRoute>
            }
          />

          <Route
            path="/ride"
            element={
              <PrivateRoute>
                <RidePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={<Contact />}
          />
          <Route
            path="/my-trips"
            element={
              <PrivateRoute>
                <MyTrips />
              </PrivateRoute>
            }
          />

          {/* ... (existing imports) */}

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
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


          {/* Partner Routes */}
          <Route path="/partner/signup" element={<PartnerSignup />} />
          <Route path="/partner/login" element={<PartnerLogin />} />
          <Route path="/partner/forgot-password" element={<PartnerForgotPassword />} />
          <Route
            path="/partner/dashboard"
            element={
              <PrivateRoute>
                <PartnerDashboard />
              </PrivateRoute>
            }
          />

          {/* Driver Dashboard Route */}
          <Route
            path="/driver-dashboard"
            element={
              <PrivateRoute>
                <DriverDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/parking-dashboard"
            element={
              <PrivateRoute>
                <ParkingDashboard />
              </PrivateRoute>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/user-logout"
            element={
              <PrivateRoute>
                <Logout />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/user-login" element={<Login />} />
          <Route path="/user-signup" element={<Login />} />

          {/* Reset Password Route */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* 404 */}
          <Route path="*" element={<Transport404 />} />
        </Routes>
      </div>
    </>
  )
}

export default App;