import Route from '../models/route.js';

// Create a new route
export const createRoute = async (req, res) => {
  try {
    const { type } = req.body;

    // Basic data common to all types
    const routeData = {
      id: req.body.id,
      name: req.body.name,
      type: req.body.type,
      operator: req.body.operator,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : (req.body.amenities ? String(req.body.amenities).split(',').map(s => s.trim()).filter(Boolean) : []),
      estimatedArrivalTime: req.body.estimatedArrivalTime || req.body.estimatedArrival,
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      price: req.body.price,
      scheduleType: req.body.scheduleType,
      daysOfWeek: req.body.daysOfWeek,
      specificDate: req.body.specificDate,
      startTime: req.body.startTime,
      stops: req.body.stops || [],
    };

    if (type === 'air') {
      routeData.flightNumber = req.body.flightNumber;
      routeData.airline = req.body.airline;
    }

    const newRoute = new Route(routeData);
    await newRoute.save();
    res.status(201).json({ message: 'Route created successfully', route: newRoute });
  } catch (error) {
    res.status(500).json({ message: 'Error creating route', error: error.message });
  }
};

// Update an existing route
export const updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params; // Assuming you pass the route's DB _id in the URL
    const { type } = req.body;

    const updateData = {
      id: req.body.id,
      name: req.body.name,
      type: req.body.type,
      operator: req.body.operator,
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities : (req.body.amenities ? String(req.body.amenities).split(',').map(s => s.trim()).filter(Boolean) : []),
      estimatedArrivalTime: req.body.estimatedArrivalTime || req.body.estimatedArrival,
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      price: req.body.price,
      scheduleType: req.body.scheduleType,
      daysOfWeek: req.body.daysOfWeek,
      specificDate: req.body.specificDate,
      startTime: req.body.startTime,
      stops: req.body.stops,
    };

    if (type === 'air') {
      updateData.flightNumber = req.body.flightNumber;
      updateData.airline = req.body.airline;
    } else {
      // for non-air, ensure flight specific fields are removed
      updateData.$unset = { flightNumber: 1, airline: 1 };
    }

    const updatedRoute = await Route.findByIdAndUpdate(routeId, updateData, { new: true });

    if (!updatedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.status(200).json({ message: 'Route updated successfully', route: updatedRoute });
  } catch (error) {
    res.status(500).json({ message: 'Error updating route', error: error.message });
  }
};

// Get all routes
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routes', error: error.message });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Search routes by criteria
// @route   GET /api/routes/search
// @access  Public
export const searchRoutes = async (req, res) => {
  try {
    const { from, to, date, type } = req.query;

    let baseQuery = {};
    if (type) baseQuery.type = type.toLowerCase();

    if (date) {
      const searchDate = new Date(`${date}T00:00:00.000Z`);
      const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][searchDate.getUTCDay()];
      baseQuery.$or = [
        { scheduleType: 'daily' },
        { scheduleType: 'weekly', daysOfWeek: dayOfWeek },
        { scheduleType: 'specific_date', specificDate: { $gte: searchDate, $lt: new Date(searchDate.getTime() + 24*60*60*1000) } }
      ];
    }

    // Fetch candidate routes matching schedule/type
    const candidates = await Route.find(baseQuery);
    const matches = [];

    // If from/to provided, attempt stop-to-stop matching
    for (const route of candidates) {
      const stops = Array.isArray(route.stops) ? route.stops : [];

      // normalize helper
      const normalize = (s) => String(s || '').trim().toLowerCase();

      let iIndex = -1;
      let jIndex = -1;

      if (from && to && stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
          const sName = normalize(stops[i].stopName || stops[i]);
          if (sName === normalize(from)) {
            iIndex = i;
            // find j > i
            for (let j = i+1; j < stops.length; j++) {
              const tName = normalize(stops[j].stopName || stops[j]);
              if (tName === normalize(to)) {
                jIndex = j;
                break;
              }
            }
            if (jIndex !== -1) break;
          }
        }
      }

      if (iIndex !== -1 && jIndex !== -1 && jIndex > iIndex) {
        // compute dynamic price
        const priceFromStartI = Number(stops[iIndex].priceFromStart || 0);
        const priceFromStartJ = Number(stops[jIndex].priceFromStart || 0);
        const dynamicPrice = Math.max(0, priceFromStartJ - priceFromStartI);

        // slice stops between i and j inclusive
        const slicedStops = stops.slice(iIndex, jIndex+1);

        const result = route.toObject();
        result.price = dynamicPrice;
        result.stops = slicedStops;
        result.from = stops[iIndex].stopName || result.from || from;
        result.to = stops[jIndex].stopName || result.endPoint || to;
        matches.push(result);
      } else if (!from && !to) {
        // no stop-to-stop search requested, return route as-is
        matches.push(route);
      } else {
        // If stops array empty or no match, fall back to matching startPoint/endPoint strings
        if (from && to) {
          const startsWithFrom = normalize(route.startPoint) === normalize(from);
          const endsWithTo = normalize(route.endPoint) === normalize(to);
          if (startsWithFrom && endsWithTo) matches.push(route);
        }
      }
    }

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error searching routes', error: error.message });
  }
};
// --- END OF NEW FUNCTION ---

// Delete a route
export const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const deletedRoute = await Route.findByIdAndDelete(routeId);
    if (!deletedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.status(200).json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting route', error: error.message });
  }
};
