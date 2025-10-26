import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((error) => {
    console.error("DB connection error:", error);
  });

import app from "./index.js";

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
