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
      color: req.body.color,
      // Ensure startPoint and endPoint are objects with name, latitude, longitude
      // This assumes the client sends these as objects. If they are strings, parsing is needed.
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      price: req.body.price,
      scheduleType: req.body.scheduleType, // <-- Add this
    };

    // Add type-specific fields
    if (type === 'air') {
      routeData.flightNumber = req.body.flightNumber;
      routeData.airline = req.body.airline;
      routeData.specificDate = req.body.specificDate; // <-- Add this
      routeData.startTime = req.body.startTime; // <-- Add this
    } else { // bus or train
      routeData.startTime = req.body.startTime;
      routeData.endTime = req.body.endTime;
      routeData.frequency = req.body.frequency;
      routeData.stops = req.body.stops;
      routeData.daysOfWeek = req.body.daysOfWeek; // <-- Add this
      routeData.specificDate = req.body.specificDate; // <-- Add this
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
      color: req.body.color,
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      price: req.body.price,
      scheduleType: req.body.scheduleType, // <-- Add this
    };

    if (type === 'air') {
      updateData.flightNumber = req.body.flightNumber;
      updateData.airline = req.body.airline;
      updateData.startTime = req.body.startTime;
      updateData.specificDate = req.body.specificDate;
      // Unset fields that don't apply to 'air' routes
      updateData.$unset = {
        endTime: 1,
        frequency: 1,
        stops: 1,
        daysOfWeek: 1,
      };
    } else { // bus or train
      updateData.startTime = req.body.startTime;
      updateData.stops = req.body.stops;

      if (req.body.scheduleType === 'daily') {
        updateData.endTime = req.body.endTime;
        updateData.frequency = req.body.frequency;
      } else if (req.body.scheduleType === 'weekly') {
        updateData.daysOfWeek = req.body.daysOfWeek;
      } else if (req.body.scheduleType === 'specific_date') {
        updateData.specificDate = req.body.specificDate;
      }

      // Unset fields that don't apply to 'bus'/'train'/'car' routes
      updateData.$unset = {
        flightNumber: 1,
        airline: 1,
      };
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

    let query = {};

    if (type) {
      query.type = type.toLowerCase();
    }
    
    // Use case-insensitive regex for partial matching on start and end points
    if (from) {
      query.startPoint = { $regex: from, $options: 'i' };
    }
    if (to) {
      query.endPoint = { $regex: to, $options: 'i' };
    }

    if (date) {
      const searchDate = new Date(date);
      const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][searchDate.getUTCDay()];
      
      // Build date-related query
      query.$or = [
        // 1. Matches daily schedule
        { scheduleType: 'daily' },
        
        // 2. Matches weekly schedule on the correct day
        { scheduleType: 'weekly', daysOfWeek: dayOfWeek },
        
        // 3. Matches specific date (compare date part only)
        { 
          scheduleType: 'specific_date', 
          specificDate: {
            $gte: new Date(date).setUTCHours(0, 0, 0, 0),
            $lte: new Date(date).setUTCHours(23, 59, 59, 999)
          }
        }
      ];
    }

    const routes = await Route.find(query);
    res.status(200).json(routes);
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
