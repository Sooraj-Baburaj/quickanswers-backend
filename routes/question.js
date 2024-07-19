import express from "express";
import { createQuestion } from "../controllers/question.js";
import isAuthorized from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthorized, createQuestion);

export default router;
