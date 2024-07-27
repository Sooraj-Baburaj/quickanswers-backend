import express from "express";
import {
  registerUser,
  deleteUser,
  forgotPassword,
  listUsers,
  resetPassword,
  userAuth,
  createGuestUser,
} from "../controllers/users.js";
import isAuthorized from "../middlewares/isAuthorized.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", userAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/create-guest", createGuestUser);

//admin
router.get("/list", isAuthorized, listUsers);
router.delete("/:id", isAuthorized, deleteUser);

export default router;
