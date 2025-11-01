import React, { useState, useEffect, useMemo, useContext } from "react"; // <-- Add useContext
import { Navigation, Route, Menu, X, AlertCircle, Calendar, MapPin } from "lucide-react"; // <-- Add Calendar
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { handlePayment } from "../utils/cashfree";
import { DataContext } from "../context/Context.jsx"; // <-- Add this
import { api } from "../utils/api.js"; // <-- Add this
import CarpoolOfferModal from "../components/CarpoolOfferModal.jsx"; // <-- Add this

// --- Leaflet Icon Fix ---
// This is a common issue with React-Leaflet and bundlers like Vite.
// It manually sets the paths for the default marker icons.
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl, iconUrl, shadowUrl,
});

// --- Custom Marker Icons ---
const startIcon = L.icon({
    iconUrl: '/images/gps-green.png', // Correct path for Vite public assets
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
});

const endIcon = L.icon({
    iconUrl: '/images/gps-data.png', // Correct path for Vite public assets
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Using the default icon for intermediate stops
const viaIcon = new L.Icon.Default();

// Use the same backend env var used across the app. Fallback to /api if not set.
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api';

// Helper component to change the map's view
function ChangeView({ bounds }) {
	const [locationName, setLocationName] = useState(null);
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] }); // Add some padding
    }
  }, [bounds, map]);
  return null;
}
const RouteMap = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "RouteMap";
  }, []);

  const [routes, setRoutes] = useState([]);
  const [from, setFrom] = useState({ name: "", coords: null });
  const [to, setTo] = useState({ name: "", coords: null });
  const [departureTime, setDepartureTime] = useState(""); // <-- Add this
  const [matchedRoute, setMatchedRoute] = useState(null);
  const [error, setError] = useState("");
  const travelMode = "car"; // 'car' is the only mode
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);

  // --- Add this new state ---
  const [settingPinFor, setSettingPinFor] = useState(null); // Can be 'from', 'to', or null

  // --- Add these new state variables ---
  const { user } = useContext(DataContext);
  const [showCarpoolModal, setShowCarpoolModal] = useState(false);
  const [bookedRideDetails, setBookedRideDetails] = useState(null);
  // --- End of new state variables ---

  // Helper: remove consecutive duplicate points
  const dedupePoints = (pts) => {
    if (!Array.isArray(pts) || pts.length === 0) return [];
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i-1];
      const b = pts[i];
      if (a[0] !== b[0] || a[1] !== b[1]) out.push(b);
    }
    return out;
  };

  // Ramer-Douglas-Peucker polyline simplification
  const simplifyRDP = (points, epsilon = 0.0005) => {
    if (!points || points.length < 3) return points || [];

    const sqDist = (p, q) => {
      const dx = p[0] - q[0];
      const dy = p[1] - q[1];
      return dx*dx + dy*dy;
    };

    const perpendicularDistance = (point, lineStart, lineEnd) => {
      const x0 = point[0], y0 = point[1];
      const x1 = lineStart[0], y1 = lineStart[1];
      const x2 = lineEnd[0], y2 = lineEnd[1];
      const num = Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1);
      const den = Math.sqrt((y2 - y1)*(y2 - y1) + (x2 - x1)*(x2 - x1));
      return den === 0 ? Math.sqrt(sqDist(point, lineStart)) : num / den;
    };

    const recurse = (pts, start, end, eps, result) => {
      let maxDist = 0;
      let index = -1;
      for (let i = start + 1; i < end; i++) {
        const d = perpendicularDistance(pts[i], pts[start], pts[end]);
        if (d > maxDist) { index = i; maxDist = d; }
      }
      if (maxDist > eps) {
        recurse(pts, start, index, eps, result);
        recurse(pts, index, end, eps, result);
      } else {
        result.push(pts[start]);
      }
    };

    const res = [];
    recurse(points, 0, points.length - 1, epsilon, res);
    res.push(points[points.length - 1]);
    // ensure order
    return res;
  };

  const normalizePolyline = (pts) => {
    const deduped = dedupePoints(pts || []);
    // epsilon is degrees; ~0.0005 ~ 50m depending on latitude
    const simplified = simplifyRDP(deduped, 0.0005);
    return simplified;
  };

  // Format a duration given in seconds into "X hr Y min"
  const formatDurationSec = (seconds) => {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds <= 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hrs} hr ${mins} min`;
  };

  // --- ADD THIS NEW COMPONENT ---
  // Helper component to handle map clicks and cursor changes
  function MapClickHandler() {
    const map = useMapEvents({
      click(e) {
        if (!settingPinFor) return;

        const { lat, lng } = e.latlng;
        reverseGeocode(lat, lng).then(name => {
          const location = { name, coords: [lat, lng] };
          if (settingPinFor === 'from') {
            setFrom(location);
          } else if (settingPinFor === 'to') {
            setTo(location);
          }
        });

        setSettingPinFor(null); // Reset after setting
      },
    });

    // Change cursor to crosshair when in pin-setting mode
    useEffect(() => {
      map.getContainer().style.cursor = settingPinFor ? 'crosshair' : 'grab';
    }, [settingPinFor, map]);

    return null; // This component doesn't render anything
  }
  // --- END OF NEW COMPONENT ---

  // --- ADD THIS NEW FUNCTION ---
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      return response.data.display_name;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };
  // --- END OF NEW FUNCTION ---

  // --- ADD THESE NEW FUNCTIONS ---
  const onPaymentSuccess = async (paymentResult) => {
    try {
      const bookingPayload = {
        userId: user._id,
        bookingType: matchedRoute.type === 'driving' ? 'Ride' : (matchedRoute.type || 'Bus'),
        service: matchedRoute.name,
        from: from,
        to: to,
        departure: departureTime || new Date().toISOString(),
        arrival: new Date().toISOString(), // Placeholder, real app would calculate
        passengers: [{ fullName: user.name, age: 30, gender: 'Unknown' }], // Placeholder data
        contactEmail: user.email,
        contactPhone: '9999999999', // Placeholder, modal will ask for real one
        fare: matchedRoute.price,
        paymentId: paymentResult.cf_payment_id,
        orderId: paymentResult.order_id,
        paymentStatus: 'SUCCESS',
        bookingStatus: 'Confirmed'
      };

      const res = await api.post(`${API_BASE_URL}/bookings`, bookingPayload);
      
      // Save details for the carpool modal
      setBookedRideDetails({ 
        ...res.data,
        from: from, // Pass readable names
        to: to,     // Pass readable names
        departure: bookingPayload.departure // Pass the correct departure time
      });
      setShowCarpoolModal(true); // Open the carpool modal
    } catch (error) {
      console.error("Failed to save booking:", error);
      setError('Payment was successful, but failed to save your booking. Please contact support.');
    }
  };

  const handleBookRoute = () => {
    if (!user) {
      setError('Please log in to book a ride.');
      return;
    }
    if (!matchedRoute || !matchedRoute.price) {
      setError('Cannot book this route. No price defined.');
      return;
    }
    if (!departureTime) {
      setError('Please select a departure date and time.');
      return;
    }
    handlePayment({
      item: { ...matchedRoute, name: matchedRoute.name || 'Custom Ride' }, // Ensure item has a name
      user: user,
      onPaymentSuccess: onPaymentSuccess
    });
  };
  // --- END OF NEW FUNCTIONS ---

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/routes`);
        // Ensure it's always an array
        const routeData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setRoutes(routeData);
      } catch (err) {
        setError("Failed to fetch route schedules. Please try again later.");
        console.error(err);
      }
    };
    fetchRoutes();
  }, []);

  const parseCoordinates = (input) => {
    const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = input.trim().match(coordRegex);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[3])];
    }
    return null;
  };

  const geocode = async (name) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${name}&format=json&limit=1`);
      if (response.data && response.data.length > 0) {
        return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Geocoding failed:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    setError("");
    setMatchedRoute(null);
    setRoutePolyline([]);
    setMapBounds(null);

    const fromCoords = from.coords || await geocode(from.name);
    const toCoords = to.coords || await geocode(to.name);

    if (fromCoords && toCoords) {
        // For car mode with specific coordinates, use OSRM for a direct route.
        try {
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`
            );
            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                const stopsForRoute = [
                    { name: from.name || 'Start', lat: fromCoords[0], lng: fromCoords[1], latitude: fromCoords[0], longitude: fromCoords[1] },
                    { name: to.name || 'End', lat: toCoords[0], lng: toCoords[1], latitude: toCoords[0], longitude: toCoords[1] }
                ];
                const polyline = normalizePolyline(route.geometry.coordinates.map(coord => [coord[1], coord[0]]));
                setRoutePolyline(polyline);
                if (polyline.length > 0) setMapBounds(L.latLngBounds(polyline));
                setMatchedRoute({
                    name: "Custom Driving Route",
                    type: "car",
                    color: "#007BFF",
                    stops: stopsForRoute,
                    distance: (route.distance / 1000).toFixed(2) + " km",
                    duration: formatDurationSec(route.duration),
                    price: parseFloat(((route.distance / 1000) * 12).toFixed(2)), // Example pricing: ₹12/km
                });
            } else {
                setError(`Driving route not found for the given coordinates.`);
            }
        } catch (err) {
            setError("Failed to fetch driving route. Please try again.");
            console.error(err);
        }
    } else {
      // Use graph-based shortest path across all routes (by stop name)
      if (!Array.isArray(routes) || routes.length === 0) return;

      const normalize = (s) => (s || "").trim().toLowerCase();
      const source = normalize(from.name);
      const target = normalize(to.name);

      // --- Primary Logic: Find the best predefined route that matches the travel mode ---
      const candidateRoutes = routes
        .filter(route => route.type === 'car')
        .map(route => {

        const sourceIndex = route.stops.findIndex(s => normalize(s.name) === source);
        const targetIndex = route.stops.findIndex(s => normalize(s.name) === target);

        // If both stops are on this route and in the correct order
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex < targetIndex) {
          const journeyStops = route.stops.slice(sourceIndex, targetIndex + 1);
          
          // Calculate total duration for this part of the journey
          const totalDuration = journeyStops.slice(1).reduce((acc, stop) => acc + (stop.duration || 0), 0);

          return {
            ...route,
            journeyStops, // The specific stops for this trip
            totalDuration, // The calculated travel time in minutes
          };
        }
        return null;
      }).filter(Boolean); // Remove null entries

      if (candidateRoutes.length > 0) {
        // Sort by the shortest travel time to find the best route
        candidateRoutes.sort((a, b) => a.totalDuration - b.totalDuration);
        const bestRoute = candidateRoutes[0];

        // --- Fetch road-following polyline for driving, but straight lines for train/air ---
        if (travelMode === 'car') {
          try {
            const stopCoords = bestRoute.journeyStops.map(s => `${s.longitude},${s.latitude}`).join(';');
            const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${stopCoords}?overview=full&geometries=geojson`, { timeout: 10000 });
            
            if (osrmRes.data?.routes?.length) {
              const routeObj = osrmRes.data.routes[0];
              const polyline = normalizePolyline(routeObj.geometry.coordinates.map(c => [c[1], c[0]]));
              setRoutePolyline(polyline);
              if (polyline.length > 0) setMapBounds(L.latLngBounds(polyline));
            } else { throw new Error("OSRM returned no routes."); }
          } catch (err) {
            console.warn('OSRM polyline fetch failed, falling back to straight lines:', err?.message || err);
            const polyline = bestRoute.journeyStops.map(s => [s.latitude || s.lat, s.longitude || s.lng]);
            setRoutePolyline(polyline);
            if (polyline.length > 0) setMapBounds(L.latLngBounds(polyline));
          }
        }

        // Update state with the best route found
        setMatchedRoute({
          ...bestRoute,
          duration: `${bestRoute.totalDuration} min`, // Display the calculated duration
          stops: bestRoute.journeyStops, // Show only the relevant stops
        });
        return;
      }
      
      // --- Fallback Logic: If no predefined route, try a direct driving route ---
      const allStops = new Map();
      routes.forEach(route => {
        route.stops.forEach(stop => {
          allStops.set(normalize(stop.name), { name: stop.name, lat: stop.latitude, lng: stop.longitude, latitude: stop.latitude, longitude: stop.longitude });
        });
      });

      const sourceNode = allStops.get(source);
      const targetNode = allStops.get(target);

      if (!sourceNode || !targetNode) {
        setError(`Could not find coordinates for "${from}" or "${to}".`);
        return;
      }

      try {
        const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${sourceNode.lng},${sourceNode.lat};${targetNode.lng},${targetNode.lat}?overview=full&geometries=geojson`, { timeout: 10000 });
        if (osrmRes.data?.routes?.length) {
          const routeObj = osrmRes.data.routes[0];
          const polyline = normalizePolyline(routeObj.geometry.coordinates.map(c => [c[1], c[0]]));
          setRoutePolyline(polyline);
          if (polyline.length > 0) setMapBounds(L.latLngBounds(polyline));
          setMatchedRoute({ 
            name: 'Direct Driving Route', 
            stops: [{ ...sourceNode, name: from.name }, { ...targetNode, name: to.name }],
            type: 'driving', 
            color: '#007BFF', 
            distance: (routeObj.distance/1000).toFixed(2) + ' km', 
            duration: formatDurationSec(routeObj.duration) 
          });
          return;
        }
      } catch (err) {
        console.error('OSRM direct route failed:', err?.message || err);
      }

      // If all else fails, show an error.
      setError(`No direct route found between "${from}" and "${to}".`);
    }
  };

  const defaultCenter = [21.1645, 72.785];


  return (
    <>
      <div className="h-screen flex bg-gray-100 ">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-96" : "w-0"} transition-all duration-300 bg-white shadow-xl z-30 overflow-hidden`}>
          <div className="h-full flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="h-6 w-6" />
                <h1 className="text-xl font-bold">RouteMap</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-blue-700 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Plan Your Route</h2>
              <div className="space-y-3">
                {/* --- From Input --- */}
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700">From</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Click 'Set' or type coords"
                      value={from.name}
                      onChange={(e) => setFrom({ name: e.target.value, coords: null })}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 ${settingPinFor === 'from' ? 'ring-2 ring-blue-500' : 'focus:ring-blue-500'}`}
                    />
                    <button
                      type="button"
                      title="Set 'From' on map"
                      onClick={() => setSettingPinFor('from')}
                      className={`p-3 border rounded-lg transition-colors ${settingPinFor === 'from' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <MapPin size={20} />
                    </button>
                  </div>
                </div>

                {/* --- To Input --- */}
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700">To</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Click 'Set' or type coords"
                      value={to.name}
                      onChange={(e) => setTo({ name: e.target.value, coords: null })}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 ${settingPinFor === 'to' ? 'ring-2 ring-blue-500' : 'focus:ring-blue-500'}`}
                    />
                    <button
                      type="button"
                      title="Set 'To' on map"
                      onClick={() => setSettingPinFor('to')}
                      className={`p-3 border rounded-lg transition-colors ${settingPinFor === 'to' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <MapPin size={20} />
                    </button>
                  </div>
                </div>
                  
                              {/* --- Add this new field --- */}
                              <div className="relative">
                                <div className="absolute left-3 top-3 w-5 h-5 text-gray-400">
                                  <Calendar size={18} />
                                </div>
                                <input
                                  type="datetime-local"
                                  placeholder="Departure Time"
                                  value={departureTime}
                                  onChange={(e) => setDepartureTime(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              {/* --- End of new field --- */}
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Route className="h-5 w-5" />
                <span>Get Directions</span>
              </button>

              {from && to && (
                <>
                  {matchedRoute ? (
                    <div className="p-4 border-t mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Route Details
                      </h3>
                      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Service Name:</span>
                          <span className="font-semibold text-gray-800">{matchedRoute.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="font-semibold text-gray-800">{matchedRoute.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Route:</span>
                          <span className="font-semibold text-gray-800">{from.name} → {to.name}</span>
                        </div>
                        {matchedRoute.distance && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Distance:</span>
                            <span className="font-semibold text-gray-800">{matchedRoute.distance}</span>
                          </div>
                        )}
                        {matchedRoute.duration && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Duration:</span>
                            <span className="font-semibold text-gray-800">{matchedRoute.duration}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Route Color:</span>
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: matchedRoute.color || "#007BFF" }}></div>
                        </div>
                        {matchedRoute.price && (
                          <div className="flex items-center justify-between pt-3 border-t mt-3">
                            <span className="text-lg font-semibold text-gray-600">Fare:</span>
                            <span className="text-xl font-bold text-green-600">₹{matchedRoute.price}</span>
                          </div>
                        )}
                        {matchedRoute.price && (
                          <div className="mt-4 pt-3 border-t">
                            <button onClick={handleBookRoute} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                              <span>Book Now</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    error && (
                      <div className="p-4 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <strong>Error:</strong> {error}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Map */}
        <div className="flex-1 relative">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="h-full">
            <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%", zIndex: 0 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeView bounds={mapBounds} />
              
              {/* --- ADD THIS LINE --- */}
              <MapClickHandler />

              {/* --- ADD THESE MARKERS --- */}
              {from.coords && (
                <Marker
                  position={from.coords}
                  icon={startIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      reverseGeocode(lat, lng).then(name => setFrom({ name, coords: [lat, lng] }));
                    },
                  }}
                >
                  <Popup>Pickup Location</Popup>
                </Marker>
              )}
              {to.coords && (
                <Marker
                  position={to.coords}
                  icon={endIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      reverseGeocode(lat, lng).then(name => setTo({ name, coords: [lat, lng] }));
                    },
                  }}
                >
                  <Popup>Destination</Popup>
                </Marker>
              )}
              {/* --- END OF NEW MARKERS --- */}

              {/* Show custom route polyline if available */}
              {routePolyline.length > 0 && (
                <Polyline
                  positions={routePolyline}
                  color="#007BFF"
                  weight={5}
                />
              )}

              {/* Show predefined route polylines */}
              {(matchedRoute && !routePolyline.length ? [matchedRoute] : []).map((route) => (
                <Polyline
                  key={route.id || route._id}
                  positions={route.stops.map((s) => [s.latitude || s.lat, s.longitude || s.lng])}
                  color={route.color}
                />
              ))}

              {/* Show markers for the matched route */}
              {matchedRoute &&
                (matchedRoute.stops || []).map((stop, i, arr) => {
                  let iconToUse = viaIcon;
                  if (i === 0) {
                    iconToUse = startIcon;
                  } else if (i === arr.length - 1) {
                    iconToUse = endIcon;
                  }

                  return (
                    <Marker
                      key={`${matchedRoute.name}-stop-${i}`}
                      position={[stop.latitude || stop.lat, stop.longitude || stop.lng]}
                      icon={iconToUse}
                    >
                      <Popup>
                        <strong>{stop.name}</strong>
                        {i === 0 ? " (Start)" : i === arr.length - 1 ? " (End)" : ""}
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>
        </div>
      </div>
        <Footer />
      
        {/* --- Add this modal --- */}
        {showCarpoolModal && (
          <CarpoolOfferModal
            rideDetails={bookedRideDetails}
            user={user}
            onClose={() => setShowCarpoolModal(false)}
          />
        )}
        {/* --- End of modal --- */}
      </>  );
};
 
export default RouteMap;
