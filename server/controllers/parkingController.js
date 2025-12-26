import Parking from "../models/parking.js";
import Partner from "../models/partnerModel.js";

// @desc    Fetch all parking lots (from Partner collection)
// @route   GET /api/parking
// @access  Public
export const getAllParkingLots = async (req, res) => {
  try {
    // 1. Fetch real parking lots from Partner collection
    const partners = await Partner.find({
      'partnerDetails.serviceType': { $in: ['Parking', 'parking'] },
      is_active: true, // Only active partners
      'parkingDetails.isOpen': { $ne: false } // Optionally filter out closed ones, or let frontend show 'Closed'
    }).select('parkingDetails partnerDetails _id');

    const realParkingLots = partners.map(partner => {
      const pd = partner.parkingDetails || {};
      const p = pd.pricing || {};
      return {
        _id: partner._id,
        name: pd.parkingName || partner.partnerDetails?.companyName || 'Unnamed Parking',
        location: pd.address || 'Unknown Location',
        totalSlots: pd.totalSlots || 0,
        availableSlots: pd.availableSlots || 0,
        rates: {
          car: p.fourWheeler || 0,
          bike: p.twoWheeler || 0,
          bus: p.bus || 0
        },
        isOpen: pd.isOpen !== false
      };
    });

    // 2. Add Static Demo Parking Slots (6-10 slots as requested)
    const demoParkingLots = [
      {
        _id: 'demo_1',
        name: 'Central Mall Parking',
        location: 'MG Road, City Center',
        totalSlots: 100,
        availableSlots: 45,
        rates: { car: 50, bike: 20, bus: 100 },
        isOpen: true
      },
      {
        _id: 'demo_2',
        name: 'Airport Terminal 1',
        location: 'International Airport',
        totalSlots: 500,
        availableSlots: 120,
        rates: { car: 150, bike: 50, bus: 300 },
        isOpen: true
      },
      {
        _id: 'demo_3',
        name: 'Tech Park Plaza',
        location: 'Electronic City, Phase 1',
        totalSlots: 200,
        availableSlots: 190,
        rates: { car: 40, bike: 15, bus: 80 },
        isOpen: true
      },
      {
        _id: 'demo_4',
        name: 'Railway Station West',
        location: 'Station Road',
        totalSlots: 80,
        availableSlots: 5,
        rates: { car: 30, bike: 10, bus: 60 },
        isOpen: true
      },
      {
        _id: 'demo_5',
        name: 'Downtown Market',
        location: 'Market Street',
        totalSlots: 60,
        availableSlots: 0, // Full
        rates: { car: 60, bike: 25, bus: 120 },
        isOpen: true
      },
      {
        _id: 'demo_6',
        name: 'Metro Station Parking',
        location: 'Indiranagar Metro',
        totalSlots: 120,
        availableSlots: 88,
        rates: { car: 35, bike: 15, bus: 70 },
        isOpen: true
      }
    ];

    // Combine real and demo
    const parkingLots = [...realParkingLots, ...demoParkingLots];

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