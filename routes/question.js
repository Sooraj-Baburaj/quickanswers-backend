import express from "express";
import {
  findExistingQuestion,
  getQuestion,
  putQuestion,
  searchQuestions,
} from "../controllers/question.js";
import isGuestOrUser from "../middlewares/isGuestOrUser.js";

const router = express.Router();

router.get("/get/:id", isGuestOrUser, getQuestion);
router.post("/find-existing-question", isGuestOrUser, findExistingQuestion);
router.post("/upsert", isGuestOrUser, putQuestion);
router.post("/search", isGuestOrUser, searchQuestions);

export default router;
