import React, { useState, useEffect, useMemo } from "react";
import { Navigation, Route, Menu, X, AlertCircle, Calendar, MapPin } from "lucide-react";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
// --- REMOVED: handlePayment, DataContext, api, CarpoolOfferModal ---

// --- Leaflet Icon Fix ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl, iconUrl, shadowUrl,
});

// --- Custom Marker Icons ---
const startIcon = L.icon({
    iconUrl: '/images/gps-green.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const endIcon = L.icon({
    iconUrl: '/images/gps-data.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const viaIcon = new L.Icon.Default();
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api';

function ChangeView({ bounds }) {
	const [locationName, setLocationName] = useState(null);
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
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

  const [matchedRoute, setMatchedRoute] = useState(null);
  const [error, setError] = useState("");
  const travelMode = "car";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [settingPinFor, setSettingPinFor] = useState(null);
  // --- REMOVED: user, showCarpoolModal, bookedRideDetails state ---

  // ... (keep dedupePoints, simplifyRDP, normalizePolyline, formatDurationSec) ...
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

  const simplifyRDP = (points, epsilon = 0.0005) => {
    if (!points || points.length < 3) return points || [];
    const sqDist = (p, q) => (p[0] - q[0])**2 + (p[1] - q[1])**2;
    const perpendicularDistance = (point, lineStart, lineEnd) => {
      const [x0, y0] = point;
      const [x1, y1] = lineStart;
      const [x2, y2] = lineEnd;
      const num = Math.abs((y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1);
      const den = Math.sqrt((y2 - y1)**2 + (x2 - x1)**2);
      return den === 0 ? Math.sqrt(sqDist(point, lineStart)) : num / den;
    };
    const recurse = (pts, start, end, eps, result) => {
      let maxDist = 0, index = -1;
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
    return res;
  };

  const normalizePolyline = (pts) => {
    const deduped = dedupePoints(pts || []);
    const simplified = simplifyRDP(deduped, 0.0005);
    return simplified;
  };

  const formatDurationSec = (seconds) => {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds <= 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return `${hrs} hr ${mins} min`;
  };

  function MapClickHandler() {
    const map = useMapEvents({
      click(e) {
        if (!settingPinFor) return;
        const { lat, lng } = e.latlng;
        reverseGeocode(lat, lng).then(name => {
          const location = { name, coords: [lat, lng] };
          if (settingPinFor === 'from') setFrom(location);
          else if (settingPinFor === 'to') setTo(location);
        });
        setSettingPinFor(null);
      },
    });
    useEffect(() => {
      map.getContainer().style.cursor = settingPinFor ? 'crosshair' : 'grab';
    }, [settingPinFor, map]);
    return null;
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      return response.data.display_name;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };
  
  // --- REMOVED: onPaymentSuccess and handleBookRoute functions ---

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/routes`);
        const routeData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setRoutes(routeData);
      } catch (err) {
        setError("Failed to fetch route schedules. Please try again later.");
        console.error(err);
      }
    };
    fetchRoutes();
  }, []);

  const geocode = async (name) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`);
      if (response.data && response.data.length > 0) {
        return [parseFloat(response.data[0].lat), parseFloat(response.data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Geocoding failed:", error);
      return null;
    }
  };
  
  // ... (handleSearch function remains the same, but remove price calculation) ...
  const handleSearch = async () => {
    setError("");
    setMatchedRoute(null);
    setRoutePolyline([]);
    setMapBounds(null);

    const fromCoords = from.coords || await geocode(from.name);
    const toCoords = to.coords || await geocode(to.name);

    if (fromCoords && toCoords) {
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
                    // --- PRICE REMOVED ---
                });
            } else {
                setError(`Driving route not found for the given coordinates.`);
            }
        } catch (err) {
            setError("Failed to fetch driving route. Please try again.");
            console.error(err);
        }
    } else {
      if (!Array.isArray(routes) || routes.length === 0) return;
      const normalize = (s) => (s || "").trim().toLowerCase();
      const source = normalize(from.name);
      const target = normalize(to.name);

      const candidateRoutes = routes
        .filter(route => route.type === 'car')
        .map(route => {
        const sourceIndex = route.stops.findIndex(s => normalize(s.name) === source);
        const targetIndex = route.stops.findIndex(s => normalize(s.name) === target);
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex < targetIndex) {
          const journeyStops = route.stops.slice(sourceIndex, targetIndex + 1);
          const totalDuration = journeyStops.slice(1).reduce((acc, stop) => acc + (stop.duration || 0), 0);
          return { ...route, journeyStops, totalDuration };
        }
        return null;
      }).filter(Boolean);

      if (candidateRoutes.length > 0) {
        candidateRoutes.sort((a, b) => a.totalDuration - b.totalDuration);
        const bestRoute = candidateRoutes[0];

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
        setMatchedRoute({ ...bestRoute, duration: `${bestRoute.totalDuration} min`, stops: bestRoute.journeyStops });
        return;
      }
      
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
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700">From</label>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Click 'Set' or type coords" value={from.name} onChange={(e) => setFrom({ name: e.target.value, coords: null })} className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 ${settingPinFor === 'from' ? 'ring-2 ring-blue-500' : 'focus:ring-blue-500'}`} />
                    <button type="button" title="Set 'From' on map" onClick={() => setSettingPinFor('from')} className={`p-3 border rounded-lg transition-colors ${settingPinFor === 'from' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><MapPin size={20} /></button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700">To</label>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Click 'Set' or type coords" value={to.name} onChange={(e) => setTo({ name: e.target.value, coords: null })} className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500 ${settingPinFor === 'to' ? 'ring-2 ring-blue-500' : 'focus:ring-blue-500'}`} />
                    <button type="button" title="Set 'To' on map" onClick={() => setSettingPinFor('to')} className={`p-3 border rounded-lg transition-colors ${settingPinFor === 'to' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><MapPin size={20} /></button>
                  </div>
                </div>

              </div>

              <button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
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
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Route:</span><span className="font-semibold text-gray-800">{from.name} → {to.name}</span></div>
                        {matchedRoute.distance && (<div className="flex items-center justify-between"><span className="text-sm text-gray-600">Distance:</span><span className="font-semibold text-gray-800">{matchedRoute.distance}</span></div>)}
                        {matchedRoute.duration && (<div className="flex items-center justify-between"><span className="text-sm text-gray-600">Duration:</span><span className="font-semibold text-gray-800">{matchedRoute.duration}</span></div>)}
                        {/* --- REMOVED Price and Book Button --- */}
                      </div>
                    </div>
                  ) : (
                    error && (<div className="p-4 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"><strong>Error:</strong> {error}</div>)
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Map */}
        <div className="flex-1 relative">
          {!sidebarOpen && (<button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 z-20 bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg lg:hidden"><Menu className="h-5 w-5" /></button>)}
          <div className="h-full">
            <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%", zIndex: 0 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeView bounds={mapBounds} />
              <MapClickHandler />
              {from.coords && (<Marker position={from.coords} icon={startIcon} draggable={true} eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); reverseGeocode(lat, lng).then(name => setFrom({ name, coords: [lat, lng] })); }, }}><Popup>Pickup Location</Popup></Marker>)}
              {to.coords && (<Marker position={to.coords} icon={endIcon} draggable={true} eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); reverseGeocode(lat, lng).then(name => setTo({ name, coords: [lat, lng] })); }, }}><Popup>Destination</Popup></Marker>)}
              {routePolyline.length > 0 && (<Polyline positions={routePolyline} color="#007BFF" weight={5} />)}
              {(matchedRoute && !routePolyline.length ? [matchedRoute] : []).map((route) => (<Polyline key={route.id || route._id} positions={route.stops.map((s) => [s.latitude || s.lat, s.longitude || s.lng])} color={route.color} />))}
              {matchedRoute && (matchedRoute.stops || []).map((stop, i, arr) => {
                  let iconToUse = viaIcon;
                  if (i === 0) iconToUse = startIcon;
                  else if (i === arr.length - 1) iconToUse = endIcon;
                  return (<Marker key={`${matchedRoute.name}-stop-${i}`} position={[stop.latitude || stop.lat, stop.longitude || stop.lng]} icon={iconToUse}><Popup><strong>{stop.name}</strong>{i === 0 ? " (Start)" : i === arr.length - 1 ? " (End)" : ""}</Popup></Marker>);
              })}
            </MapContainer>
          </div>
        </div>
      </div>
        <Footer />
      {/* --- REMOVED CarpoolOfferModal --- */}
      </>
  );
};
 
export default RouteMap;