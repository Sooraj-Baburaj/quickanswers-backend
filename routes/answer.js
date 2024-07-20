import express from "express";
import isAuthorized from "../middlewares/auth.js";
import { generateAnswer, getAnswer } from "../controllers/answer.js";

const router = express.Router();

router.get("/:questionId", isAuthorized, getAnswer);
router.post("/generate", isAuthorized, generateAnswer);

export default router;
