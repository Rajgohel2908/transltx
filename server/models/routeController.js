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
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      price: req.body.price,
    };

    // Add type-specific fields
    if (type === 'air') {
      routeData.flightNumber = req.body.flightNumber;
      routeData.airline = req.body.airline;
      routeData.scheduleType = req.body.scheduleType;
      routeData.specificDate = req.body.specificDate;
      routeData.startTime = req.body.startTime;
    } else { // bus or train
      routeData.scheduleType = req.body.scheduleType;
      routeData.stops = req.body.stops;
      if (req.body.scheduleType === 'daily') {
        routeData.startTime = req.body.startTime;
        routeData.endTime = req.body.endTime;
        routeData.frequency = req.body.frequency;
      } else if (req.body.scheduleType === 'weekly') {
        routeData.daysOfWeek = req.body.daysOfWeek;
        routeData.startTime = req.body.startTime;
      } else if (req.body.scheduleType === 'specific_date') {
        routeData.specificDate = req.body.specificDate;
        routeData.startTime = req.body.startTime;
      }
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
    const { id } = req.params; // Assuming you pass the route's DB _id in the URL
    const { type } = req.body;

    const updateData = {
      id: req.body.id,
      name: req.body.name,
      type: req.body.type,
      color: req.body.color,
      startPoint: req.body.startPoint,
      endPoint: req.body.endPoint,
      price: req.body.price,
    };

    if (type === 'air') {
      updateData.flightNumber = req.body.flightNumber;
      updateData.airline = req.body.airline;
      updateData.scheduleType = req.body.scheduleType;
      updateData.specificDate = req.body.specificDate;
      updateData.startTime = req.body.startTime;
      // Unset fields that don't apply to 'air' routes
      updateData.$unset = {
        endTime: 1,
        frequency: 1,
        stops: 1,
        daysOfWeek: 1,
      };
    } else { // bus or train
      updateData.scheduleType = req.body.scheduleType;
      updateData.stops = req.body.stops;
      // Unset fields that don't apply to 'bus'/'train' routes
      updateData.$unset = {
        flightNumber: 1,
        airline: 1,
        specificDate: req.body.scheduleType !== 'specific_date' ? 1 : undefined,
        daysOfWeek: req.body.scheduleType !== 'weekly' ? 1 : undefined,
        endTime: req.body.scheduleType !== 'daily' ? 1 : undefined,
        frequency: req.body.scheduleType !== 'daily' ? 1 : undefined,
      };

      if (req.body.scheduleType === 'daily') {
        updateData.startTime = req.body.startTime;
        updateData.endTime = req.body.endTime;
        updateData.frequency = req.body.frequency;
        delete updateData.$unset.endTime;
        delete updateData.$unset.frequency;
      } else if (req.body.scheduleType === 'weekly') {
        updateData.daysOfWeek = req.body.daysOfWeek;
        updateData.startTime = req.body.startTime;
        delete updateData.$unset.daysOfWeek;
      } else if (req.body.scheduleType === 'specific_date') {
        updateData.specificDate = req.body.specificDate;
        updateData.startTime = req.body.startTime;
        delete updateData.$unset.specificDate;
      }

      // Clean up unset object
      if (Object.values(updateData.$unset).every(v => v === undefined)) {
        delete updateData.$unset;
      }
    }

    const updatedRoute = await Route.findByIdAndUpdate(id, updateData, { new: true });

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

// Delete a route
export const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoute = await Route.findByIdAndDelete(id);
    if (!deletedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.status(200).json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting route', error: error.message });
  }
};
