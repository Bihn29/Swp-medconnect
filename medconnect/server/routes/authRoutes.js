import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  loginPassword,
  googleLogin,
  createSession,
  getCurrentUser,
  logout,
  register,
  googleRegister
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/login-password", loginPassword);
router.post("/google-login", googleLogin);
router.post("/register", register);
router.post("/google-register", googleRegister);
router.post("/session", createSession);
router.get("/me", authGuard, getCurrentUser);
router.post("/logout", logout);

router.get("/__ping", (_req, res) => res.json({ ok: true }));


export default router;
