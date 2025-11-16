import Route from '../models/route.js';

// Create a new route
export const createRoute = async (req, res) => {
  try {
    const { type } = req.body;

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
      // --- ADDED ---
      totalSeats: req.body.totalSeats || 40,
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
    const { routeId } = req.params;
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
      // --- ADDED ---
      totalSeats: req.body.totalSeats,
    };

    if (type === 'air') {
      updateData.flightNumber = req.body.flightNumber;
      updateData.airline = req.body.airline;
    } else {
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

// ... (baaki functions same rahenge: getAllRoutes, searchRoutes, deleteRoute) ...
// searchRoutes aur deleteRoute waisa ka waisa hi rakhna, usme change nahi chahiye abhi.
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routes', error: error.message });
  }
};

export const searchRoutes = async (req, res) => {
    // ... (keep existing searchRoutes logic exactly as it was in previous file) ...
    // Just pasting the start for context, assume the rest of the logic is here
    try {
        const { from, to, date, type, class: classType } = req.query;
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
    
        const candidates = await Route.find(baseQuery);
        const matches = [];
        // ... (rest of searchRoutes logic) ...
        
        // Shortening for brevity, keep your original searchRoutes logic here
        for (const route of candidates) {
             // ... logic ...
             matches.push(route); // Placeholder
        }
        // Just ensuring this function exists in the file export
        res.status(200).json(matches); // Placeholder response
    } catch (error) {
        res.status(500).json({ message: 'Error searching routes', error: error.message });
    }
};

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