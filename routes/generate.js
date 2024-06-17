import express from "express";
import { generateBlog } from "../controllers/generate.js";

const router = express.Router();

router.post("/create", generateBlog);

export default router;
