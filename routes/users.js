import express from "express";
import {
  createUser,
  deleteUser,
  forgotPassword,
  listUsers,
  resetPassword,
  userAuth,
} from "../controllers/users.js";
import isAuthorized from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", userAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/list", isAuthorized, listUsers);
router.delete("/:id", isAuthorized, deleteUser);

export default router;
