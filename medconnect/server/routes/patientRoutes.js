import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getCurrentPatientProfile,
  updatePatientProfile,
  getSpecializations,
  getDoctorsBySpecialization,
  getDoctorTimeSlots,
  bookAppointment,
  getPatientAppointments,
  cancelPatientAppointment,
} from "../controllers/patientController.js";

const router = express.Router();

// Get current patient profile
router.get("/me/profile", authGuard, getCurrentPatientProfile);

// Update patient profile
router.put("/me/profile", authGuard, updatePatientProfile);

// Get all specializations for appointment booking
router.get("/specializations", getSpecializations);

// Get doctors by specialization
router.get(
  "/specializations/:specializationId/doctors",
  getDoctorsBySpecialization
);

// Get available time slots for a doctor
router.get("/doctors/:doctorId/time-slots", getDoctorTimeSlots);

// Book an appointment
router.post("/appointments", authGuard, bookAppointment);

// Get patient's appointments
router.get("/me/appointments", authGuard, getPatientAppointments);

// Cancel patient appointment
router.put(
  "/me/appointments/:appointmentId/cancel",
  authGuard,
  cancelPatientAppointment
);

export default router;
