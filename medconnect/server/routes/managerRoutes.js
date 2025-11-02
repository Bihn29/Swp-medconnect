import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getAllDoctorsForManager,
  getDoctorTimeSlotsForManager,
  createAppointmentByManager,
  generateSlotsForManager,
  deleteTimeSlotForManager,
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
router.post(
  "/doctors/:doctorId/generate-slots",
  authGuard,
  generateSlotsForManager
);
router.delete(
  "/doctors/:doctorId/time-slots/:slotId",
  authGuard,
  deleteTimeSlotForManager
);
router.post("/appointments", authGuard, createAppointmentByManager);

export default router;
