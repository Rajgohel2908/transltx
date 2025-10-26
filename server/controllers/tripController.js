import Trip from "../models/trip.js";

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Admin
export const createTrip = async (req, res) => {
  try {
    const { name, description, duration, price, image, features } = req.body;

    // More robust validation: Check for all required fields, allowing 'features' to be an empty array.
    if (!name || !description || !duration || !price || !image || !Array.isArray(features)) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields, including name, description, duration, price, image, and features." });
    }

    const newTrip = new Trip({
      name,
      description,
      duration,
      price,
      image,
      features,
    });

    const savedTrip = await newTrip.save();
    // Return the saved trip object directly for optimistic UI updates
    res.status(201).json({ trip: savedTrip });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Server error while creating trip." });
  }
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({}).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Server error while fetching trips." });
  }
};


export const getTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ message: "Server error while fetching trip." });
  }
};

// @desc    Update an existing trip
// @route   PUT /api/trips/:id
// @access  Admin
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, image, features } = req.body;

    if (!name || !description || !duration || !price || !image) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields for update." });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { name, description, duration, price, image, features },
      { new: true, runValidators: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.status(200).json({ trip: updatedTrip });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Server error while updating trip." });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Admin
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByIdAndDelete(id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    res.status(200).json({ message: "Trip deleted permanently." });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: "Server error while deleting trip." });
  }
};
