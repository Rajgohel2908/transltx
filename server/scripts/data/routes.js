// server/scripts/data/routes.js

export const routesData = [
  // ================= BUS ROUTES (20 Routes) =================
  {
    id: "BUS-GJ-101",
    name: "GSRTC Gurjarnagri Express",
    type: "bus",
    operator: "GSRTC",
    amenities: ["Recliner Seats", "Charging Point", "Reading Light"],
    startPoint: "Ahmedabad",
    endPoint: "Surat",
    startTime: "06:00 AM",
    estimatedArrivalTime: "10:30 AM",
    scheduleType: "daily",
    totalSeats: { default: 50 },
    price: { default: 280 },
    stops: [
      { stopName: "Nadiad", priceFromStart: 50, estimatedTimeAtStop: "07:00 AM" },
      { stopName: "Vadodara", priceFromStart: 120, estimatedTimeAtStop: "08:15 AM" },
      { stopName: "Bharuch", priceFromStart: 190, estimatedTimeAtStop: "09:30 AM" }
    ]
  },
  {
    id: "BUS-WK-201", name: "VRL Weekend Sleeper", type: "bus", operator: "VRL Logistics",
    amenities: ["AC", "Blanket", "Reading Light"],
    startPoint: "Mumbai", endPoint: "Bengaluru",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday", "Sunday"],
    startTime: "06:00 PM", estimatedArrivalTime: "10:00 AM", // Next day
    totalSeats: { default: 30 }, price: { default: 1600 }, stops: []
  },
  {
    id: "BUS-WK-202", name: "Neeta Mahabaleshwar Special", type: "bus", operator: "Neeta Travels",
    amenities: ["AC", "Water Bottle"],
    startPoint: "Pune", endPoint: "Mahabaleshwar",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "06:00 AM", estimatedArrivalTime: "09:30 AM",
    totalSeats: { default: 45 }, price: { default: 450 }, stops: []
  },
  {
    id: "BUS-WK-203", name: "Purple Goa Express", type: "bus", operator: "Purple Travels",
    amenities: ["AC", "Charging Point", "WiFi"],
    startPoint: "Mumbai", endPoint: "Goa",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday"],
    startTime: "08:00 PM", estimatedArrivalTime: "07:00 AM",
    totalSeats: { default: 36 }, price: { default: 1200 }, stops: []
  },
  {
    id: "BUS-WK-204", name: "MSRTC Shirdi Pilgrim", type: "bus", operator: "MSRTC",
    amenities: ["Pushback Seats"],
    startPoint: "Nasik", endPoint: "Shirdi",
    scheduleType: "weekly", daysOfWeek: ["Thursday", "Saturday", "Sunday"],
    startTime: "08:00 AM", estimatedArrivalTime: "10:00 AM",
    totalSeats: { default: 50 }, price: { default: 150 }, stops: []
  },
  {
    id: "BUS-WK-205", name: "Hans Ind-Pune Intercity", type: "bus", operator: "Hans Travels",
    amenities: ["AC Sleeper", "TV"],
    startPoint: "Pune", endPoint: "Indore",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"],
    startTime: "07:30 PM", estimatedArrivalTime: "08:00 AM",
    totalSeats: { default: 30 }, price: { default: 1100 }, stops: []
  },
  {
    id: "BUS-WK-206", name: "Vidarbha Queen", type: "bus", operator: "Purple Travels",
    amenities: ["AC", "Snacks"],
    startPoint: "Pune", endPoint: "Nagpur",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "06:00 PM", estimatedArrivalTime: "07:00 AM",
    totalSeats: { default: 32 }, price: { default: 1300 }, stops: []
  },
  
  // --- GUJARAT (Business & Religious) ---
  {
    id: "BUS-WK-207", name: "Shrinath Nathdwara Special", type: "bus", operator: "Shrinath",
    amenities: ["AC Sleeper", "Blanket"],
    startPoint: "Ahmedabad", endPoint: "Nathdwara",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "10:00 PM", estimatedArrivalTime: "04:00 AM",
    totalSeats: { default: 36 }, price: { default: 600 }, stops: []
  },
  {
    id: "BUS-WK-208", name: "GSRTC Somnath Darshan", type: "bus", operator: "GSRTC",
    amenities: ["Non-AC", "Express"],
    startPoint: "Rajkot", endPoint: "Somnath",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday", "Sunday"],
    startTime: "05:00 AM", estimatedArrivalTime: "09:00 AM",
    totalSeats: { default: 50 }, price: { default: 220 }, stops: []
  },
  {
    id: "BUS-WK-209", name: "Patel Diu Beach Express", type: "bus", operator: "Patel Travels",
    amenities: ["AC", "Charging Point"],
    startPoint: "Ahmedabad", endPoint: "Diu",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday"],
    startTime: "10:30 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 30 }, price: { default: 800 }, stops: []
  },
  {
    id: "BUS-WK-210", name: "Eagle Mumbai Flyer", type: "bus", operator: "Eagle",
    amenities: ["Volvo Multi-Axle", "WiFi"],
    startPoint: "Baroda", endPoint: "Mumbai",
    scheduleType: "weekly", daysOfWeek: ["Sunday", "Monday"],
    startTime: "11:00 PM", estimatedArrivalTime: "05:30 AM",
    totalSeats: { default: 40 }, price: { default: 950 }, stops: []
  },
  
  // --- NORTH INDIA (Hills & Long Routes) ---
  {
    id: "BUS-WK-211", name: "HRTC Himgaurav", type: "bus", operator: "HRTC",
    amenities: ["AC", "Heating"],
    startPoint: "New Delhi", endPoint: "Shimla",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday", "Sunday"],
    startTime: "09:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 40 }, price: { default: 800 }, stops: []
  },
  {
    id: "BUS-WK-212", name: "Zingbus Katra Pilgrimage", type: "bus", operator: "Zingbus",
    amenities: ["AC", "Leg Rest"],
    startPoint: "New Delhi", endPoint: "Katra",
    scheduleType: "weekly", daysOfWeek: ["Thursday", "Friday", "Saturday"],
    startTime: "06:00 PM", estimatedArrivalTime: "07:00 AM",
    totalSeats: { default: 45 }, price: { default: 1100 }, stops: []
  },
  {
    id: "BUS-WK-213", name: "UTC Nainital Weekend", type: "bus", operator: "UTC",
    amenities: ["AC", "Water"],
    startPoint: "New Delhi", endPoint: "Nainital",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday"],
    startTime: "10:00 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 40 }, price: { default: 750 }, stops: []
  },
  {
    id: "BUS-WK-214", name: "Indo Canadian Business", type: "bus", operator: "Indo Canadian",
    amenities: ["Luxury", "Meal", "Washroom"],
    startPoint: "New Delhi", endPoint: "Amritsar",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Friday"],
    startTime: "02:00 PM", estimatedArrivalTime: "09:00 PM",
    totalSeats: { default: 30 }, price: { default: 1500 }, stops: []
  },
  {
    id: "BUS-WK-215", name: "Punbus Chandigarh Express", type: "bus", operator: "Punbus",
    amenities: ["AC"],
    startPoint: "Amritsar", endPoint: "Chandigarh",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Saturday"],
    startTime: "06:00 AM", estimatedArrivalTime: "10:30 AM",
    totalSeats: { default: 45 }, price: { default: 400 }, stops: []
  },
  
  // --- RAJASTHAN (Forts & Desert) ---
  {
    id: "BUS-WK-216", name: "RSRTC Royal Rajasthan", type: "bus", operator: "RSRTC",
    amenities: ["AC", "Guide"],
    startPoint: "Jaipur", endPoint: "Udaipur",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "07:00 AM", estimatedArrivalTime: "02:00 PM",
    totalSeats: { default: 40 }, price: { default: 650 }, stops: []
  },
  {
    id: "BUS-WK-217", name: "Jakhar Jodhpur Sleeper", type: "bus", operator: "Jakhar Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Ahmedabad", endPoint: "Jodhpur",
    scheduleType: "weekly", daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "10:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 30 }, price: { default: 700 }, stops: []
  },
  {
    id: "BUS-WK-218", name: "Vardhman Kota Link", type: "bus", operator: "Vardhman",
    amenities: ["Non-AC Seater"],
    startPoint: "Jaipur", endPoint: "Kota",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"],
    startTime: "05:00 PM", estimatedArrivalTime: "09:30 PM",
    totalSeats: { default: 50 }, price: { default: 300 }, stops: []
  },
  {
    id: "BUS-WK-219", name: "RSRTC Jaisalmer Night", type: "bus", operator: "RSRTC",
    amenities: ["Non-AC Sleeper"],
    startPoint: "Jaipur", endPoint: "Jaisalmer",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "09:00 PM", estimatedArrivalTime: "07:00 AM",
    totalSeats: { default: 35 }, price: { default: 550 }, stops: []
  },
  {
    id: "BUS-WK-220", name: "Kalpana Mount Abu", type: "bus", operator: "Kalpana Travels",
    amenities: ["AC"],
    startPoint: "Udaipur", endPoint: "Mount Abu",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "08:00 AM", estimatedArrivalTime: "11:30 AM",
    totalSeats: { default: 40 }, price: { default: 400 }, stops: []
  },

  // --- SOUTH INDIA (Nature & Tech Cities) ---
  {
    id: "BUS-WK-221", name: "KSRTC Flybus", type: "bus", operator: "KSRTC",
    amenities: ["AC", "Pantry", "Toilet"],
    startPoint: "Bengaluru", endPoint: "Mysuru",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "08:00 AM", estimatedArrivalTime: "11:00 AM",
    totalSeats: { default: 40 }, price: { default: 500 }, stops: []
  },
  {
    id: "BUS-WK-222", name: "SRS Gokarna Beach", type: "bus", operator: "SRS Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Bengaluru", endPoint: "Gokarna",
    scheduleType: "weekly", daysOfWeek: ["Friday"],
    startTime: "09:00 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 30 }, price: { default: 1100 }, stops: []
  },
  {
    id: "BUS-WK-223", name: "Greenline Coorg", type: "bus", operator: "Greenline",
    amenities: ["AC", "Large Windows"],
    startPoint: "Bengaluru", endPoint: "Coorg",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday"],
    startTime: "10:30 PM", estimatedArrivalTime: "05:30 AM",
    totalSeats: { default: 36 }, price: { default: 800 }, stops: []
  },
  {
    id: "BUS-WK-224", name: "KPN Chennai Express", type: "bus", operator: "KPN",
    amenities: ["AC", "WiFi"],
    startPoint: "Bengaluru", endPoint: "Chennai",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Friday", "Sunday"],
    startTime: "11:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 40 }, price: { default: 700 }, stops: []
  },
  {
    id: "BUS-WK-225", name: "Orange Hyderabadi", type: "bus", operator: "Orange Travels",
    amenities: ["Mercedes Benz", "Water"],
    startPoint: "Mumbai", endPoint: "Hyderabad",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "04:00 PM", estimatedArrivalTime: "08:00 AM",
    totalSeats: { default: 30 }, price: { default: 1800 }, stops: []
  },
  {
    id: "BUS-WK-226", name: "KSRTC Ooty Vacation", type: "bus", operator: "KSRTC",
    amenities: ["AC", "Hill Expert Driver"],
    startPoint: "Mysuru", endPoint: "Ooty",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "07:00 AM", estimatedArrivalTime: "11:00 AM",
    totalSeats: { default: 40 }, price: { default: 350 }, stops: []
  },
  {
    id: "BUS-WK-227", name: "Sugama Mangalore", type: "bus", operator: "Sugama",
    amenities: ["Non-AC Sleeper"],
    startPoint: "Bengaluru", endPoint: "Mangaluru",
    scheduleType: "weekly", daysOfWeek: ["Thursday", "Friday", "Sunday"],
    startTime: "09:30 PM", estimatedArrivalTime: "05:30 AM",
    totalSeats: { default: 32 }, price: { default: 650 }, stops: []
  },
  {
    id: "BUS-WK-228", name: "VRL Hubli Connect", type: "bus", operator: "VRL",
    amenities: ["AC Seater"],
    startPoint: "Pune", endPoint: "Hubballi",
    scheduleType: "weekly", daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "10:00 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 40 }, price: { default: 800 }, stops: []
  },
  {
    id: "BUS-WK-229", name: "Parveen Pondy Special", type: "bus", operator: "Parveen Travels",
    amenities: ["AC", "Snacks"],
    startPoint: "Chennai", endPoint: "Pondicherry",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "08:00 AM", estimatedArrivalTime: "11:30 AM",
    totalSeats: { default: 45 }, price: { default: 400 }, stops: []
  },
  {
    id: "BUS-WK-230", name: "KSRTC Tirupati Darshan", type: "bus", operator: "KSRTC",
    amenities: ["AC"],
    startPoint: "Bengaluru", endPoint: "Tirupati",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday"],
    startTime: "10:00 PM", estimatedArrivalTime: "04:00 AM",
    totalSeats: { default: 45 }, price: { default: 550 }, stops: []
  },

  // --- MADHYA PRADESH (Heart of India) ---
  {
    id: "BUS-WK-231", name: "Charted Bhopal Express", type: "bus", operator: "Charted Bus",
    amenities: ["AC", "WiFi", "Tracking"],
    startPoint: "Indore", endPoint: "Bhopal",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "06:00 PM", estimatedArrivalTime: "09:30 PM",
    totalSeats: { default: 45 }, price: { default: 350 }, stops: []
  },
  {
    id: "BUS-WK-232", name: "Verma Jabalpur Link", type: "bus", operator: "Verma Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Bhopal", endPoint: "Jabalpur",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "10:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 30 }, price: { default: 600 }, stops: []
  },
  {
    id: "BUS-WK-233", name: "Intercity Gwalior", type: "bus", operator: "Hans Travels",
    amenities: ["AC Seater"],
    startPoint: "Indore", endPoint: "Gwalior",
    scheduleType: "weekly", daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "08:00 PM", estimatedArrivalTime: "04:00 AM",
    totalSeats: { default: 40 }, price: { default: 700 }, stops: []
  },
  {
    id: "BUS-WK-234", name: "Omkareshwar Pilgrim", type: "bus", operator: "Charted Bus",
    amenities: ["AC"],
    startPoint: "Ujjain", endPoint: "Omkareshwar",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "07:00 AM", estimatedArrivalTime: "10:00 AM",
    totalSeats: { default: 40 }, price: { default: 250 }, stops: []
  },
  {
    id: "BUS-WK-235", name: "Nandan Nagpur Rider", type: "bus", operator: "Nandan Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Jabalpur", endPoint: "Nagpur",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Thursday"],
    startTime: "09:00 PM", estimatedArrivalTime: "04:00 AM",
    totalSeats: { default: 32 }, price: { default: 550 }, stops: []
  },

  // --- EXTRA MIX (Inter-State Long Haul) ---
  {
    id: "BUS-WK-236", name: "IntrCity Lucknow Smart", type: "bus", operator: "IntrCity",
    amenities: ["Washroom", "Lounge Access"],
    startPoint: "New Delhi", endPoint: "Lucknow",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "10:00 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 36 }, price: { default: 900 }, stops: []
  },
  {
    id: "BUS-WK-237", name: "Shatabdi Bus Kanpur", type: "bus", operator: "Shatabdi Travels",
    amenities: ["AC", "Charging"],
    startPoint: "New Delhi", endPoint: "Kanpur",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "07:00 AM", estimatedArrivalTime: "02:00 PM",
    totalSeats: { default: 45 }, price: { default: 600 }, stops: []
  },
  {
    id: "BUS-WK-238", name: "Paulo Vadodara-Pune", type: "bus", operator: "Paulo Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Vadodara", endPoint: "Pune",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "09:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 30 }, price: { default: 1000 }, stops: []
  },
  {
    id: "BUS-WK-239", name: "Mahendra Raipur Connect", type: "bus", operator: "Mahendra Travels",
    amenities: ["AC"],
    startPoint: "Nagpur", endPoint: "Raipur",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"],
    startTime: "08:00 AM", estimatedArrivalTime: "02:00 PM",
    totalSeats: { default: 40 }, price: { default: 500 }, stops: []
  },
  {
    id: "BUS-WK-240", name: "RSRTC Agra Tour", type: "bus", operator: "RSRTC",
    amenities: ["AC"],
    startPoint: "Jaipur", endPoint: "Agra",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "06:00 AM", estimatedArrivalTime: "10:30 AM",
    totalSeats: { default: 45 }, price: { default: 400 }, stops: []
  },
  {
    id: "BUS-WK-241", name: "Sahjanand Bhuj Express", type: "bus", operator: "Sahjanand",
    amenities: ["AC Sleeper", "TV"],
    startPoint: "Ahmedabad", endPoint: "Bhuj",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday", "Sunday"],
    startTime: "10:30 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 30 }, price: { default: 700 }, stops: []
  },
  {
    id: "BUS-WK-242", name: "GSRTC Saputara Hills", type: "bus", operator: "GSRTC",
    amenities: ["Non-AC"],
    startPoint: "Surat", endPoint: "Saputara",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "07:00 AM", estimatedArrivalTime: "10:30 AM",
    totalSeats: { default: 50 }, price: { default: 150 }, stops: []
  },
  {
    id: "BUS-WK-243", name: "Zingbus Dehradun", type: "bus", operator: "Zingbus",
    amenities: ["AC", "Leg Space"],
    startPoint: "New Delhi", endPoint: "Dehradun",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "11:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 40 }, price: { default: 650 }, stops: []
  },
  {
    id: "BUS-WK-244", name: "HRTC Dharamshala", type: "bus", operator: "HRTC",
    amenities: ["Volvo AC"],
    startPoint: "New Delhi", endPoint: "Dharamshala",
    scheduleType: "weekly", daysOfWeek: ["Friday"],
    startTime: "08:30 PM", estimatedArrivalTime: "06:30 AM",
    totalSeats: { default: 35 }, price: { default: 1100 }, stops: []
  },
  {
    id: "BUS-WK-245", name: "Neeta Kolhapur", type: "bus", operator: "Neeta Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Pune", endPoint: "Kolhapur",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday"],
    startTime: "10:00 PM", estimatedArrivalTime: "03:00 AM",
    totalSeats: { default: 30 }, price: { default: 600 }, stops: []
  },
  {
    id: "BUS-WK-246", name: "VRL Belagavi Night", type: "bus", operator: "VRL",
    amenities: ["Non-AC Sleeper"],
    startPoint: "Mumbai", endPoint: "Belagavi",
    scheduleType: "weekly", daysOfWeek: ["Saturday"],
    startTime: "07:00 PM", estimatedArrivalTime: "05:00 AM",
    totalSeats: { default: 30 }, price: { default: 900 }, stops: []
  },
  {
    id: "BUS-WK-247", name: "KSRTC Davangere", type: "bus", operator: "KSRTC",
    amenities: ["AC"],
    startPoint: "Bengaluru", endPoint: "Davanagere",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "10:00 PM", estimatedArrivalTime: "04:00 AM",
    totalSeats: { default: 45 }, price: { default: 500 }, stops: []
  },
  {
    id: "BUS-WK-248", name: "SRS Hubli Day", type: "bus", operator: "SRS",
    amenities: ["AC Seater"],
    startPoint: "Bengaluru", endPoint: "Hubballi",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"],
    startTime: "07:00 AM", estimatedArrivalTime: "02:00 PM",
    totalSeats: { default: 40 }, price: { default: 600 }, stops: []
  },
  {
    id: "BUS-WK-249", name: "Orange Vijayawada", type: "bus", operator: "Orange Travels",
    amenities: ["AC Sleeper"],
    startPoint: "Hyderabad", endPoint: "Vijayawada",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Sunday"],
    startTime: "10:00 PM", estimatedArrivalTime: "04:00 AM",
    totalSeats: { default: 30 }, price: { default: 800 }, stops: []
  },
  {
    id: "BUS-WK-250", name: "KPN Kerala Connection", type: "bus", operator: "KPN",
    amenities: ["AC"],
    startPoint: "Bengaluru", endPoint: "Kochi",
    scheduleType: "weekly", daysOfWeek: ["Friday"],
    startTime: "08:00 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { default: 36 }, price: { default: 1200 }, stops: []
  },

  // ================= EXISTING TRAIN ROUTES (Sample preserved) =================

  // ... (16 more train routes assumed here)

  // ================= EXISTING AIR ROUTES (Sample preserved) =================
  
  {
    id: "BUS-MH-102",
    name: "Shivneri Volvo AC",
    type: "bus",
    operator: "MSRTC",
    amenities: ["AC", "Water Bottle", "Blanket"],
    startPoint: "Mumbai",
    endPoint: "Pune",
    startTime: "07:00 AM",
    estimatedArrivalTime: "10:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 45 },
    price: { default: 850 },
    stops: [
      { stopName: "Vashi", priceFromStart: 150, estimatedTimeAtStop: "07:45 AM" },
      { stopName: "Lonavala", priceFromStart: 500, estimatedTimeAtStop: "09:00 AM" }
    ]
  },
  {
    id: "BUS-DL-103",
    name: "Zingbus Premium Sleeper",
    type: "bus",
    operator: "Zingbus",
    amenities: ["AC", "WiFi", "Live Tracking", "Washroom"],
    startPoint: "New Delhi",
    endPoint: "Manali",
    startTime: "08:00 PM",
    estimatedArrivalTime: "08:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 30 },
    price: { default: 1200 },
    stops: [
      { stopName: "Chandigarh", priceFromStart: 600, estimatedTimeAtStop: "01:00 AM" },
      { stopName: "Kullu", priceFromStart: 1000, estimatedTimeAtStop: "06:30 AM" }
    ]
  },
  {
    id: "BUS-RJ-104",
    name: "RSRTC Goldline",
    type: "bus",
    operator: "RSRTC",
    amenities: ["AC", "Leg Space"],
    startPoint: "Jaipur",
    endPoint: "New Delhi",
    startTime: "06:00 AM",
    estimatedArrivalTime: "11:30 AM",
    scheduleType: "daily",
    totalSeats: { default: 40 },
    price: { default: 600 },
    stops: [
      { stopName: "Behror", priceFromStart: 250, estimatedTimeAtStop: "08:30 AM" },
      { stopName: "Gurgaon", priceFromStart: 500, estimatedTimeAtStop: "10:45 AM" }
    ]
  },
  {
    id: "BUS-GJ-105",
    name: "Patel Travels Sleeper",
    type: "bus",
    operator: "Patel Travels",
    amenities: ["Charging Point", "Movie", "Pillow"],
    startPoint: "Ahmedabad",
    endPoint: "Rajkot",
    startTime: "11:00 PM",
    estimatedArrivalTime: "03:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 36 },
    price: { default: 500 },
    stops: [
      { stopName: "Limbdi", priceFromStart: 200, estimatedTimeAtStop: "01:00 AM" },
      { stopName: "Chotila", priceFromStart: 300, estimatedTimeAtStop: "01:45 AM" }
    ]
  },
  {
    id: "BUS-KA-106",
    name: "Airavat Club Class",
    type: "bus",
    operator: "KSRTC",
    amenities: ["AC", "WiFi", "Semi-Sleeper"],
    startPoint: "Bengaluru",
    endPoint: "Mysuru",
    startTime: "09:00 AM",
    estimatedArrivalTime: "12:00 PM",
    scheduleType: "daily",
    totalSeats: { default: 48 },
    price: { default: 450 },
    stops: [
      { stopName: "Kengeri", priceFromStart: 50, estimatedTimeAtStop: "09:45 AM" },
      { stopName: "Mandya", priceFromStart: 250, estimatedTimeAtStop: "11:00 AM" }
    ]
  },
  {
    id: "BUS-MP-107",
    name: "Charted Bus Intercity",
    type: "bus",
    operator: "Charted Bus",
    amenities: ["AC", "Tracking", "Water"],
    startPoint: "Indore",
    endPoint: "Bhopal",
    startTime: "07:00 AM",
    estimatedArrivalTime: "10:30 AM",
    scheduleType: "daily",
    totalSeats: { default: 45 },
    price: { default: 350 },
    stops: [
      { stopName: "Dewas", priceFromStart: 100, estimatedTimeAtStop: "08:00 AM" },
      { stopName: "Sehore", priceFromStart: 250, estimatedTimeAtStop: "09:30 AM" }
    ]
  },
  {
    id: "BUS-GJ-108",
    name: "Shrinath Travel Agency",
    type: "bus",
    operator: "Shrinath",
    amenities: ["AC", "Sleeper", "Charging"],
    startPoint: "Ahmedabad",
    endPoint: "Udaipur",
    startTime: "10:00 PM",
    estimatedArrivalTime: "03:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 30 },
    price: { default: 700 },
    stops: [
      { stopName: "Himmatnagar", priceFromStart: 200, estimatedTimeAtStop: "11:30 PM" },
      { stopName: "Shamlaji", priceFromStart: 350, estimatedTimeAtStop: "12:30 AM" }
    ]
  },
  {
    id: "BUS-MH-109",
    name: "Purple Travels",
    type: "bus",
    operator: "Purple",
    amenities: ["AC", "Blanket"],
    startPoint: "Pune",
    endPoint: "Aurangabad",
    startTime: "11:00 PM",
    estimatedArrivalTime: "04:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 40 },
    price: { default: 600 },
    stops: [
      { stopName: "Ahmednagar", priceFromStart: 300, estimatedTimeAtStop: "01:30 AM" }
    ]
  },
  {
    id: "BUS-PB-110",
    name: "Indo Canadian Transport",
    type: "bus",
    operator: "Indo Canadian",
    amenities: ["AC", "Luxury Seats", "WiFi"],
    startPoint: "New Delhi",
    endPoint: "Ludhiana",
    startTime: "03:00 PM",
    estimatedArrivalTime: "08:00 PM",
    scheduleType: "daily",
    totalSeats: { default: 40 },
    price: { default: 900 },
    stops: [
      { stopName: "Karnal", priceFromStart: 400, estimatedTimeAtStop: "05:30 PM" },
      { stopName: "Ambala", priceFromStart: 600, estimatedTimeAtStop: "06:45 PM" }
    ]
  },
  {
    id: "BUS-GJ-111",
    name: "GSRTC Express",
    type: "bus",
    operator: "GSRTC",
    amenities: ["Non-AC"],
    startPoint: "Surat",
    endPoint: "Nasik",
    startTime: "08:00 AM",
    estimatedArrivalTime: "01:00 PM",
    scheduleType: "daily",
    totalSeats: { default: 55 },
    price: { default: 180 },
    stops: [
      { stopName: "Saputara", priceFromStart: 120, estimatedTimeAtStop: "11:00 AM" }
    ]
  },
  {
    id: "BUS-MH-112",
    name: "VRL Logistics",
    type: "bus",
    operator: "VRL",
    amenities: ["AC", "Sleeper"],
    startPoint: "Mumbai",
    endPoint: "Goa",
    startTime: "07:00 PM",
    estimatedArrivalTime: "08:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 30 },
    price: { default: 1500 },
    stops: [
      { stopName: "Pune", priceFromStart: 400, estimatedTimeAtStop: "10:00 PM" },
      { stopName: "Kolhapur", priceFromStart: 900, estimatedTimeAtStop: "03:00 AM" }
    ]
  },
  {
    id: "BUS-KA-113",
    name: "SRS Travels",
    type: "bus",
    operator: "SRS",
    amenities: ["AC", "Charging"],
    startPoint: "Bengaluru",
    endPoint: "Mangaluru",
    startTime: "09:30 PM",
    estimatedArrivalTime: "05:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 36 },
    price: { default: 800 },
    stops: [
      { stopName: "Hassan", priceFromStart: 350, estimatedTimeAtStop: "12:30 AM" }
    ]
  },
  {
    id: "BUS-RJ-114",
    name: "Jakhar Travels",
    type: "bus",
    operator: "Jakhar",
    amenities: ["AC", "Sleeper"],
    startPoint: "Jodhpur",
    endPoint: "Jaipur",
    startTime: "10:00 PM",
    estimatedArrivalTime: "04:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 30 },
    price: { default: 550 },
    stops: [
      { stopName: "Ajmer", priceFromStart: 300, estimatedTimeAtStop: "01:30 AM" }
    ]
  },
  {
    id: "BUS-MP-115",
    name: "Verma Travels",
    type: "bus",
    operator: "Verma",
    amenities: ["AC Seater"],
    startPoint: "Bhopal",
    endPoint: "Jabalpur",
    startTime: "06:00 AM",
    estimatedArrivalTime: "12:00 PM",
    scheduleType: "daily",
    totalSeats: { default: 45 },
    price: { default: 450 },
    stops: [
      { stopName: "Vidisha", priceFromStart: 100, estimatedTimeAtStop: "07:30 AM" },
      { stopName: "Sagar", priceFromStart: 250, estimatedTimeAtStop: "09:30 AM" }
    ]
  },
  {
    id: "BUS-DL-116",
    name: "IntrCity SmartBus",
    type: "bus",
    operator: "IntrCity",
    amenities: ["Washroom", "Lounge"],
    startPoint: "New Delhi",
    endPoint: "Lucknow",
    startTime: "10:30 PM",
    estimatedArrivalTime: "06:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 36 },
    price: { default: 999 },
    stops: [
      { stopName: "Agra", priceFromStart: 400, estimatedTimeAtStop: "01:30 AM" }
    ]
  },
  {
    id: "BUS-GJ-117",
    name: "Eagle Travels",
    type: "bus",
    operator: "Eagle",
    amenities: ["AC", "WiFi"],
    startPoint: "Rajkot",
    endPoint: "Mumbai",
    startTime: "08:00 PM",
    estimatedArrivalTime: "08:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 30 },
    price: { default: 1200 },
    stops: [
      { stopName: "Ahmedabad", priceFromStart: 300, estimatedTimeAtStop: "11:00 PM" },
      { stopName: "Baroda", priceFromStart: 500, estimatedTimeAtStop: "01:00 AM" }
    ]
  },
  {
    id: "BUS-MH-118",
    name: "MSRTC Shivshahi",
    type: "bus",
    operator: "MSRTC",
    amenities: ["AC"],
    startPoint: "Nashik",
    endPoint: "Pune",
    startTime: "07:30 AM",
    estimatedArrivalTime: "01:30 PM",
    scheduleType: "daily",
    totalSeats: { default: 45 },
    price: { default: 420 },
    stops: [
      { stopName: "Sangamner", priceFromStart: 150, estimatedTimeAtStop: "09:30 AM" }
    ]
  },
  {
    id: "BUS-KA-119",
    name: "KSRTC Ambaari Dream Class",
    type: "bus",
    operator: "KSRTC",
    amenities: ["AC Sleeper", "Luxury"],
    startPoint: "Bengaluru",
    endPoint: "Hubballi",
    startTime: "10:00 PM",
    estimatedArrivalTime: "05:30 AM",
    scheduleType: "daily",
    totalSeats: { default: 32 },
    price: { default: 950 },
    stops: [
      { stopName: "Davangere", priceFromStart: 500, estimatedTimeAtStop: "02:30 AM" }
    ]
  },
  {
    id: "BUS-GJ-120",
    name: "GSRTC Electric",
    type: "bus",
    operator: "GSRTC",
    amenities: ["AC", "Silent"],
    startPoint: "Gandhinagar",
    endPoint: "Ahmedabad",
    startTime: "08:00 AM",
    estimatedArrivalTime: "09:00 AM",
    scheduleType: "daily",
    totalSeats: { default: 40 },
    price: { default: 40 },
    stops: []
  },

  // ================= TRAIN ROUTES (18 Routes) =================
  {
    id: "TRN-WK-301", name: "Mumbai-Goa Tejas Express", type: "train", operator: "Indian Railways",
    amenities: ["Food", "AC", "WiFi", "Infotainment"],
    startPoint: "Mumbai CSMT", endPoint: "Madgaon (Goa)",
    scheduleType: "weekly", daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "05:50 AM", estimatedArrivalTime: "02:40 PM",
    totalSeats: { "AC Chair car": 500, "Executive Chair Car": 50 },
    price: { "AC Chair car": 1500, "Executive Chair Car": 3000 }, stops: []
  },
  {
    id: "TRN-WK-302", name: "Konkan Kanya Express", type: "train", operator: "Indian Railways",
    amenities: ["Sleeper", "Pantry"],
    startPoint: "Mumbai CSMT", endPoint: "Madgaon (Goa)",
    scheduleType: "daily",
    startTime: "11:05 PM", estimatedArrivalTime: "10:45 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 150, "AC 2 Tier": 50 },
    price: { "Sleeper": 550, "AC 3 Tier": 1450, "AC 2 Tier": 2100 }, stops: []
  },
  {
    id: "TRN-WK-303", name: "Udyan Express", type: "train", operator: "Indian Railways",
    amenities: ["Pantry", "Bedding"],
    startPoint: "Mumbai CSMT", endPoint: "Bengaluru",
    scheduleType: "daily",
    startTime: "08:15 AM", estimatedArrivalTime: "09:00 AM", // +1 day
    totalSeats: { "Sleeper": 450, "AC 3 Tier": 200 },
    price: { "Sleeper": 650, "AC 3 Tier": 1700 }, stops: []
  },
  {
    id: "TRN-WK-304", name: "Deccan Queen", type: "train", operator: "Indian Railways",
    amenities: ["Dining Car", "Pass Holder Allowed"],
    startPoint: "Pune", endPoint: "Mumbai CSMT",
    scheduleType: "daily",
    startTime: "07:15 AM", estimatedArrivalTime: "10:25 AM",
    totalSeats: { "AC Chair car": 300, "Second Seating": 600 },
    price: { "AC Chair car": 400, "Second Seating": 110 }, stops: []
  },
  {
    id: "TRN-WK-305", name: "Humsafar Express (Pune-Nagpur)", type: "train", operator: "Indian Railways",
    amenities: ["AC", "Charging Points", "Bio Toilets"],
    startPoint: "Pune", endPoint: "Nagpur",
    scheduleType: "weekly", daysOfWeek: ["Thursday"],
    startTime: "05:40 PM", estimatedArrivalTime: "09:15 AM",
    totalSeats: { "AC 3 Tier": 800 },
    price: { "AC 3 Tier": 1300 }, stops: []
  },

  // --- NORTH & EAST INDIA ---
  {
    id: "TRN-WK-306", name: "Poorva Express", type: "train", operator: "Indian Railways",
    amenities: ["Pantry", "AC"],
    startPoint: "New Delhi", endPoint: "Howrah (Kolkata)",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Tuesday", "Friday"],
    startTime: "05:40 PM", estimatedArrivalTime: "05:00 PM", // +1 day
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 250, "AC 2 Tier": 100 },
    price: { "Sleeper": 750, "AC 3 Tier": 1950, "AC 2 Tier": 2800 }, stops: []
  },
  {
    id: "TRN-WK-307", name: "Sampark Kranti Express", type: "train", operator: "Indian Railways",
    amenities: ["Sleeper", "AC"],
    startPoint: "New Delhi", endPoint: "Ahmedabad",
    scheduleType: "weekly", daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "01:25 PM", estimatedArrivalTime: "05:45 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 200 },
    price: { "Sleeper": 500, "AC 3 Tier": 1350 }, stops: []
  },
  {
    id: "TRN-WK-308", name: "Kalka Shatabdi", type: "train", operator: "Indian Railways",
    amenities: ["Meals", "AC"],
    startPoint: "New Delhi", endPoint: "Kalka",
    scheduleType: "daily",
    startTime: "07:40 AM", estimatedArrivalTime: "11:45 AM",
    totalSeats: { "AC Chair car": 600, "Executive Chair Car": 50 },
    price: { "AC Chair car": 900, "Executive Chair Car": 1500 }, stops: []
  },
  {
    id: "TRN-WK-309", name: "Uttar Sampark Kranti", type: "train", operator: "Indian Railways",
    amenities: ["AC", "Pantry"],
    startPoint: "New Delhi", endPoint: "Katra (Vaishno Devi)",
    scheduleType: "daily",
    startTime: "08:50 PM", estimatedArrivalTime: "08:00 AM",
    totalSeats: { "Sleeper": 450, "AC 3 Tier": 200 },
    price: { "Sleeper": 450, "AC 3 Tier": 1200 }, stops: []
  },
  {
    id: "TRN-WK-310", name: "Lucknow Mail", type: "train", operator: "Indian Railways",
    amenities: ["Clean Bedding", "AC"],
    startPoint: "New Delhi", endPoint: "Lucknow",
    scheduleType: "daily",
    startTime: "10:00 PM", estimatedArrivalTime: "06:55 AM",
    totalSeats: { "Sleeper": 500, "AC 3 Tier": 250, "AC 1st Class": 24 },
    price: { "Sleeper": 380, "AC 3 Tier": 1050, "AC 1st Class": 2400 }, stops: []
  },

  // --- GUJARAT & RAJASTHAN ---
  {
    id: "TRN-WK-311", name: "Gujarat Mail", type: "train", operator: "Indian Railways",
    amenities: ["Pantry", "AC"],
    startPoint: "Mumbai Central", endPoint: "Ahmedabad",
    scheduleType: "daily",
    startTime: "10:00 PM", estimatedArrivalTime: "06:30 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 200, "AC 1st Class": 20 },
    price: { "Sleeper": 350, "AC 3 Tier": 950, "AC 1st Class": 2100 }, stops: []
  },
  {
    id: "TRN-WK-312", name: "Suryanagari Express", type: "train", operator: "Indian Railways",
    amenities: ["Sleeper", "AC"],
    startPoint: "Mumbai Bandra", endPoint: "Jodhpur",
    scheduleType: "daily",
    startTime: "01:30 PM", estimatedArrivalTime: "06:30 AM",
    totalSeats: { "Sleeper": 450, "AC 3 Tier": 200 },
    price: { "Sleeper": 580, "AC 3 Tier": 1550 }, stops: []
  },
  {
    id: "TRN-WK-313", name: "Chehak Express", type: "train", operator: "Indian Railways",
    amenities: ["Sleeper", "AC"],
    startPoint: "Udaipur", endPoint: "Delhi Sarai Rohilla",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Saturday"],
    startTime: "06:00 PM", estimatedArrivalTime: "06:30 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 150 },
    price: { "Sleeper": 450, "AC 3 Tier": 1200 }, stops: []
  },
  {
    id: "TRN-WK-314", name: "Ashram Express", type: "train", operator: "Indian Railways",
    amenities: ["Pantry", "AC"],
    startPoint: "Ahmedabad", endPoint: "New Delhi",
    scheduleType: "daily",
    startTime: "06:30 PM", estimatedArrivalTime: "10:10 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 200, "AC 1st Class": 24 },
    price: { "Sleeper": 550, "AC 3 Tier": 1450, "AC 1st Class": 3500 }, stops: []
  },
  {
    id: "TRN-WK-315", name: "Somnath Express", type: "train", operator: "Indian Railways",
    amenities: ["Sleeper"],
    startPoint: "Ahmedabad", endPoint: "Veraval (Somnath)",
    scheduleType: "daily",
    startTime: "10:25 PM", estimatedArrivalTime: "06:00 AM",
    totalSeats: { "Sleeper": 500, "AC 3 Tier": 150 },
    price: { "Sleeper": 300, "AC 3 Tier": 800 }, stops: []
  },

  // --- SOUTH & CENTRAL ---
  {
    id: "TRN-WK-316", name: "Lalbagh Express", type: "train", operator: "Indian Railways",
    amenities: ["Seating", "Pantry"],
    startPoint: "Chennai", endPoint: "Bengaluru",
    scheduleType: "daily",
    startTime: "03:30 PM", estimatedArrivalTime: "09:35 PM",
    totalSeats: { "AC Chair car": 300, "Second Seating": 600 },
    price: { "AC Chair car": 550, "Second Seating": 180 }, stops: []
  },
  {
    id: "TRN-WK-317", name: "Grand Trunk Express", type: "train", operator: "Indian Railways",
    amenities: ["Pantry", "AC", "Long Haul"],
    startPoint: "Chennai", endPoint: "New Delhi",
    scheduleType: "daily",
    startTime: "07:15 PM", estimatedArrivalTime: "06:35 AM", // +2 days
    totalSeats: { "Sleeper": 450, "AC 3 Tier": 250 },
    price: { "Sleeper": 900, "AC 3 Tier": 2400 }, stops: []
  },
  {
    id: "TRN-WK-318", name: "Shatabdi Express (Mysuru)", type: "train", operator: "Indian Railways",
    amenities: ["Meals", "AC"],
    startPoint: "Bengaluru", endPoint: "Mysuru",
    scheduleType: "daily",
    startTime: "10:50 AM", estimatedArrivalTime: "01:00 PM",
    totalSeats: { "AC Chair car": 400, "Executive Chair Car": 40 },
    price: { "AC Chair car": 450, "Executive Chair Car": 900 }, stops: []
  },
  {
    id: "TRN-WK-319", name: "Avantika Express", type: "train", operator: "Indian Railways",
    amenities: ["AC", "Cleanliness"],
    startPoint: "Mumbai Central", endPoint: "Indore",
    scheduleType: "daily",
    startTime: "08:55 PM", estimatedArrivalTime: "09:15 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 200, "AC 2 Tier": 100 },
    price: { "Sleeper": 480, "AC 3 Tier": 1250, "AC 2 Tier": 1800 }, stops: []
  },
  {
    id: "TRN-WK-320", name: "Narmada Express", type: "train", operator: "Indian Railways",
    amenities: ["Sleeper", "Local Vibe"],
    startPoint: "Indore", endPoint: "Bilaspur",
    scheduleType: "daily",
    startTime: "04:00 PM", estimatedArrivalTime: "02:00 PM", // +1 day
    totalSeats: { "Sleeper": 450, "AC 3 Tier": 100 },
    price: { "Sleeper": 500, "AC 3 Tier": 1300 }, stops: []
  },
  {
    id: "TRN-20901",
    name: "Vande Bharat Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Food", "AC", "WiFi"],
    startPoint: "Mumbai Central",
    endPoint: "Gandhinagar Capital",
    scheduleType: "weekly",
    daysOfWeek: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday", "Sunday"],
    startTime: "06:10 AM",
    estimatedArrivalTime: "12:25 PM",
    totalSeats: { "AC Chair car": 800, "Executive Chair Car": 50 },
    price: { "AC Chair car": 1400, "Executive Chair Car": 2500 },
    stops: [
      { stopName: "Surat", priceFromStart: 600, estimatedTimeAtStop: "08:40 AM" },
      { stopName: "Vadodara", priceFromStart: 900, estimatedTimeAtStop: "10:10 AM" },
      { stopName: "Ahmedabad", priceFromStart: 1200, estimatedTimeAtStop: "11:20 AM" }
    ]
  },
  {
    id: "TRN-12951",
    name: "Mumbai Rajdhani",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Food", "AC", "Bedding"],
    startPoint: "Mumbai Central",
    endPoint: "New Delhi",
    scheduleType: "daily",
    startTime: "05:00 PM",
    estimatedArrivalTime: "08:30 AM",
    totalSeats: { "AC 3 Tier": 300, "AC 2 Tier": 150, "First Class": 50 },
    price: { "AC 3 Tier": 2200, "AC 2 Tier": 3100, "First Class": 5200 },
    stops: [
      { stopName: "Surat", priceFromStart: 800, estimatedTimeAtStop: "08:00 PM" },
      { stopName: "Vadodara", priceFromStart: 1200, estimatedTimeAtStop: "09:40 PM" },
      { stopName: "Kota", priceFromStart: 1800, estimatedTimeAtStop: "03:00 AM" }
    ]
  },
  {
    id: "TRN-12009",
    name: "Shatabdi Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Meals", "AC"],
    startPoint: "Mumbai Central",
    endPoint: "Ahmedabad",
    scheduleType: "weekly",
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    startTime: "06:20 AM",
    estimatedArrivalTime: "12:45 PM",
    totalSeats: { "AC Chair car": 600, "Executive Chair Car": 50 },
    price: { "AC Chair car": 1100, "Executive Chair Car": 2100 },
    stops: [
      { stopName: "Vapi", priceFromStart: 400, estimatedTimeAtStop: "08:30 AM" },
      { stopName: "Surat", priceFromStart: 600, estimatedTimeAtStop: "09:40 AM" },
      { stopName: "Vadodara", priceFromStart: 850, estimatedTimeAtStop: "11:15 AM" }
    ]
  },
  {
    id: "TRN-12909",
    name: "Garib Rath Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["AC"],
    startPoint: "Mumbai Bandra",
    endPoint: "New Delhi",
    scheduleType: "weekly",
    daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "05:30 PM",
    estimatedArrivalTime: "10:15 AM",
    totalSeats: { "AC 3 Tier": 900 },
    price: { "AC 3 Tier": 1100 },
    stops: [
      { stopName: "Surat", priceFromStart: 400, estimatedTimeAtStop: "08:50 PM" },
      { stopName: "Kota", priceFromStart: 800, estimatedTimeAtStop: "04:20 AM" }
    ]
  },
  {
    id: "TRN-12002",
    name: "Bhopal Shatabdi",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Meals", "AC"],
    startPoint: "New Delhi",
    endPoint: "Bhopal",
    scheduleType: "daily",
    startTime: "06:00 AM",
    estimatedArrivalTime: "02:30 PM",
    totalSeats: { "AC Chair car": 700 },
    price: { "AC Chair car": 1300 },
    stops: [
      { stopName: "Agra Cantt", priceFromStart: 500, estimatedTimeAtStop: "08:00 AM" },
      { stopName: "Gwalior", priceFromStart: 800, estimatedTimeAtStop: "09:45 AM" },
      { stopName: "Jhansi", priceFromStart: 1000, estimatedTimeAtStop: "11:15 AM" }
    ]
  },
  {
    id: "TRN-12215",
    name: "Garib Rath Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["AC"],
    startPoint: "Delhi Sarai Rohilla",
    endPoint: "Mumbai Bandra",
    scheduleType: "weekly",
    daysOfWeek: ["Monday", "Tuesday", "Thursday", "Saturday"],
    startTime: "08:55 AM",
    estimatedArrivalTime: "07:35 AM",
    totalSeats: { "AC 3 Tier": 800 },
    price: { "AC 3 Tier": 1150 },
    stops: [
      { stopName: "Jaipur", priceFromStart: 400, estimatedTimeAtStop: "02:00 PM" },
      { stopName: "Ahmedabad", priceFromStart: 850, estimatedTimeAtStop: "12:30 AM" }
    ]
  },
  {
    id: "TRN-12461",
    name: "Mandore Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Sleeper", "AC"],
    startPoint: "Old Delhi",
    endPoint: "Jodhpur",
    scheduleType: "daily",
    startTime: "09:20 PM",
    estimatedArrivalTime: "07:50 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 200, "AC 2 Tier": 50 },
    price: { "Sleeper": 400, "AC 3 Tier": 1100, "AC 2 Tier": 1600 },
    stops: [
      { stopName: "Jaipur", priceFromStart: 300, estimatedTimeAtStop: "02:30 AM" }
    ]
  },
  {
    id: "TRN-22691",
    name: "Rajdhani Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Meals", "AC"],
    startPoint: "Bengaluru",
    endPoint: "New Delhi",
    scheduleType: "daily",
    startTime: "08:00 PM",
    estimatedArrivalTime: "05:30 AM", // +2 days
    totalSeats: { "AC 3 Tier": 250, "AC 2 Tier": 100, "First Class": 24 },
    price: { "AC 3 Tier": 2800, "AC 2 Tier": 4000, "First Class": 6800 },
    stops: [
      { stopName: "Secunderabad", priceFromStart: 1000, estimatedTimeAtStop: "07:00 AM" },
      { stopName: "Nagpur", priceFromStart: 1800, estimatedTimeAtStop: "04:00 PM" },
      { stopName: "Bhopal", priceFromStart: 2200, estimatedTimeAtStop: "10:00 PM" }
    ]
  },
  {
    id: "TRN-12051",
    name: "Jan Shatabdi",
    type: "train",
    operator: "Indian Railways",
    amenities: ["AC Chair"],
    startPoint: "Mumbai Dadar",
    endPoint: "Madgaon (Goa)",
    scheduleType: "daily",
    startTime: "05:25 AM",
    estimatedArrivalTime: "02:10 PM",
    totalSeats: { "AC Chair car": 400, "Second Seating": 400 },
    price: { "AC Chair car": 950, "Second Seating": 280 },
    stops: [
      { stopName: "Thane", priceFromStart: 50, estimatedTimeAtStop: "05:50 AM" },
      { stopName: "Ratnagiri", priceFromStart: 400, estimatedTimeAtStop: "10:30 AM" }
    ]
  },
  {
    id: "TRN-11007",
    name: "Deccan Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Seating"],
    startPoint: "Mumbai CSMT",
    endPoint: "Pune",
    scheduleType: "daily",
    startTime: "07:00 AM",
    estimatedArrivalTime: "11:05 AM",
    totalSeats: { "AC Chair car": 200, "Second Seating": 600 },
    price: { "AC Chair car": 450, "Second Seating": 120 },
    stops: [
      { stopName: "Lonavala", priceFromStart: 100, estimatedTimeAtStop: "09:30 AM" }
    ]
  },
  {
    id: "TRN-19037",
    name: "Avadh Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Sleeper"],
    startPoint: "Mumbai Bandra",
    endPoint: "Gorakhpur",
    scheduleType: "daily",
    startTime: "10:40 PM",
    estimatedArrivalTime: "01:30 PM", // +2 days
    totalSeats: { "Sleeper": 500, "AC 3 Tier": 100 },
    price: { "Sleeper": 700, "AC 3 Tier": 1900 },
    stops: [
      { stopName: "Surat", priceFromStart: 200, estimatedTimeAtStop: "03:00 AM" },
      { stopName: "Kota", priceFromStart: 600, estimatedTimeAtStop: "01:00 PM" },
      { stopName: "Kanpur", priceFromStart: 1000, estimatedTimeAtStop: "11:00 PM" }
    ]
  },
  {
    id: "TRN-12933",
    name: "Karnavati Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Pantry"],
    startPoint: "Mumbai Central",
    endPoint: "Ahmedabad",
    scheduleType: "daily",
    startTime: "01:40 PM",
    estimatedArrivalTime: "09:05 PM",
    totalSeats: { "AC Chair car": 500, "Second Seating": 500 },
    price: { "AC Chair car": 800, "Second Seating": 210 },
    stops: [
      { stopName: "Surat", priceFromStart: 400, estimatedTimeAtStop: "05:00 PM" },
      { stopName: "Vadodara", priceFromStart: 600, estimatedTimeAtStop: "07:00 PM" }
    ]
  },
  {
    id: "TRN-20903",
    name: "Mahamana Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Bio Toilets"],
    startPoint: "Varanasi",
    endPoint: "New Delhi",
    scheduleType: "weekly",
    daysOfWeek: ["Tuesday", "Thursday", "Saturday"],
    startTime: "06:30 PM",
    estimatedArrivalTime: "08:30 AM",
    totalSeats: { "Sleeper": 400, "AC 2 Tier": 100 },
    price: { "Sleeper": 500, "AC 2 Tier": 1800 },
    stops: [
      { stopName: "Lucknow", priceFromStart: 200, estimatedTimeAtStop: "11:00 PM" },
      { stopName: "Moradabad", priceFromStart: 400, estimatedTimeAtStop: "04:30 AM" }
    ]
  },
  {
    id: "TRN-12627",
    name: "Karnataka Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Pantry"],
    startPoint: "Bengaluru",
    endPoint: "New Delhi",
    scheduleType: "daily",
    startTime: "07:20 PM",
    estimatedArrivalTime: "09:00 AM", // +2 days
    totalSeats: { "Sleeper": 500, "AC 3 Tier": 200 },
    price: { "Sleeper": 850, "AC 3 Tier": 2250 },
    stops: [
      { stopName: "Solapur", priceFromStart: 400, estimatedTimeAtStop: "06:00 AM" },
      { stopName: "Bhopal", priceFromStart: 1200, estimatedTimeAtStop: "08:00 PM" }
    ]
  },
  {
    id: "TRN-12971",
    name: "Bhavnagar Bandra Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Sleeper"],
    startPoint: "Bhavnagar Terminus",
    endPoint: "Mumbai Bandra",
    scheduleType: "daily",
    startTime: "06:30 PM",
    estimatedArrivalTime: "08:15 AM",
    totalSeats: { "Sleeper": 400, "AC 3 Tier": 150 },
    price: { "Sleeper": 420, "AC 3 Tier": 1150 },
    stops: [
      { stopName: "Ahmedabad", priceFromStart: 200, estimatedTimeAtStop: "11:00 PM" },
      { stopName: "Vadodara", priceFromStart: 250, estimatedTimeAtStop: "01:00 AM" },
      { stopName: "Surat", priceFromStart: 350, estimatedTimeAtStop: "03:30 AM" }
    ]
  },
  {
    id: "TRN-22436",
    name: "Vande Bharat Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["AC", "WiFi"],
    startPoint: "New Delhi",
    endPoint: "Varanasi",
    scheduleType: "weekly",
    daysOfWeek: ["Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"],
    startTime: "06:00 AM",
    estimatedArrivalTime: "02:00 PM",
    totalSeats: { "AC Chair car": 800 },
    price: { "AC Chair car": 1750 },
    stops: [
      { stopName: "Kanpur", priceFromStart: 800, estimatedTimeAtStop: "10:10 AM" },
      { stopName: "Prayagraj", priceFromStart: 1200, estimatedTimeAtStop: "12:10 PM" }
    ]
  },
  {
    id: "TRN-12245",
    name: "Duronto Express",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Meals", "AC"],
    startPoint: "Howrah (Kolkata)",
    endPoint: "Bengaluru",
    scheduleType: "weekly",
    daysOfWeek: ["Tuesday", "Wednesday", "Friday", "Sunday"],
    startTime: "10:50 AM",
    estimatedArrivalTime: "04:00 PM", // next day
    totalSeats: { "AC 3 Tier": 400, "AC 2 Tier": 100 },
    price: { "AC 3 Tier": 2600, "AC 2 Tier": 3800 },
    stops: [
      { stopName: "Bhubaneswar", priceFromStart: 600, estimatedTimeAtStop: "05:00 PM" },
      { stopName: "Vijayawada", priceFromStart: 1500, estimatedTimeAtStop: "04:00 AM" }
    ]
  },
  {
    id: "TRN-19217",
    name: "Saurashtra Janta",
    type: "train",
    operator: "Indian Railways",
    amenities: ["Sleeper"],
    startPoint: "Mumbai Bandra",
    endPoint: "Veraval",
    scheduleType: "daily",
    startTime: "01:40 PM",
    estimatedArrivalTime: "07:15 AM",
    totalSeats: { "Sleeper": 450 },
    price: { "Sleeper": 480 },
    stops: [
      { stopName: "Surat", priceFromStart: 150, estimatedTimeAtStop: "05:30 PM" },
      { stopName: "Ahmedabad", priceFromStart: 300, estimatedTimeAtStop: "10:00 PM" },
      { stopName: "Rajkot", priceFromStart: 400, estimatedTimeAtStop: "02:30 AM" }
    ]
  },

  // ================= AIR ROUTES (12 Routes) =================
  {
    id: "AIR-6E204",
    name: "IndiGo 6E-204",
    type: "air",
    operator: "IndiGo",
    airline: "IndiGo",
    flightNumber: "6E-204",
    amenities: ["Cabin Baggage", "Meal (Buy)"],
    startPoint: "Ahmedabad (AMD)",
    endPoint: "Mumbai (BOM)",
    startTime: "07:15 AM",
    estimatedArrivalTime: "08:30 AM",
    scheduleType: "daily",
    totalSeats: { "Economy": 180 },
    price: { "Economy": 3500 },
    stops: []
  },
  {
    id: "AIR-AI441",
    name: "Air India AI-441",
    type: "air",
    operator: "Air India",
    airline: "Air India",
    flightNumber: "AI-441",
    amenities: ["Meal Included", "WiFi"],
    startPoint: "New Delhi (DEL)",
    endPoint: "Pune (PNQ)",
    startTime: "07:00 PM",
    estimatedArrivalTime: "09:00 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 150, "Business": 12 },
    price: { "Economy": 5500, "Business": 18000 },
    stops: []
  },
  {
    id: "AIR-UK993",
    name: "Vistara UK-993",
    type: "air",
    operator: "Vistara",
    airline: "Vistara",
    flightNumber: "UK-993",
    amenities: ["Premium Economy", "Meal Included"],
    startPoint: "New Delhi (DEL)",
    endPoint: "Mumbai (BOM)",
    startTime: "05:00 PM",
    estimatedArrivalTime: "07:15 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 130, "Premium Economy": 24, "Business": 8 },
    price: { "Economy": 6000, "Premium Economy": 9000, "Business": 22000 },
    stops: []
  },
  {
    id: "AIR-QP110",
    name: "Akasa Air QP-110",
    type: "air",
    operator: "Akasa Air",
    airline: "Akasa Air",
    flightNumber: "QP-110",
    amenities: ["USB Charging", "Meal (Buy)"],
    startPoint: "Bengaluru (BLR)",
    endPoint: "Mumbai (BOM)",
    startTime: "10:00 AM",
    estimatedArrivalTime: "11:45 AM",
    scheduleType: "daily",
    totalSeats: { "Economy": 189 },
    price: { "Economy": 4200 },
    stops: []
  },
  {
    id: "AIR-6E606",
    name: "IndiGo 6E-606",
    type: "air",
    operator: "IndiGo",
    airline: "IndiGo",
    flightNumber: "6E-606",
    amenities: ["Snacks"],
    startPoint: "Bhavnagar (BHU)",
    endPoint: "Mumbai (BOM)",
    startTime: "09:30 AM",
    estimatedArrivalTime: "10:40 AM",
    scheduleType: "daily",
    totalSeats: { "Economy": 72 },
    price: { "Economy": 3000 },
    stops: []
  },
  {
    id: "AIR-AI665",
    name: "Air India AI-665",
    type: "air",
    operator: "Air India",
    airline: "Air India",
    flightNumber: "AI-665",
    amenities: ["Meals"],
    startPoint: "Mumbai (BOM)",
    endPoint: "New Delhi (DEL)",
    startTime: "08:00 AM",
    estimatedArrivalTime: "10:15 AM",
    scheduleType: "daily",
    totalSeats: { "Economy": 150, "Business": 12 },
    price: { "Economy": 5800, "Business": 19000 },
    stops: []
  },
  {
    id: "AIR-6E503",
    name: "IndiGo 6E-503",
    type: "air",
    operator: "IndiGo",
    airline: "IndiGo",
    flightNumber: "6E-503",
    amenities: ["Meal (Buy)"],
    startPoint: "Ahmedabad (AMD)",
    endPoint: "Bengaluru (BLR)",
    startTime: "04:00 PM",
    estimatedArrivalTime: "06:15 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 180 },
    price: { "Economy": 5200 },
    stops: []
  },
  {
    id: "AIR-UK707",
    name: "Vistara UK-707",
    type: "air",
    operator: "Vistara",
    airline: "Vistara",
    flightNumber: "UK-707",
    amenities: ["Meals", "WiFi"],
    startPoint: "New Delhi (DEL)",
    endPoint: "Kolkata (CCU)",
    startTime: "06:00 PM",
    estimatedArrivalTime: "08:15 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 140, "Business": 10 },
    price: { "Economy": 6500, "Business": 18000 },
    stops: []
  },
  {
    id: "AIR-6E332",
    name: "IndiGo 6E-332",
    type: "air",
    operator: "IndiGo",
    airline: "IndiGo",
    flightNumber: "6E-332",
    amenities: ["Cabin Baggage"],
    startPoint: "Surat (STV)",
    endPoint: "New Delhi (DEL)",
    startTime: "07:45 PM",
    estimatedArrivalTime: "09:30 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 180 },
    price: { "Economy": 4000 },
    stops: []
  },
  {
    id: "AIR-AI991",
    name: "Air India AI-991",
    type: "air",
    operator: "Air India",
    airline: "Air India",
    flightNumber: "AI-991",
    amenities: ["Meals"],
    startPoint: "Mumbai (BOM)",
    endPoint: "Dubai (DXB)",
    startTime: "05:00 PM",
    estimatedArrivalTime: "07:00 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 250, "Business": 20 },
    price: { "Economy": 12000, "Business": 35000 },
    stops: []
  },
  {
    id: "AIR-SG404",
    name: "SpiceJet SG-404",
    type: "air",
    operator: "SpiceJet",
    airline: "SpiceJet",
    flightNumber: "SG-404",
    amenities: ["Hot Meals (Buy)"],
    startPoint: "Mumbai (BOM)",
    endPoint: "Goa (GOI)",
    startTime: "01:00 PM",
    estimatedArrivalTime: "02:15 PM",
    scheduleType: "daily",
    totalSeats: { "Economy": 189 },
    price: { "Economy": 2800 },
    stops: []
  },
  {
    id: "AIR-6E112",
    name: "IndiGo 6E-112",
    type: "air",
    operator: "IndiGo",
    airline: "IndiGo",
    flightNumber: "6E-112",
    amenities: ["Standard"],
    startPoint: "Jaipur (JAI)",
    endPoint: "Mumbai (BOM)",
    startTime: "06:30 AM",
    estimatedArrivalTime: "08:20 AM",
    scheduleType: "daily",
    totalSeats: { "Economy": 180 },
    price: { "Economy": 4200 },
    stops: []
  },
  {
    id: "AIR-UK815", name: "Vistara UK-815", type: "air", operator: "Vistara", airline: "Vistara",
    flightNumber: "UK-815", amenities: ["Meals", "Premium Economy"],
    startPoint: "New Delhi (DEL)", endPoint: "Bengaluru (BLR)",
    scheduleType: "daily", startTime: "08:00 AM", estimatedArrivalTime: "10:45 AM",
    totalSeats: { "Economy": 130, "Premium Economy": 24, "Business": 8 },
    price: { "Economy": 6500, "Premium Economy": 10000, "Business": 25000 }, stops: []
  },
  {
    id: "AIR-6E564", name: "IndiGo 6E-564", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-564", amenities: ["Snacks (Buy)"],
    startPoint: "Mumbai (BOM)", endPoint: "Chennai (MAA)",
    scheduleType: "daily", startTime: "05:30 PM", estimatedArrivalTime: "07:20 PM",
    totalSeats: { "Economy": 180 }, price: { "Economy": 4200 }, stops: []
  },
  {
    id: "AIR-AI021", name: "Air India AI-021", type: "air", operator: "Air India", airline: "Air India",
    flightNumber: "AI-021", amenities: ["Hot Meals"],
    startPoint: "Kolkata (CCU)", endPoint: "New Delhi (DEL)",
    scheduleType: "daily", startTime: "10:00 AM", estimatedArrivalTime: "12:30 PM",
    totalSeats: { "Economy": 150, "Business": 12 },
    price: { "Economy": 5800, "Business": 18000 }, stops: []
  },
  {
    id: "AIR-SG902", name: "SpiceJet SG-902", type: "air", operator: "SpiceJet", airline: "SpiceJet",
    flightNumber: "SG-902", amenities: ["SpiceMax"],
    startPoint: "Hyderabad (HYD)", endPoint: "Pune (PNQ)",
    scheduleType: "daily", startTime: "06:45 AM", estimatedArrivalTime: "08:00 AM",
    totalSeats: { "Economy": 189 }, price: { "Economy": 3200 }, stops: []
  },
  {
    id: "AIR-I5992", name: "AIX Connect I5-992", type: "air", operator: "AIX Connect", airline: "AIX Connect",
    flightNumber: "I5-992", amenities: ["Gourmet Meals (Pre-book)"],
    startPoint: "Bengaluru (BLR)", endPoint: "Goa (GOI)",
    scheduleType: "weekly", daysOfWeek: ["Friday", "Saturday", "Sunday"],
    startTime: "02:15 PM", estimatedArrivalTime: "03:30 PM",
    totalSeats: { "Economy": 180 }, price: { "Economy": 2800 }, stops: []
  },

  // --- BUSINESS & TRADE ---
  {
    id: "AIR-UK955", name: "Vistara UK-955", type: "air", operator: "Vistara", airline: "Vistara",
    flightNumber: "UK-955", amenities: ["Starbucks Coffee", "Lounge Access (Biz)"],
    startPoint: "Ahmedabad (AMD)", endPoint: "New Delhi (DEL)",
    scheduleType: "daily", startTime: "07:00 AM", estimatedArrivalTime: "08:35 AM",
    totalSeats: { "Economy": 140, "Business": 8 },
    price: { "Economy": 4000, "Business": 14000 }, stops: []
  },
  {
    id: "AIR-6E211", name: "IndiGo 6E-211", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-211", amenities: ["Corporate Fares"],
    startPoint: "Mumbai (BOM)", endPoint: "Nagpur (NAG)",
    scheduleType: "daily", startTime: "06:00 PM", estimatedArrivalTime: "07:30 PM",
    totalSeats: { "Economy": 180 }, price: { "Economy": 3800 }, stops: []
  },
  {
    id: "AIR-QP133", name: "Akasa Air QP-133", type: "air", operator: "Akasa Air", airline: "Akasa Air",
    flightNumber: "QP-133", amenities: ["USB Ports", "Cafe Akasa"],
    startPoint: "Bengaluru (BLR)", endPoint: "Kochi (COK)",
    scheduleType: "daily", startTime: "09:00 PM", estimatedArrivalTime: "10:15 PM",
    totalSeats: { "Economy": 189 }, price: { "Economy": 2500 }, stops: []
  },
  {
    id: "AIR-SG818", name: "SpiceJet SG-818", type: "air", operator: "SpiceJet", airline: "SpiceJet",
    flightNumber: "SG-818", amenities: ["Standard"],
    startPoint: "Jaipur (JAI)", endPoint: "Pune (PNQ)",
    scheduleType: "weekly", daysOfWeek: ["Monday", "Wednesday", "Friday"],
    startTime: "11:30 AM", estimatedArrivalTime: "01:20 PM",
    totalSeats: { "Economy": 189 }, price: { "Economy": 4500 }, stops: []
  },

  // --- HOLIDAY DESTINATIONS ---
  {
    id: "AIR-6E892", name: "IndiGo 6E-892", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-892", amenities: ["Island View"],
    startPoint: "Chennai (MAA)", endPoint: "Port Blair (IXZ)",
    scheduleType: "daily", startTime: "05:00 AM", estimatedArrivalTime: "07:15 AM",
    totalSeats: { "Economy": 180 }, price: { "Economy": 6500 }, stops: []
  },
  {
    id: "AIR-AI445", name: "Air India AI-445", type: "air", operator: "Air India", airline: "Air India",
    flightNumber: "AI-445", amenities: ["Hot Meals", "Blanket"],
    startPoint: "New Delhi (DEL)", endPoint: "Leh (IXL)",
    scheduleType: "daily", startTime: "06:30 AM", estimatedArrivalTime: "07:50 AM",
    totalSeats: { "Economy": 140, "Business": 10 },
    price: { "Economy": 8000, "Business": 18000 }, stops: []
  },
  {
    id: "AIR-6E714", name: "IndiGo 6E-714", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-714", amenities: ["Standard"],
    startPoint: "Mumbai (BOM)", endPoint: "Jaipur (JAI)",
    scheduleType: "daily", startTime: "04:00 PM", estimatedArrivalTime: "05:45 PM",
    totalSeats: { "Economy": 180 }, price: { "Economy": 3900 }, stops: []
  },
  {
    id: "AIR-SG606", name: "SpiceJet SG-606", type: "air", operator: "SpiceJet", airline: "SpiceJet",
    flightNumber: "SG-606", amenities: ["Hill View"],
    startPoint: "Kolkata (CCU)", endPoint: "Bagdogra (IXB)",
    scheduleType: "daily", startTime: "12:00 PM", estimatedArrivalTime: "01:10 PM",
    totalSeats: { "Economy": 78 }, price: { "Economy": 3200 }, stops: []
  },
  {
    id: "AIR-UK611", name: "Vistara UK-611", type: "air", operator: "Vistara", airline: "Vistara",
    flightNumber: "UK-611", amenities: ["Premium Economy", "Meals"],
    startPoint: "New Delhi (DEL)", endPoint: "Srinagar (SXR)",
    scheduleType: "daily", startTime: "10:15 AM", estimatedArrivalTime: "11:45 AM",
    totalSeats: { "Economy": 130, "Premium Economy": 24 },
    price: { "Economy": 7000, "Premium Economy": 11000 }, stops: []
  },
  {
    id: "AIR-AI471", name: "Air India AI-471", type: "air", operator: "Air India", airline: "Air India",
    flightNumber: "AI-471", amenities: ["Snacks"],
    startPoint: "Mumbai (BOM)", endPoint: "Udaipur (UDR)",
    scheduleType: "weekly", daysOfWeek: ["Saturday", "Sunday"],
    startTime: "11:00 AM", estimatedArrivalTime: "12:20 PM",
    totalSeats: { "Economy": 150 }, price: { "Economy": 4800 }, stops: []
  },

  // --- PILGRIMAGE & OTHERS ---
  {
    id: "AIR-6E333", name: "IndiGo 6E-333", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-333", amenities: ["Standard"],
    startPoint: "Hyderabad (HYD)", endPoint: "Tirupati (TIR)",
    scheduleType: "daily", startTime: "07:00 AM", estimatedArrivalTime: "08:10 AM",
    totalSeats: { "Economy": 72 }, price: { "Economy": 2800 }, stops: []
  },
  {
    id: "AIR-6E772", name: "IndiGo 6E-772", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-772", amenities: ["Standard"],
    startPoint: "Chennai (MAA)", endPoint: "Madurai (IXM)",
    scheduleType: "daily", startTime: "08:30 PM", estimatedArrivalTime: "09:40 PM",
    totalSeats: { "Economy": 72 }, price: { "Economy": 2500 }, stops: []
  },
  {
    id: "AIR-SG101", name: "SpiceJet SG-101", type: "air", operator: "SpiceJet", airline: "SpiceJet",
    flightNumber: "SG-101", amenities: ["Snacks (Buy)"],
    startPoint: "Bengaluru (BLR)", endPoint: "Mangaluru (IXE)",
    scheduleType: "daily", startTime: "06:00 AM", estimatedArrivalTime: "07:10 AM",
    totalSeats: { "Economy": 78 }, price: { "Economy": 2200 }, stops: []
  },
  {
    id: "AIR-6E222", name: "IndiGo 6E-222", type: "air", operator: "IndiGo", airline: "IndiGo",
    flightNumber: "6E-222", amenities: ["Standard"],
    startPoint: "New Delhi (DEL)", endPoint: "Varanasi (VNS)",
    scheduleType: "daily", startTime: "02:00 PM", estimatedArrivalTime: "03:25 PM",
    totalSeats: { "Economy": 180 }, price: { "Economy": 3500 }, stops: []
  },
  {
    id: "AIR-AI729", name: "Air India AI-729", type: "air", operator: "Air India", airline: "Air India",
    flightNumber: "AI-729", amenities: ["Meals"],
    startPoint: "Guwahati (GAU)", endPoint: "Kolkata (CCU)",
    scheduleType: "daily", startTime: "09:00 AM", estimatedArrivalTime: "10:15 AM",
    totalSeats: { "Economy": 150 }, price: { "Economy": 3000 }, stops: []
  }
];