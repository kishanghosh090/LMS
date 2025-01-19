import express from "express";
import {
  createUserAccount,
  login,
  logout,
  getCurrentUserProfile,
  updateUserProfile,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { upload } from "../utils/multer.js";
import { validateSignUp } from "../middleware/validation.middleware.js";

const router = express.Router();

// Auth Routes
router.post("/signup", validateSignUp, createUserAccount);
router.post("/signin", login);
router.get("/signout", logout);
router.get("/", getCurrentUserProfile);

// Profile Routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch(
  "/profile",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

export default router;
