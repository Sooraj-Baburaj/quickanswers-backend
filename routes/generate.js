import express from "express";
import { generateBlog } from "../controllers/generate.js";
import isAuthorized from "../middlewares/isAuthorized.js";

const router = express.Router();

router.post("/create", isAuthorized, generateBlog);

export default router;
