import Parking from "../models/parking.js";

// @desc    Fetch all parking lots
// @route   GET /api/parking
// @access  Public
export const getAllParkingLots = async (req, res) => {
  try {
    // Find all documents in the 'parkings' collection and sort by name
    const parkingLots = await Parking.find({}).sort({ name: 1 });
    res.status(200).json(parkingLots);
  } catch (error) {
    console.error("Error fetching parking lots:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching parking data." });
  }
};
