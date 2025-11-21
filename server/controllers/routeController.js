import Route from '../models/route.js';
import Booking from '../models/Booking.js'; // <-- YEH IMPORT ADD KARO

// ... (createRoute, updateRoute, getAllRoutes, deleteRoute functions ko same rakho) ...
// ...
export const createRoute = async (req, res) => { /* ... same code ... */ };
export const updateRoute = async (req, res) => { /* ... same code ... */ };
export const getAllRoutes = async (req, res) => { /* ... same code ... */ };
export const deleteRoute = async (req, res) => { /* ... same code ... */ };
// ...


// Helper to calculate available seats
const getAvailableSeats = async (route, date) => {
  let availableSeats = { ...route.totalSeats };
  if (typeof availableSeats !== 'object' || availableSeats === null) {
    availableSeats = { default: Number(availableSeats) || 0 };
  }

  const bookings = await Booking.find({
    routeId: route._id,
    departureDateTime: {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  for (const booking of bookings) {
    const classKey = booking.classType || 'default';
    const passengerCount = booking.passengers ? booking.passengers.length : 0;

    if (availableSeats[classKey] !== undefined) {
      availableSeats[classKey] -= passengerCount;
    } else if (availableSeats['default'] !== undefined) {
      availableSeats['default'] -= passengerCount;
    }
  }
  return availableSeats;
};

// Helper to parse time string "HH:mm" to Date object on a specific date
const getTimeOnDate = (timeStr, date) => {
  if (!timeStr) return new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

export const searchRoutes = async (req, res) => {
  try {
    const { from, to, date, type, class: classType } = req.query;

    if (!from || !to || !date || !type) {
      return res.status(400).json({ message: "Missing required search parameters." });
    }

    const searchDate = new Date(`${date}T00:00:00.000Z`);
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][searchDate.getUTCDay()];

    // Base query for schedule matching
    let baseQuery = {
      type: type.toLowerCase(),
      $or: [
        { scheduleType: 'daily' },
        { scheduleType: 'weekly', daysOfWeek: dayOfWeek },
        { scheduleType: 'specific_date', specificDate: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000) } }
      ]
    };

    // Fetch all potential routes for the day
    const candidates = await Route.find(baseQuery);

    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    // --- Step 1: Find Direct Routes ---
    const directRoutes = candidates.filter(route => {
      const startMatch = route.startPoint.toLowerCase() === fromLower;
      const endMatch = route.endPoint.toLowerCase() === toLower;

      if (startMatch && endMatch) return true;

      if (route.stops && route.stops.length > 0) {
        const stopNamesLower = route.stops.map(s => s.stopName.toLowerCase());
        const fromIndex = startMatch ? 0 : stopNamesLower.indexOf(fromLower) + 1;
        const toIndex = endMatch ? route.stops.length + 1 : stopNamesLower.indexOf(toLower) + 1;

        if (fromIndex > 0 && toIndex > 0 && fromIndex < toIndex) {
          return true;
        }
      }
      return false;
    });

    // Process direct routes availability
    const processedDirectRoutes = await Promise.all(
      directRoutes.map(async (route) => {
        const seats = await getAvailableSeats(route, searchDate);
        return { ...route.toObject(), availableSeats: seats, isDirect: true };
      })
    );

    let finalResults = [...processedDirectRoutes];

    // --- Step 2: Find Connecting Routes (if direct routes are few) ---
    if (finalResults.length < 5) {
      // Find potential first legs (Start at 'from')
      const firstLegs = candidates.filter(route => {
        return route.startPoint.toLowerCase() === fromLower ||
          (route.stops && route.stops.some(s => s.stopName.toLowerCase() === fromLower));
      });

      // Find potential second legs (End at 'to')
      // Note: Second leg could be on the same day OR the next day
      // For simplicity, let's first check same day connections
      const secondLegsSameDay = candidates.filter(route => {
        return route.endPoint.toLowerCase() === toLower ||
          (route.stops && route.stops.some(s => s.stopName.toLowerCase() === toLower));
      });

      // We iterate through first legs and try to find a matching second leg
      for (const leg1 of firstLegs) {
        // Determine where Leg 1 ends (the transfer point)
        // It could be the route's endPoint, or any stop AFTER 'from'

        let potentialTransferPoints = [];
        const leg1StopsLower = leg1.stops ? leg1.stops.map(s => s.stopName.toLowerCase()) : [];
        const startIdx = leg1.startPoint.toLowerCase() === fromLower ? -1 : leg1StopsLower.indexOf(fromLower);

        // Add stops after startIdx as potential transfer points
        if (leg1.stops) {
          leg1.stops.slice(startIdx + 1).forEach(stop => potentialTransferPoints.push(stop.stopName));
        }
        // Add endPoint if it's after startIdx
        potentialTransferPoints.push(leg1.endPoint);

        for (const transferPoint of potentialTransferPoints) {
          const transferPointLower = transferPoint.toLowerCase();

          // Find matching second legs starting at transferPoint
          const matchingSecondLegs = secondLegsSameDay.filter(leg2 => {
            if (leg2._id.toString() === leg1._id.toString()) return false; // Same route

            const leg2StartMatch = leg2.startPoint.toLowerCase() === transferPointLower;
            const leg2StopsLower = leg2.stops ? leg2.stops.map(s => s.stopName.toLowerCase()) : [];
            const leg2StartIndex = leg2StartMatch ? -1 : leg2StopsLower.indexOf(transferPointLower);

            // Check if leg2 starts at transferPoint AND ends at 'to' AFTER transferPoint
            if (leg2StartIndex === -1 && !leg2StartMatch) return false; // Doesn't touch transfer point

            const leg2EndMatch = leg2.endPoint.toLowerCase() === toLower;
            const leg2EndIndex = leg2EndMatch ? leg2.stops.length : leg2StopsLower.indexOf(toLower);

            return leg2EndIndex > leg2StartIndex;
          });

          for (const leg2 of matchingSecondLegs) {
            // Check Time Constraint
            // Need to parse times. Assuming departureTime/arrivalTime are "HH:mm" strings
            // And we are on 'searchDate'

            // Calculate Leg 1 Arrival Time at Transfer Point
            // Simplified: Using route's global arrival time if transfer is at end, 
            // or estimating if at stop (this is complex without detailed stop timings).
            // FALLBACK: Use route's main arrival time if transfer is at endPoint.
            // If transfer is at a stop, we might not have time data. 
            // Let's stick to transfer at endPoint for reliability if stop times aren't available.

            let leg1ArrivalTime;
            if (leg1.endPoint.toLowerCase() === transferPointLower) {
              // --- FIX: Use estimatedArrivalTime ---
              leg1ArrivalTime = getTimeOnDate(leg1.estimatedArrivalTime, searchDate);
            } else {
              // If transfer is at a stop, skip for now unless we have stop timings
              continue;
            }

            // Calculate Leg 2 Departure Time at Transfer Point
            let leg2DepartureTime;
            if (leg2.startPoint.toLowerCase() === transferPointLower) {
              // --- FIX: Use startTime ---
              leg2DepartureTime = getTimeOnDate(leg2.startTime, searchDate);
            } else {
              continue;
            }

            // Check if connection is valid (e.g., > 1 hour layover)
            const layoverMs = leg2DepartureTime - leg1ArrivalTime;
            const minLayover = 60 * 60 * 1000; // 1 hour
            const maxLayover = 12 * 60 * 60 * 1000; // 12 hours

            if (layoverMs >= minLayover && layoverMs <= maxLayover) {
              // Found a valid connection!
              // Check availability for both
              const seats1 = await getAvailableSeats(leg1, searchDate);
              const seats2 = await getAvailableSeats(leg2, searchDate);

              // Add to results
              finalResults.push({
                isConnecting: true,
                totalFare: (leg1.price?.default || 0) + (leg2.price?.default || 0), // Simplified price access
                totalDuration: ((leg2DepartureTime - getTimeOnDate(leg1.startTime, searchDate)) + (getTimeOnDate(leg2.estimatedArrivalTime, searchDate) - leg2DepartureTime)) / (1000 * 60 * 60) + " hours", // Rough est
                legs: [
                  { ...leg1.toObject(), availableSeats: seats1 },
                  { ...leg2.toObject(), availableSeats: seats2 }
                ],
                transferPoint: transferPoint,
                layoverDuration: layoverMs / (1000 * 60) + " mins"
              });
            }
          }
        }
      }
    }

    res.status(200).json(finalResults);

  } catch (error) {
    console.error("Error searching routes:", error);
    res.status(500).json({ message: 'Error searching routes', error: error.message });
  }
};