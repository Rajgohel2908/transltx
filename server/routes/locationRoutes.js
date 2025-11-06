// ... imports
import { verifyToken, isAdmin } from "../middlewares/userMiddleware.js"; 

const router = express.Router();

// GET /api/locations?search=ahm
router.get("/", verifyToken, getLocations); // <-- YEH HAI PROBLEM

// POST /api/locations
router.post("/", verifyToken, isAdmin, addLocation);

export default router;