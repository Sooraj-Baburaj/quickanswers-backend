import express from "express";
import { deleteUser, listUsers } from "../../controllers/admin/users.js";
import isAuthorized from "../../middlewares/isAuthorized.js";

const router = express.Router();

router.get("/list", isAuthorized, listUsers);
router.delete("/:id", isAuthorized, deleteUser);

export default router;
