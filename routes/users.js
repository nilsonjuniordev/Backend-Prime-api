import express from "express";
import { addUser, deleteUser, getUsers, updateUser } from "../controllers/user.js";

const router = express.Router();

router.route("/")
  .get(getUsers)
  .post(addUser);

router.route("/:id")
  .put(updateUser)
  .delete(deleteUser);

export default router;
