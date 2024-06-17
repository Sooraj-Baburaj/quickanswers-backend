import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

import generateRoutes from "./routes/generate.js";

app.use("/api/generate", generateRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`server running on Port:${PORT}`));
