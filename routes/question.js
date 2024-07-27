import express from "express";
import { createQuestion, searchQuestions } from "../controllers/question.js";
import isAuthorized from "../middlewares/isAuthorized.js";
import isGuestOrUser from "../middlewares/isGuestOrUser.js";

const router = express.Router();

router.post("/create", isAuthorized, createQuestion);
router.post("/search", isGuestOrUser, searchQuestions);

export default router;
