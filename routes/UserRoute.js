import express from "express";
import {
  getAllUsers,
  deleteUser,
  // getAllUsersForChat,
  // getBannedUsers,
  // addUser,
  // updateUser,
  // deleteUser,
  // toggleBanUser,
} from "../controllers/user.contoller.js";
import { createCredentials } from "../controllers/LoginCredentialController.js";

const router = express.Router();

// GET all users
router.get("/user", getAllUsers);

// GET banned users
// router.get("/u/banned", getBannedUsers);

// ADD user
router.post("/register", createCredentials);

// UPDATE user
// router.put("/u/:id", updateUser);

// DELETE user
router.delete("/admin/users", deleteUser);

// BAN / UNBAN user
// router.put("/u/ban/:id", toggleBanUser);

export default router;
