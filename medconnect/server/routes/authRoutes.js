import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  loginPassword,
  googleLogin,
  createSession,
  getCurrentUser,
  logout
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/login-password", loginPassword);
router.post("/google-login", googleLogin);
router.post("/session", createSession);
router.get("/me", authGuard, getCurrentUser);
router.post("/logout", logout);

export default router;
