import express from "express";

const app = express();

// Middleware
import cors from "cors";
import morgan from "morgan";
app.use(cors({
  origin: "http://localhost:5173", // Sirf tere client ko allow kar
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Saare methods allow kar
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // to see all requests in the console

// Routes
// import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import parcelRouter from "./routes/parcelRoutes.js";
import routeRouter from "./routes/routeRoutes.js";
import rideRouter from "./routes/rideRoutes.js";
import alertRouter from "./routes/alertRoutes.js";
import tripRouter from "./routes/tripRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import parkingRouter from "./routes/parkingRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import locationRouter from "./routes/locationRoutes.js"; // <-- 1. IMPORT KAR
// app.use("/api/admins", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/parcels", parcelRouter);
app.use("/api/routes", routeRouter);
app.use("/api/rides", rideRouter);
app.use("/api/alerts", alertRouter);
app.use("/api/trips", tripRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/parking", parkingRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/locations", locationRouter); // <-- 2. ADD KAR

export default app;
