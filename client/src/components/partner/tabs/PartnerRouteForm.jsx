import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../../utils/api";
import { debounce } from 'lodash';
import { ArrowLeft, Save, MapPin, Clock, Calendar, DollarSign, Users } from 'lucide-react';

const PartnerRouteForm = ({ onRouteSaved, editingRoute, setEditingRoute, routeType, onCancel }) => {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [startPoint, setStartPoint] = useState("");
    const [endPoint, setEndPoint] = useState("");

    // Force type based on prop if provided (which it is for partners)
    const type = routeType || "bus";

    const [operator, setOperator] = useState("");
    const [estimatedArrivalTime, setEstimatedArrivalTime] = useState("12:00");
    const [amenitiesInput, setAmenitiesInput] = useState("");
    const [startTime, setStartTime] = useState("06:00");
    const [stops, setStops] = useState([]);
    const [flightNumber, setFlightNumber] = useState("");
    const [airline, setAirline] = useState("");
    const [platformNumber, setPlatformNumber] = useState("");

    // Generic Price/Seats for Bus/Air
    const [price, setPrice] = useState({ default: "" });
    const [totalSeats, setTotalSeats] = useState({ default: 40 });

    const [trainClasses, setTrainClasses] = useState([]);

    const [scheduleType, setScheduleType] = useState("daily");
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [specificDate, setSpecificDate] = useState('');
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);
    const [stopSuggestions, setStopSuggestions] = useState({});
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const [pickupPoints, setPickupPoints] = useState([]);
    const [dropPoints, setDropPoints] = useState([]);

    // Pre-fill Logic
    useEffect(() => {
        if (editingRoute) {
            setId(editingRoute.id);
            setName(editingRoute.name);
            setOperator(editingRoute.operator || '');
            setEstimatedArrivalTime(editingRoute.estimatedArrivalTime || '12:00');
            setStartTime(editingRoute.startTime || "06:00");
            setStartPoint(editingRoute.startPoint || "");
            setEndPoint(editingRoute.endPoint || "");
            setPlatformNumber(editingRoute.platformNumber || "");

            // Handle Price/Seats
            // Handle Price/Seats
            if ((type === 'train' || type === 'air') && typeof editingRoute.price === 'object') {
                const classes = [];
                Object.keys(editingRoute.price).forEach(key => {
                    if (key !== 'default') {
                        classes.push({
                            code: key,
                            price: editingRoute.price[key],
                            seats: editingRoute.totalSeats?.[key] || 0
                        });
                    }
                });
                setTrainClasses(classes.length ? classes : [{ code: type === 'train' ? 'SL' : 'Economy', price: '', seats: '' }]);
            } else {
                setTotalSeats(typeof editingRoute.totalSeats === 'object' ? editingRoute.totalSeats : { default: editingRoute.totalSeats || 40 });
                setPrice(typeof editingRoute.price === 'object' ? editingRoute.price : { default: editingRoute.price || "" });
            }

            setStops((editingRoute.stops || []).map(s => ({
                stopName: s.stopName || s.name || '',
                priceFromStart: s.priceFromStart || 0,
                estimatedTimeAtStop: s.estimatedTimeAtStop || ''
            })));

            setPickupPoints(editingRoute.pickupPoints || []);
            setDropPoints(editingRoute.dropPoints || []);

            setFlightNumber(editingRoute.flightNumber || "");
            setAirline(editingRoute.airline || "");

            setScheduleType(editingRoute.scheduleType || (type === 'air' ? 'specific_date' : 'daily'));
            setDaysOfWeek(editingRoute.daysOfWeek || []);
            setSpecificDate(editingRoute.specificDate ? new Date(editingRoute.specificDate).toISOString().split('T')[0] : '');
            setAmenitiesInput(Array.isArray(editingRoute.amenities) ? editingRoute.amenities.join(', ') : (editingRoute.amenities || ''));
        } else {
            setId("");
            setName("");
            setStartPoint("");
            setEndPoint("");
            setOperator("");
            setEstimatedArrivalTime('12:00');
            setStartTime("06:00");
            setStops([]);
            setPickupPoints([]);
            setDropPoints([]);
            setPrice({ default: "" });
            setTotalSeats({ default: 40 });
            setDaysOfWeek([]);
            setSpecificDate('');
            setAmenitiesInput('');
            setScheduleType(type === 'air' ? 'specific_date' : 'daily'); // Default to specific date for Air
            setPlatformNumber("");
            setTrainClasses([{ code: 'SL', price: '', seats: '' }]);
        }
    }, [editingRoute, type]);

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            let finalPrice = price;
            let finalSeats = totalSeats;

            if (type === 'bus') {
                finalPrice = parseFloat(price.default) || 0;
                finalSeats = { default: Number(totalSeats.default) || 40 };
            } else if (type === 'train' || type === 'air') {
                finalPrice = {};
                finalSeats = {};
                trainClasses.forEach(c => {
                    if (c.code && c.price) {
                        finalPrice[c.code] = parseFloat(c.price);
                        finalSeats[c.code] = parseInt(c.seats) || 0;
                    }
                });
                if (Object.keys(finalPrice).length === 0) throw new Error(`Please add at least one ${type === 'train' ? 'train' : 'flight'} class with price.`);
            }

            let routeData = {
                id, name, type, operator,
                amenities: amenitiesInput ? amenitiesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
                estimatedArrivalTime, startPoint, endPoint,
                price: finalPrice, totalSeats: finalSeats,
                scheduleType, startTime, stops,
                pickupPoints, dropPoints,
                platformNumber
            };

            if (scheduleType === 'weekly') routeData.daysOfWeek = daysOfWeek;
            if (scheduleType === 'specific_date' || type === 'air') routeData.specificDate = specificDate;

            setIsSubmitting(true);
            const response = editingRoute
                ? await api.put(`/routes/${editingRoute._id}`, routeData)
                : await api.post('/routes', routeData);

            onRouteSaved(response.data.route);
            setEditingRoute(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to save route");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reused Search Logic
    const searchHandler = (value, setSug, setLoad) => {
        if (!value) { setSug([]); setLoad(false); return; }
        api.get(`/locations?search=${value}&type=${type}`)
            .then(res => setSug(res.data || []))
            .catch(() => setSug([]))
            .finally(() => setLoad(false));
    };
    const debouncedSearch = useMemo(() => debounce(searchHandler, 300), [type]);

    const handleLocationChange = (val, setter, sugSetter) => {
        setter(val);
        setLoadingSuggestions(true);
        debouncedSearch(val, sugSetter, setLoadingSuggestions);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingRoute ? 'Edit Route' : 'Create New Route'}
                        {type === 'air' && <span className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded-full uppercase">Air</span>}
                        {type === 'train' && <span className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded-full uppercase">Train</span>}
                        {type === 'bus' && <span className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded-full uppercase">Bus</span>}
                    </h2>
                    <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {type === 'train' ? 'Train Number / ID' : type === 'air' ? 'Flight Number' : 'Route ID'}
                                </label>
                                <input type="text" value={id} onChange={e => setId(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder={type === 'train' ? "e.g. 12951" : type === 'air' ? "e.g. AI-202" : "e.g. BUS-001"} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {type === 'train' ? 'Train Name' : type === 'air' ? 'Airline Name' : 'Route Name'}
                                </label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder={type === 'train' ? "e.g. Rajdhani Express" : type === 'air' ? "e.g. Air India" : "e.g. Mumbai Express"} required />
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            {/* Start Point */}
                            <div className="relative">
                                <label className="text-xs font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1"><MapPin size={14} /> Start Point</label>
                                <input
                                    type="text"
                                    value={startPoint}
                                    onChange={e => handleLocationChange(e.target.value, setStartPoint, setStartSuggestions)}
                                    className="w-full p-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={type === 'air' ? "Airport Code (e.g. DEL)" : "City"}
                                    required
                                />
                                {startSuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white shadow-xl rounded-lg mt-1 max-h-40 overflow-y-auto border border-gray-100">
                                        {startSuggestions.map(s => (
                                            <li key={s.name} onClick={() => { setStartPoint(s.name); setStartSuggestions([]); }} className="p-2 hover:bg-gray-50 cursor-pointer text-sm">{s.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* End Point */}
                            <div className="relative">
                                <label className="text-xs font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1"><MapPin size={14} /> End Point</label>
                                <input
                                    type="text"
                                    value={endPoint}
                                    onChange={e => handleLocationChange(e.target.value, setEndPoint, setEndSuggestions)}
                                    className="w-full p-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={type === 'air' ? "Airport Code (e.g. BOM)" : "City"}
                                    required
                                />
                                {endSuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white shadow-xl rounded-lg mt-1 max-h-40 overflow-y-auto border border-gray-100">
                                        {endSuggestions.map(s => (
                                            <li key={s.name} onClick={() => { setEndPoint(s.name); setEndSuggestions([]); }} className="p-2 hover:bg-gray-50 cursor-pointer text-sm">{s.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>


                        {/* Schedule & Dates */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calendar size={16} /> Schedule</h4>
                            <div>
                                <select value={scheduleType} onChange={e => setScheduleType(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="specific_date">Specific Date</option>
                                </select>
                            </div>

                            {scheduleType === 'weekly' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Run On Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${daysOfWeek.includes(day) ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {scheduleType === 'specific_date' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Date</label>
                                    <input type="date" value={specificDate} onChange={e => setSpecificDate(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-lg" required />
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Amenities</label>
                            <textarea
                                value={amenitiesInput}
                                onChange={e => setAmenitiesInput(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder={type === 'air' ? "Meals Included, Extra Legroom, WiFi" : "WiFi, AC, Blankets, Charging Point (comma separated)"}
                                rows="2"
                            />
                        </div>

                        {/* Times & Extra Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Departure</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Arrival (Est)</label>
                                <input type="time" value={estimatedArrivalTime} onChange={e => setEstimatedArrivalTime(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" required />
                            </div>
                            {/* Platform Number for Train */}
                            {type === 'train' && (
                                <div className="col-span-2 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Number</label>
                                    <input type="text" value={platformNumber} onChange={e => setPlatformNumber(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" placeholder="e.g. 1" />
                                </div>
                            )}
                            {/* Generic Price/Seats for Bus Only */}
                            {type === 'bus' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                                        <input type="number" value={price.default || ''} onChange={e => setPrice({ ...price, default: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" placeholder="0" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Total Seats</label>
                                        <input type="number" value={totalSeats.default || ''} onChange={e => setTotalSeats({ ...totalSeats, default: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" placeholder="40" required />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Class Configuration for Train & Air */}
                        {(type === 'train' || type === 'air') && (
                            <div className={`${type === 'train' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'} p-5 rounded-xl border`}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        {type === 'train' ? 'Train Classes & Fares' : 'Flight Classes & Fares'}
                                    </h4>
                                    <button type="button" onClick={() => setTrainClasses([...trainClasses, { code: '', price: '', seats: '' }])} className={`text-xs font-bold px-2 py-1 rounded transition-colors ${type === 'train' ? 'text-orange-600 hover:bg-orange-100' : 'text-blue-600 hover:bg-blue-100'}`}>
                                        + Add Class
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {trainClasses.map((cls, i) => (
                                        <div key={i} className="flex gap-3 items-center">
                                            <div className="flex-1">
                                                <input
                                                    placeholder={type === 'train' ? "Class (e.g. 3A, SL)" : "Class (e.g. Economy, Business)"}
                                                    value={cls.code}
                                                    onChange={e => {
                                                        const newClasses = [...trainClasses];
                                                        newClasses[i].code = type === 'train' ? e.target.value.toUpperCase() : e.target.value;
                                                        setTrainClasses(newClasses);
                                                    }}
                                                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded uppercase"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Price (₹)"
                                                    value={cls.price}
                                                    onChange={e => {
                                                        const newClasses = [...trainClasses]; newClasses[i].price = e.target.value; setTrainClasses(newClasses);
                                                    }}
                                                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    placeholder="Seats"
                                                    value={cls.seats}
                                                    onChange={e => {
                                                        const newClasses = [...trainClasses]; newClasses[i].seats = e.target.value; setTrainClasses(newClasses);
                                                    }}
                                                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded"
                                                />
                                            </div>
                                            <button type="button" onClick={() => setTrainClasses(trainClasses.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Pickup & Drop Points (Only for Bus) */}
                        {type === 'bus' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pickup Points */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-bold text-gray-700">Pickup Points</h4>
                                        <button type="button" onClick={() => setPickupPoints([...pickupPoints, { location: '', time: '' }])} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {pickupPoints.map((p, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input placeholder="Location" value={p.location} onChange={e => {
                                                    const newPoints = [...pickupPoints]; newPoints[i].location = e.target.value; setPickupPoints(newPoints);
                                                }} className="flex-grow p-2 text-sm bg-white border border-gray-200 rounded" />
                                                <input type="time" value={p.time} onChange={e => {
                                                    const newPoints = [...pickupPoints]; newPoints[i].time = e.target.value; setPickupPoints(newPoints);
                                                }} className="w-24 p-2 text-sm bg-white border border-gray-200 rounded" />
                                                <button type="button" onClick={() => setPickupPoints(pickupPoints.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Drop Points */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-bold text-gray-700">Drop Points</h4>
                                        <button type="button" onClick={() => setDropPoints([...dropPoints, { location: '', time: '' }])} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {dropPoints.map((p, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input placeholder="Location" value={p.location} onChange={e => {
                                                    const newPoints = [...dropPoints]; newPoints[i].location = e.target.value; setDropPoints(newPoints);
                                                }} className="flex-grow p-2 text-sm bg-white border border-gray-200 rounded" />
                                                <input type="time" value={p.time} onChange={e => {
                                                    const newPoints = [...dropPoints]; newPoints[i].time = e.target.value; setDropPoints(newPoints);
                                                }} className="w-24 p-2 text-sm bg-white border border-gray-200 rounded" />
                                                <button type="button" onClick={() => setDropPoints(dropPoints.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STOPS (Modern List) */}
                        {type !== 'air' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Intermediate Stops</label>
                                    <button type="button" onClick={() => setStops([...stops, { stopName: '', priceFromStart: 0, estimatedTimeAtStop: '' }])} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">+ Add Stop</button>
                                </div>
                                <div className="space-y-2">
                                    {stops.map((stop, i) => (
                                        <div key={i} className="relative flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <span className="text-xs font-bold text-gray-400 w-6">{i + 1}.</span>

                                            <div className="flex-grow relative">
                                                <input
                                                    placeholder="Stop Name"
                                                    value={stop.stopName}
                                                    onChange={e => {
                                                        const newStops = [...stops]; newStops[i].stopName = e.target.value; setStops(newStops);
                                                        setLoadingSuggestions(true);
                                                        debouncedSearch(e.target.value, (sugs) => setStopSuggestions(prev => ({ ...prev, [i]: sugs })), setLoadingSuggestions);
                                                    }}
                                                    className="w-full p-2 text-sm bg-white border border-gray-200 rounded"
                                                />
                                                {/* Stop Suggestions Dropdown */}
                                                {stopSuggestions[i]?.length > 0 && (
                                                    <ul className="absolute z-50 w-full bg-white shadow-xl rounded-lg mt-1 max-h-40 overflow-y-auto border border-gray-100 top-full left-0">
                                                        {stopSuggestions[i].map(s => (
                                                            <li key={s.name} onClick={() => {
                                                                const newStops = [...stops];
                                                                newStops[i].stopName = s.name;
                                                                setStops(newStops);
                                                                setStopSuggestions(prev => ({ ...prev, [i]: [] }));
                                                            }} className="p-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700">
                                                                {s.name} <span className="text-xs text-gray-400 ml-1">({s.state})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            <input placeholder="Price" type="number" value={stop.priceFromStart} onChange={e => {
                                                const newStops = [...stops]; newStops[i].priceFromStart = e.target.value; setStops(newStops);
                                            }} className="w-20 p-2 text-sm bg-white border border-gray-200 rounded" />
                                            <input placeholder="Time" type="time" value={stop.estimatedTimeAtStop} onChange={e => {
                                                const newStops = [...stops]; newStops[i].estimatedTimeAtStop = e.target.value; setStops(newStops);
                                            }} className="w-24 p-2 text-sm bg-white border border-gray-200 rounded" />
                                            <button type="button" onClick={() => setStops(stops.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onCancel} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transform active:scale-95 transition-all">
                        {isSubmitting ? <span className="flex items-center gap-2">Saving...</span> : <span className="flex items-center gap-2"><Save size={18} /> Save Route</span>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PartnerRouteForm;
