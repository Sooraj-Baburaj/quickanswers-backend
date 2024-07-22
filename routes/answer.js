import express from "express";
import isAuthorized from "../middlewares/auth.js";
import {
  generateAnswer,
  getAnswer,
  listOtherAnswers,
} from "../controllers/answer.js";

const router = express.Router();

router.post("/generate", isAuthorized, generateAnswer);
router.get("/get/:questionId", isAuthorized, getAnswer);
router.get("/list-others/:questionId", isAuthorized, listOtherAnswers);

export default router;
