import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getCurrentPatientProfile,
  updatePatientProfile,
} from "../controllers/patientController.js";

const router = express.Router();

// Get current patient profile
router.get("/me/profile", authGuard, getCurrentPatientProfile);

// Update patient profile
router.put("/me/profile", authGuard, updatePatientProfile);

export default router;
