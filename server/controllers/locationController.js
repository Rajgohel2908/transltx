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

    // --- YEH HAI TERA "Starts-With" LOGIC ( ^ ) ---
    const regex = new RegExp("^" + searchQuery, "i");

    let queryFilter = { name: regex };

    if (requestedType) {
      let typeToSearch = "city"; // Default
      if (requestedType.toLowerCase() === "train") {
        typeToSearch = "train_station";
      } else if (requestedType.toLowerCase() === "air") {
        typeToSearch = "airport";
      }
      queryFilter.type = typeToSearch;
    }

    const locations = await Location.find(queryFilter)
      .limit(15)
      // --- MODIFICATION 1: 'name' ke saath 'state' bhi 'select' kar ---
      .select("name state"); 

    // --- MODIFICATION 2: 'String array' ki jagah 'Object array' bhej ---
    const cities = locations.map((loc) => ({ 
      name: loc.name, 
      state: loc.state 
    }));

    res.status(200).json(cities); // Ab response hoga [{name: "Surat", state: "Gujarat"}, ...]
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ message: "Server error while fetching locations." });
  }
};

// ... (baki 'addLocation' function same rahega)
// @desc    Add new cities to a state (or create a new state)
// @route   POST /api/locations
export const addLocation = async (req, res) => {
  try {
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
    
    const operations = citiesArray.map(cityName => ({
      updateOne: {
        filter: { name: cityName, state: state },
        update: { $set: { name: cityName, state: state, type: type } }, 
        upsert: true 
      }
    }));
    
    const result = await Location.bulkWrite(operations);

    res.status(201).json({
      message: `Successfully processed ${citiesArray.length} cities for ${state}.`,
      result: result,
    });
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ message: "Server error while adding location." });
  }
};