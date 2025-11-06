import Location from "../models/location.js";

// @desc    Get location suggestions based on search query
// @route   GET /api/locations?search=...&type=...
export const getLocations = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const requestedType = req.query.type; // e.g., "bus", "train", "air"

    if (!searchQuery) {
      return res.status(200).json([]);
    }

    const regex = new RegExp("^" + searchQuery, "i");

    // --- YEH HAI NAYA LOGIC ---
    let queryFilter = { name: regex }; // Default search query

    if (requestedType) {
      // Agar 'type' (bus/train/air) bheja hai, toh usko map karo
      let typeToSearch = "city"; // Default
      if (requestedType.toLowerCase() === "train") {
        typeToSearch = "station";
      } else if (requestedType.toLowerCase() === "air") {
        typeToSearch = "airport";
      }
      queryFilter.type = typeToSearch; // Filter me 'type' add kar
    }
    // Agar 'type' nahi bheja (jaise Admin form se), toh woh sab search karega.
    // --- NAYA LOGIC KHATAM ---

    const locations = await Location.find(queryFilter) // Naya filter use kar
      .limit(15)
      .select("name");

    const cities = locations.map((loc) => loc.name);

    res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Server error while fetching locations." });
  }
};

// @desc    Add new cities to a state (or create a new state)
// @route   POST /api/locations
export const addLocation = async (req, res) => {
  try {
    // --- UPDATE: 'type' ko body se nikaal ---
    const { state, cities, type } = req.body; 

    if (!state || !cities || !type) {
      return res
        .status(400)
        .json({ message: "State, cities, and type are required." });
    }

    const citiesArray = Array.isArray(cities)
      ? cities
      : cities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

    if (citiesArray.length === 0) {
      return res.status(400).json({ message: "No valid cities provided." });
    }
    
    // --- UPDATE: 'type' ko database me save kar ---
    const operations = citiesArray.map(cityName => ({
      updateOne: {
        filter: { name: cityName, state: state }, // Is city/state pair ko dhundo
        update: { $set: { name: cityName, state: state, type: type } }, // 'type' ko set kar
        upsert: true 
      }
    }));
    
    const result = await Location.bulkWrite(operations);
    // --- UPDATE KHATAM ---

    res.status(201).json({
      message: `Successfully processed ${citiesArray.length} cities for ${state}.`,
      result: result,
    });
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ message: "Server error while adding location." });
  }
};