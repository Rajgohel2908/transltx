// server/scripts/data/routes.js
import mongoose from 'mongoose';

// --- HARDCODED BASE DATA (Real World Logic) ---
// Yeh wo routes hain jo actually exist karte hain tere locations ke beech mein.

const airRoutesBase = [
  {
    from: "Ahmedabad (AMD) - Sardar Vallabhbhai Patel Intl",
    to: "Mumbai (BOM) - Chhatrapati Shivaji Intl",
    operator: "IndiGo",
    flightNo: "6E-532",
    price: { economy: 3500, business: 12000 },
    time: "01h 10m",
    seats: { economy: 180, business: 12 }
  },
  {
    from: "Delhi (DEL) - Indira Gandhi International",
    to: "Bengaluru (BLR) - Kempegowda International",
    operator: "Vistara",
    flightNo: "UK-817",
    price: { economy: 7500, business: 22000 },
    time: "02h 45m",
    seats: { economy: 150, business: 16 }
  },
  {
    from: "Jaipur (JAI) - Jaipur International Airport",
    to: "Mumbai (BOM) - Chhatrapati Shivaji Intl",
    operator: "Air India",
    flightNo: "AI-612",
    price: { economy: 4200, business: 15000 },
    time: "01h 50m",
    seats: { economy: 140, business: 8 }
  },
  {
    from: "Bengaluru (BLR) - Kempegowda International",
    to: "Pune (PNQ) - Pune International Airport",
    operator: "Akasa Air",
    flightNo: "QP-134",
    price: { economy: 3100, business: 0 }, // Akasa usually eco only
    time: "01h 25m",
    seats: { economy: 189, business: 0 }
  },
  {
    from: "Indore (IDR) - Devi Ahilya Bai Holkar Airport",
    to: "Delhi (DEL) - Indira Gandhi International",
    operator: "IndiGo",
    flightNo: "6E-204",
    price: { economy: 3800, business: 0 },
    time: "01h 35m",
    seats: { economy: 180, business: 0 }
  },
  {
    from: "Amritsar (ATQ) - Sri Guru Ram Dass Jee Intl",
    to: "Delhi (DEL) - Indira Gandhi International",
    operator: "Air India",
    flightNo: "AI-462",
    price: { economy: 2900, business: 9000 },
    time: "01h 05m",
    seats: { economy: 120, business: 8 }
  },
  {
    from: "Mumbai (BOM) - Chhatrapati Shivaji Intl",
    to: "Nagpur (NAG) - Dr. Babasheb Ambedkar Intl",
    operator: "IndiGo",
    flightNo: "6E-401",
    price: { economy: 3200, business: 0 },
    time: "01h 30m",
    seats: { economy: 180, business: 0 }
  },
  {
    from: "Ahmedabad (AMD) - Sardar Vallabhbhai Patel Intl",
    to: "Jaipur (JAI) - Jaipur International Airport",
    operator: "SpiceJet",
    flightNo: "SG-342",
    price: { economy: 2800, business: 0 },
    time: "01h 15m",
    seats: { economy: 78, business: 0 }
  },
  {
    from: "Surat (STV) - Surat International Airport",
    to: "Delhi (DEL) - Indira Gandhi International",
    operator: "Air India Express",
    flightNo: "IX-344",
    price: { economy: 4100, business: 0 },
    time: "01h 45m",
    seats: { economy: 180, business: 0 }
  },
  {
    from: "Bhopal (BHO) - Raja Bhoj Airport",
    to: "Mumbai (BOM) - Chhatrapati Shivaji Intl",
    operator: "Air India",
    flightNo: "AI-634",
    price: { economy: 4500, business: 14000 },
    time: "01h 30m",
    seats: { economy: 130, business: 10 }
  }
];

const trainRoutesBase = [
  {
    name: "Karnavati Express",
    from: "Ahmedabad (ADI)",
    to: "Mumbai CSMT (CSMT)",
    stops: [
      { stopName: "Vadodara (BRC)", priceFromStart: 150, estimatedTimeAtStop: "06:30" },
      { stopName: "Surat (ST)", priceFromStart: 300, estimatedTimeAtStop: "08:15" }
    ],
    time: "07h 40m",
    price: { sleeper: 280, ac3: 750, ac2: 1100, ac1: 1800 }
  },
  {
    name: "Shatabdi Express",
    from: "New Delhi (NDLS)",
    to: "Amritsar (ASR)",
    stops: [
      { stopName: "Ludhiana (LDH)", priceFromStart: 600, estimatedTimeAtStop: "10:15" },
      { stopName: "Jalandhar City (JUC)", priceFromStart: 750, estimatedTimeAtStop: "11:30" }
    ],
    time: "06h 15m",
    price: { sleeper: 0, ac3: 900, ac2: 1400, ac1: 2100 } // Shatabdi rarely has sleeper, but schema logic
  },
  {
    name: "Rajdhani Express",
    from: "Mumbai CSMT (CSMT)",
    to: "New Delhi (NDLS)",
    stops: [
      { stopName: "Surat (ST)", priceFromStart: 800, estimatedTimeAtStop: "19:30" },
      { stopName: "Vadodara (BRC)", priceFromStart: 1200, estimatedTimeAtStop: "21:15" },
      { stopName: "Kota (KOTA)", priceFromStart: 2000, estimatedTimeAtStop: "03:40" }
    ],
    time: "15h 30m",
    price: { sleeper: 0, ac3: 2500, ac2: 3800, ac1: 5400 }
  },
  {
    name: "Karnataka Express",
    from: "Bengaluru City (SBC)",
    to: "New Delhi (NDLS)",
    stops: [
      { stopName: "Kalaburagi", priceFromStart: 600, estimatedTimeAtStop: "04:00" },
      { stopName: "Bhopal (BPL)", priceFromStart: 1800, estimatedTimeAtStop: "16:30" }
    ],
    time: "38h 00m",
    price: { sleeper: 900, ac3: 2400, ac2: 3600, ac1: 0 }
  },
  {
    name: "Avantika Express",
    from: "Indore (INDB)",
    to: "Mumbai CSMT (CSMT)",
    stops: [
      { stopName: "Ujjain (UJN)", priceFromStart: 100, estimatedTimeAtStop: "17:30" },
      { stopName: "Ratlam (RTM)", priceFromStart: 300, estimatedTimeAtStop: "19:45" }
    ],
    time: "13h 10m",
    price: { sleeper: 480, ac3: 1250, ac2: 1800, ac1: 3000 }
  },
  {
    name: "Mandore Express",
    from: "Jodhpur (JU)",
    to: "New Delhi (NDLS)",
    stops: [
      { stopName: "Jaipur (JP)", priceFromStart: 400, estimatedTimeAtStop: "23:15" },
      { stopName: "Alwar (AWR)", priceFromStart: 550, estimatedTimeAtStop: "01:30" }
    ],
    time: "10h 30m",
    price: { sleeper: 420, ac3: 1100, ac2: 1600, ac1: 2700 }
  },
  {
    name: "Punjab Mail",
    from: "Mumbai CSMT (CSMT)",
    to: "Firozpur", // Using generic name as per files
    stops: [
      { stopName: "Bhopal (BPL)", priceFromStart: 700, estimatedTimeAtStop: "08:00" },
      { stopName: "New Delhi (NDLS)", priceFromStart: 1300, estimatedTimeAtStop: "18:00" }
    ],
    time: "32h 00m",
    price: { sleeper: 850, ac3: 2200, ac2: 3200, ac1: 0 }
  },
  {
    name: "Matsyagandha Express",
    from: "Mangaluru (MAQ)",
    to: "Mumbai CSMT (CSMT)",
    stops: [
      { stopName: "Udupi", priceFromStart: 150, estimatedTimeAtStop: "14:30" },
      { stopName: "Panvel", priceFromStart: 800, estimatedTimeAtStop: "05:00" }
    ],
    time: "16h 00m",
    price: { sleeper: 600, ac3: 1600, ac2: 2400, ac1: 0 }
  }
];

// --- GENERATOR FUNCTION (Deterministic, No Randomness) ---
const generateHardcodedRoutes = () => {
  const routes = [];
  let idCounter = 100;

  // 1. PROCESS AIR ROUTES (Generating 50 Routes)
  // Logic: Har base route ka 5 version banayenge (Different Time slots & Dates)
  airRoutesBase.forEach((route, index) => {
    // 5 variations per route = 10 routes * 5 = 50 Air Data
    const times = ["06:00", "10:30", "14:15", "18:45", "22:10"];
    
    times.forEach((timeSlot, i) => {
      routes.push({
        id: `FLT-${route.operator.substring(0,2).toUpperCase()}-${idCounter++}`,
        name: `Direct Flight ${route.from.split(' ')[0]} to ${route.to.split(' ')[0]}`,
        type: "air",
        operator: route.operator,
        amenities: ["Wi-Fi", "In-flight Meal", "USB Port"],
        estimatedArrivalTime: route.time,
        startPoint: route.from,
        endPoint: route.to,
        scheduleType: "daily",
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        startTime: timeSlot,
        totalSeats: route.seats,
        stops: [],
        flightNumber: `${route.flightNo}-${i+1}`, // e.g., AI-612-1
        airline: route.operator,
        price: route.price
      });
    });
  });

  // 2. PROCESS TRAIN ROUTES (Generating 50 Routes)
  // Logic: Har train ka 'Up' aur 'Down' direction + Different days
  trainRoutesBase.forEach((route, index) => {
    // Variation 1: As Defined (Main Run)
    routes.push(createTrainObject(route, idCounter++, "daily", "06:00"));
    
    // Variation 2: Same Train, Evening Schedule
    routes.push(createTrainObject(route, idCounter++, "daily", "21:00"));

    // Variation 3: Return Journey (Swap Start/End) - Hardcoded logic swap
    const returnRoute = { ...route, from: route.to, to: route.from, stops: [] }; // Return train usually has different stops order, keeping simple
    routes.push(createTrainObject(returnRoute, idCounter++, "daily", "08:00"));
    routes.push(createTrainObject(returnRoute, idCounter++, "daily", "22:30"));

    // Variation 4: Weekend Special of same train
    routes.push(createTrainObject(route, idCounter++, "specific_date", "10:00", new Date("2024-12-25")));
    
    // Variation 5: Holiday Special
    routes.push(createTrainObject(returnRoute, idCounter++, "specific_date", "14:00", new Date("2024-01-01")));
  });

  // Fillers to ensure we hit exactly 100 if math is slightly off (Current: 10*5 + 8*6 = ~98)
  // Adding 2 specific connections
  routes.push({
    id: `TRN-SPECIAL-${idCounter++}`,
    name: "Garib Rath",
    type: "train",
    operator: "Indian Railways",
    amenities: ["AC", "Bedding"],
    estimatedArrivalTime: "14h",
    startPoint: "Bandra Terminus (BDTS)",
    endPoint: "Delhi Sarai Rohilla (DEE)",
    scheduleType: "weekly",
    daysOfWeek: ["Tuesday", "Saturday"],
    startTime: "12:55",
    totalSeats: { ac3: 800 },
    stops: [],
    price: { ac3: 1000 }
  });
  
  routes.push({
    id: `FLT-SPECIAL-${idCounter++}`,
    name: "Business Connect",
    type: "air",
    operator: "Vistara",
    amenities: ["Lounge Access", "Meal"],
    estimatedArrivalTime: "02h 00m",
    startPoint: "Mumbai (BOM) - Chhatrapati Shivaji Intl",
    endPoint: "Delhi (DEL) - Indira Gandhi International",
    scheduleType: "daily",
    daysOfWeek: ["Monday"],
    startTime: "07:00",
    totalSeats: { business: 50, economy: 100 },
    stops: [],
    flightNumber: "UK-999",
    airline: "Vistara",
    price: { business: 25000, economy: 8000 }
  });

  return routes;
};

// Helper to keep code clean
function createTrainObject(data, id, schedType, time, date = null) {
  return {
    id: `TRN-${id}`,
    name: data.name,
    type: "train",
    operator: "Indian Railways",
    amenities: ["Pantry Car", "Charging Point", "E-Catering"],
    estimatedArrivalTime: data.time,
    startPoint: data.from,
    endPoint: data.to,
    scheduleType: schedType,
    daysOfWeek: schedType === 'daily' ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] : [],
    specificDate: date,
    startTime: time,
    totalSeats: { sleeper: 400, ac3: 200, ac2: 100, ac1: 50 },
    stops: data.stops,
    flightNumber: null,
    airline: null,
    price: data.price
  };
}

export default generateHardcodedRoutes;