import React, { useState, useEffect, useRef } from "react";
import { Navigation, Route, Menu, X, MapPin } from "lucide-react";
import Footer from "../components/Footer";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

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

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api';

// Helper component to fit map bounds
function ChangeView({ bounds }) {
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
    document.title = "Live Map | TransItIx";
  }, []);

  const [routes, setRoutes] = useState([]);
  const [from, setFrom] = useState({ name: "", coords: null });
  const [to, setTo] = useState({ name: "", coords: null });

  const [matchedRoute, setMatchedRoute] = useState(null);
  const [error, setError] = useState("");
  // const travelMode = "car"; // Not strictly needed if just using OSRM driving
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [settingPinFor, setSettingPinFor] = useState(null);

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

  const normalizePolyline = (pts) => {
    return dedupePoints(pts || []);
  };

  const formatDurationSec = (seconds) => {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds <= 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (hrs === 0) return `${mins} min`;
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

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/routes`);
        const routeData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setRoutes(routeData);
      } catch (err) {
        setError("Failed to fetch route schedules.");
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
  
  const handleSearch = async () => {
    setError("");
    setMatchedRoute(null);
    setRoutePolyline([]);
    setMapBounds(null);

    const fromCoords = from.coords || await geocode(from.name);
    const toCoords = to.coords || await geocode(to.name);

    if (fromCoords && toCoords) {
        try {
            // Using OSRM for driving route
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`
            );
            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                const stopsForRoute = [
                    { name: from.name || 'Start', lat: fromCoords[0], lng: fromCoords[1] },
                    { name: to.name || 'End', lat: toCoords[0], lng: toCoords[1] }
                ];
                // OSRM returns [lng, lat], Leaflet needs [lat, lng]
                const polyline = normalizePolyline(route.geometry.coordinates.map(coord => [coord[1], coord[0]]));
                
                setRoutePolyline(polyline);
                if (polyline.length > 0) setMapBounds(L.latLngBounds(polyline));
                setMatchedRoute({
                    name: "Optimized Route",
                    type: "car",
                    color: "#007BFF",
                    stops: stopsForRoute,
                    distance: (route.distance / 1000).toFixed(2) + " km",
                    duration: formatDurationSec(route.duration),
                });
            } else {
                setError(`Route not found.`);
            }
        } catch (err) {
            setError("Failed to fetch route.");
            console.error(err);
        }
    } else {
      setError("Locations not found.");
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
                <Navigation className="h-6 w-6 text-white" />
                <h1 className="text-xl font-bold">Live Map</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-blue-700 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Pickup</label>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Enter pickup location" value={from.name} onChange={(e) => setFrom({ name: e.target.value, coords: null })} className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-blue-600 ${settingPinFor === 'from' ? 'ring-2 ring-blue-600' : ''}`} />
                    <button type="button" onClick={() => setSettingPinFor('from')} className={`p-3 border rounded-lg transition-colors ${settingPinFor === 'from' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><MapPin size={20} /></button>
                  </div>
                </div>
                <div className="relative">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Dropoff</label>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Enter dropoff location" value={to.name} onChange={(e) => setTo({ name: e.target.value, coords: null })} className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:border-blue-600 ${settingPinFor === 'to' ? 'ring-2 ring-blue-600' : ''}`} />
                    <button type="button" onClick={() => setSettingPinFor('to')} className={`p-3 border rounded-lg transition-colors ${settingPinFor === 'to' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><MapPin size={20} /></button>
                  </div>
                </div>
              </div>

              <button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg transform active:scale-95">
                <Route className="h-5 w-5" />
                <span>See Route</span>
              </button>

              {matchedRoute ? (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Trip Details</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Fastest</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-medium">Distance</span>
                      <span className="text-xl font-bold text-gray-900">{matchedRoute.distance}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-medium">Est. Time</span>
                      <span className="text-xl font-bold text-gray-900">{matchedRoute.duration}</span>
                    </div>
                  </div>
                </div>
              ) : error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Map */}
        <div className="flex-1 relative">
          {!sidebarOpen && (<button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 z-20 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg lg:hidden"><Menu className="h-6 w-6" /></button>)}
          <div className="h-full w-full">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
              
              {/* --- RESTORED STANDARD OSM LAYER --- */}
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <ChangeView bounds={mapBounds} />
              <MapClickHandler />
              
              {routePolyline.length > 0 && (
                <>
                  <Polyline positions={routePolyline} color="#007BFF" weight={6} opacity={0.8} />
                </>
              )}

              {from.coords && (<Marker position={from.coords} icon={startIcon} draggable={true} eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); reverseGeocode(lat, lng).then(name => setFrom({ name, coords: [lat, lng] })); }, }}><Popup className="font-bold">Pickup</Popup></Marker>)}
              {to.coords && (<Marker position={to.coords} icon={endIcon} draggable={true} eventHandlers={{ dragend: (e) => { const { lat, lng } = e.target.getLatLng(); reverseGeocode(lat, lng).then(name => setTo({ name, coords: [lat, lng] })); }, }}><Popup className="font-bold">Dropoff</Popup></Marker>)}
            </MapContainer>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
 
export default RouteMap;