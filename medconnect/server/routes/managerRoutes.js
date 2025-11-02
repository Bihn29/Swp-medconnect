import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getAllDoctorsForManager,
  getDoctorTimeSlotsForManager,
  createAppointmentByManager,
} from "../controllers/managerController.js";

const router = express.Router();

// All manager routes require authentication and manager role check
// Manager role check should be done in middleware if needed

router.get("/doctors", authGuard, getAllDoctorsForManager);
router.get(
  "/doctors/:doctorId/time-slots",
  authGuard,
  getDoctorTimeSlotsForManager
);
router.post("/appointments", authGuard, createAppointmentByManager);

export default router;
