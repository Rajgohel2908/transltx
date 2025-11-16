import Route from '../models/route.js';
import Booking from '../models/Booking.js'; // <-- YEH IMPORT ADD KARO

// ... (createRoute, updateRoute, getAllRoutes, deleteRoute functions ko same rakho) ...
// ...
export const createRoute = async (req, res) => { /* ... same code ... */ };
export const updateRoute = async (req, res) => { /* ... same code ... */ };
export const getAllRoutes = async (req, res) => { /* ... same code ... */ };
export const deleteRoute = async (req, res) => { /* ... same code ... */ };
// ...


// --- searchRoutes FUNCTION KO POORA REPLACE KARO ---
export const searchRoutes = async (req, res) => {
  try {
    const { from, to, date, type, class: classType } = req.query;

    if (!from || !to || !date || !type) {
      return res.status(400).json({ message: "Missing required search parameters." });
    }
    
    const searchDate = new Date(`${date}T00:00:00.000Z`);
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][searchDate.getUTCDay()];

    // --- Step 1: Schedule ke hisab se routes find karo ---
    let baseQuery = {
        type: type.toLowerCase(),
        $or: [
          { scheduleType: 'daily' },
          { scheduleType: 'weekly', daysOfWeek: dayOfWeek },
          { scheduleType: 'specific_date', specificDate: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 24*60*60*1000) } }
        ]
    };
    
    // Pehle candidates find karo
    const candidates = await Route.find(baseQuery);

    // --- Step 2: 'From' aur 'To' ke hisab se filter karo ---
    // (Yeh logic pehle jaisa hi hai, bas 'from'/'to' ko lowercase pe check kar raha hoon)
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    const matchedRoutes = candidates.filter(route => {
        const startMatch = route.startPoint.toLowerCase() === fromLower;
        const endMatch = route.endPoint.toLowerCase() === toLower;
        
        // Direct match check
        if (startMatch && endMatch) return true;

        // Stop match check
        if (route.stops && route.stops.length > 0) {
            const stopNamesLower = route.stops.map(s => s.stopName.toLowerCase());
            const fromIndex = startMatch ? 0 : stopNamesLower.indexOf(fromLower) + 1; // +1 kyunki stop index 0 se hai
            const toIndex = endMatch ? route.stops.length + 1 : stopNamesLower.indexOf(toLower) + 1;
            
            // Agar 'from' 'to' ke baad aata hai, toh invalid route
            if (fromIndex > 0 && toIndex > 0 && fromIndex < toIndex) {
                return true;
            }
        }
        return false;
    });

    // --- Step 3: Har matched route ke liye AVAILABLE SEATS calculate karo ---
    const finalResults = await Promise.all(
      matchedRoutes.map(async (route) => {
        
        // 1. Route ki total seats se start karo
        let availableSeats = { ...route.totalSeats };
        if(typeof availableSeats !== 'object' || availableSeats === null) {
            availableSeats = { default: Number(availableSeats) || 0 };
        }

        // 2. Uss din ki saari bookings find karo
        const bookings = await Booking.find({
          routeId: route._id,
          departureDateTime: { 
            $gte: searchDate, 
            $lt: new Date(searchDate.getTime() + 24*60*60*1000) 
          }
        });

        // 3. Booked seats ko total se minus karo
        for (const booking of bookings) {
          const classKey = booking.classType || 'default';
          const passengerCount = booking.passengers ? booking.passengers.length : 0;
          
          if (availableSeats[classKey] !== undefined) {
            availableSeats[classKey] -= passengerCount;
          } else if (availableSeats['default'] !== undefined) {
             availableSeats['default'] -= passengerCount; // Bus/Trip fallback
          }
        }

        // 4. Naya 'availableSeats' object return karo
        return {
          ...route.toObject(), // Route data ko plain object mein convert karo
          availableSeats: availableSeats // Naya field add karo
        };
      })
    );

    res.status(200).json(finalResults);
    
  } catch (error) {
    console.error("Error searching routes:", error);
    res.status(500).json({ message: 'Error searching routes', error: error.message });
  }
};