import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  loginPassword,
  googleLogin,
  createSession,
  getCurrentUser,
  logout,
  register,
  registerDoctor,
  googleRegister,
  /* === ADD: Forgot/Reset === */
  forgotPassword,
  verifyPasswordOtp,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/login-password", loginPassword);
router.post("/google-login", googleLogin);
router.post("/register", register);
router.post("/register-doctor", registerDoctor);
router.post("/google-register", googleRegister);
router.post("/session", createSession);
router.get("/me", authGuard, getCurrentUser);
router.post("/logout", logout);

// === Forgot/Reset password (khớp client/src/services/userService.js) ===
router.post("/forgot", forgotPassword);        // requestPasswordOtp(email)
router.post("/verify-otp", verifyPasswordOtp); // verifyPasswordOtp(email, otp) -> { resetToken }
router.post("/reset", resetPassword);          // resetPasswordWithToken(token, newPassword)

export default router;
