import Parking from "../models/parking.js";

// @desc    Fetch all parking lots
// @route   GET /api/parking
// @access  Public
export const getAllParkingLots = async (req, res) => {
  try {
    const parkingLots = await Parking.find({}).sort({ name: 1 });
    res.status(200).json(parkingLots);
  } catch (error) {
    console.error("Error fetching parking lots:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching parking data." });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Create a new parking lot
// @route   POST /api/parking
// @access  Admin
export const createParkingLot = async (req, res) => {
  try {
    const parkingData = { ...req.body };
    if (req.user) {
      parkingData.partner = req.user._id;
    }
    const newParking = new Parking(parkingData);
    const savedParking = await newParking.save();
    res.status(201).json(savedParking);
  } catch (error) {
    console.error("Error creating parking lot:", error);
    res.status(500).json({ message: "Server error while creating parking lot.", error: error.message });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Update a parking lot
// @route   PUT /api/parking/:id
// @access  Admin
export const updateParkingLot = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedParking = await Parking.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedParking) {
      return res.status(404).json({ message: "Parking lot not found." });
    }

    res.status(200).json(updatedParking);
  } catch (error) {
    console.error("Error updating parking lot:", error);
    res.status(500).json({ message: "Server error while updating parking lot.", error: error.message });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Delete a parking lot
// @route   DELETE /api/parking/:id
// @access  Admin
export const deleteParkingLot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedParking = await Parking.findByIdAndDelete(id);

    if (!deletedParking) {
      return res.status(404).json({ message: "Parking lot not found." });
    }

    res.status(200).json({ message: "Parking lot deleted successfully." });
  } catch (error) {
    console.error("Error deleting parking lot:", error);
    res.status(500).json({ message: "Server error while deleting parking lot." });
  }
};