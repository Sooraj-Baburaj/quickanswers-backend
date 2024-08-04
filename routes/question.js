import express from "express";
import { putQuestion, searchQuestions } from "../controllers/question.js";
import isAuthorized from "../middlewares/isAuthorized.js";
import isGuestOrUser from "../middlewares/isGuestOrUser.js";

const router = express.Router();

router.post("/upsert", isAuthorized, putQuestion);
router.post("/search", isGuestOrUser, searchQuestions);

export default router;
