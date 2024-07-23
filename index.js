import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

import "./typesense/questionsCollection.js";
import "./typesense/answersCollection.js";

import generateRoutes from "./routes/generate.js";
import userRoutes from "./routes/users.js";
import questionRoutes from "./routes/question.js";
import answerRoutes from "./routes/answer.js";

app.use("/api/generate", generateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`server running on Port:${PORT}`));
