import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getDoctorProfile,
  getCurrentDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorDashboardStats,
  updateAppointmentStatus,
  getAllDoctors,
  getConsultationRecords,
  createConsultationSummary,
  createPrescription,
  getDoctorTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  blockTimeSlot,
  getDoctorReviews,
  respondToReview
} from "../controllers/doctorController.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctors); // Get all doctors for search/listing
router.get("/:doctorId", getDoctorProfile); // Get specific doctor profile

// Protected routes (require authentication)
router.use(authGuard);

// Current doctor routes
router.get("/me/profile", getCurrentDoctorProfile);
router.put("/me/profile", updateDoctorProfile);
router.get("/me/appointments", getDoctorAppointments);
router.get("/me/dashboard/stats", getDoctorDashboardStats);
router.put("/me/appointments/:appointmentId/status", updateAppointmentStatus);
router.get("/me/consultation-records", getConsultationRecords);
router.post("/me/consultation-summaries", createConsultationSummary);
router.post("/me/prescriptions", createPrescription);

// Time slot management routes
router.get("/me/time-slots", getDoctorTimeSlots);
router.post("/me/time-slots", createTimeSlot);
router.put("/me/time-slots/:slotId", updateTimeSlot);
router.delete("/me/time-slots/:slotId", deleteTimeSlot);
router.post("/me/time-slots/block", blockTimeSlot);

// Review routes
router.get("/me/reviews", getDoctorReviews);
router.post("/me/reviews/:reviewId/respond", respondToReview);

export default router;
