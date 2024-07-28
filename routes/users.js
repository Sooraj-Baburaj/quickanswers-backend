import express from "express";
import {
  registerUser,
  forgotPassword,
  resetPassword,
  userAuth,
  createGuestUser,
  googleLogin,
} from "../controllers/users.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", userAuth);
router.post("/google-auth", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/create-guest", createGuestUser);

export default router;
