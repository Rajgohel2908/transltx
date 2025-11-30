import Route from "../models/route.js";
import Booking from "../models/Booking.js";

// @desc    Create a new route
// @route   POST /api/routes
// @access  Admin
export const createRoute = async (req, res) => {
  try {
    const newRoute = new Route(req.body);
    const savedRoute = await newRoute.save();
    res.status(201).json({ route: savedRoute });
  } catch (error) {
    console.error("Error creating route:", error);
    res.status(500).json({ message: "Server error while creating route.", error: error.message });
  }
};

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({}).sort({ createdAt: -1 });
    res.status(200).json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Server error while fetching routes." });
  }
};

// @desc    Update a route
// @route   PUT /api/routes/:routeId
// @access  Admin
export const updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const updatedRoute = await Route.findByIdAndUpdate(routeId, req.body, { new: true });

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found." });
    }

    res.status(200).json({ route: updatedRoute });
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({ message: "Server error while updating route." });
  }
};

// @desc    Delete a route
// @route   DELETE /api/routes/:routeId
// @access  Admin
export const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const deletedRoute = await Route.findByIdAndDelete(routeId);

    if (!deletedRoute) {
      return res.status(404).json({ message: "Route not found." });
    }

    res.status(200).json({ message: "Route deleted successfully." });
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({ message: "Server error while deleting route." });
  }
};

// @desc    Search routes
// @route   GET /api/routes/search
// @access  Public
export const searchRoutes = async (req, res) => {
  try {
    const { type, from, to, date } = req.query;

    let query = {};

    if (type) {
      query.type = type.toLowerCase();
    }

    if (from) {
      // Case-insensitive search
      query.startPoint = { $regex: new RegExp(from, "i") };
    }

    if (to) {
      query.endPoint = { $regex: new RegExp(to, "i") };
    }

    const routes = await Route.find(query);

    // Filter by date in memory to handle complex schedule types
    let filteredRoutes = routes;
    if (date) {
      const searchDay = new Date(date).toLocaleString('en-us', { weekday: 'long' });
      filteredRoutes = routes.filter(route => {
        // Daily runs everyday
        if (route.scheduleType === 'daily') return true;
        // Weekly check days array
        if (route.scheduleType === 'weekly' && route.daysOfWeek && route.daysOfWeek.includes(searchDay)) return true;
        // Specific date check
        if (route.scheduleType === 'specific_date' && route.specificDate) {
          const routeDate = new Date(route.specificDate).toISOString().split('T')[0];
          return routeDate === date;
        }
        return false;
      });
    }

    // Calculate available seats for each filtered route
    const resultsWithAvailability = await Promise.all(filteredRoutes.map(async (route) => {
      let totalCapacity = 0;

      // Calculate Total Capacity
      if (route.totalSeats) {
        if (typeof route.totalSeats === 'number') {
          totalCapacity = route.totalSeats;
        } else if (typeof route.totalSeats === 'object') {
          // Sum values of the object (assuming they are numbers)
          totalCapacity = Object.values(route.totalSeats).reduce((sum, val) => sum + (Number(val) || 0), 0);
        }
      }

      // Count Bookings
      let bookingsCount = 0;
      if (date) {
        const searchDateStart = new Date(date);
        searchDateStart.setHours(0, 0, 0, 0);
        const searchDateEnd = new Date(date);
        searchDateEnd.setHours(23, 59, 59, 999);

        bookingsCount = await Booking.countDocuments({
          routeId: route._id,
          departureDateTime: { $gte: searchDateStart, $lte: searchDateEnd },
          bookingStatus: { $in: ['Confirmed', 'Pending'] }
        });
      }

      const availableSeats = Math.max(0, totalCapacity - bookingsCount);

      return {
        ...route.toObject(),
        availableSeats
      };
    }));

    res.status(200).json(resultsWithAvailability);
  } catch (error) {
    console.error("Error searching routes:", error);
    res.status(500).json({ message: "Server error while searching routes." });
  }
};