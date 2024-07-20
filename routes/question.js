import express from "express";
import { createQuestion, searchQuestions } from "../controllers/question.js";
import isAuthorized from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthorized, createQuestion);
router.post("/search", isAuthorized, searchQuestions);

export default router;
