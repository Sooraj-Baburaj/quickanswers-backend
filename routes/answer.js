import express from "express";
import isAuthorized from "../middlewares/isAuthorized.js";
import {
  generateAnswer,
  getAnswer,
  listOtherAnswers,
  searchAnswer,
} from "../controllers/answer.js";
import isGuestOrUser from "../middlewares/isGuestOrUser.js";

const router = express.Router();

router.post("/generate", isAuthorized, generateAnswer);
router.post("/search", searchAnswer);
router.get("/get/:questionId", isGuestOrUser, getAnswer);
router.get("/list-others/:questionId", isGuestOrUser, listOtherAnswers);

export default router;
