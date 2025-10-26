import express from "express";

const app = express();

// Middleware
import cors from "cors";
import morgan from "morgan";
app.use(cors());
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
import paymentRouter from "./routes/paymentRouter.js";
import parkingRouter from "./routes/parkingRoutes.js";
// app.use("/api/admins", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/parcels", parcelRouter);
app.use("/api/routes", routeRouter);
app.use("/api/rides", rideRouter);
app.use("/api/alerts", alertRouter);
app.use("/api/trips", tripRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/parking", parkingRouter);

export default app;
