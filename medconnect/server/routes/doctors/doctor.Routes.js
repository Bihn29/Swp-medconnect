import express from "express";
import { authGuard } from "../../middleware/auth.js";
import { uploadConsultation } from "../../middleware/upload.js";
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
  createConsultationAdvice,
  createPrescription,
  getDoctorTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  blockTimeSlot,
  getDoctorReviews,
  getPublicDoctorReviews,
  createDoctorReview,
  respondToReview,
  getDoctorAvailableTimeSlots,
  createTestTimeSlots,
  getDoctorClinics,
  getSearchDoctors,
  getSearchSpecializations,
  getSearchClinics,
  uploadConsultationFile
} from "../../controllers/doctorController.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctors); // Get all doctors for search/listing
router.get("/search", getSearchDoctors); // Search doctors with filters
router.get("/specializations/search", getSearchSpecializations); // Search specializations
router.get("/clinics/search", getSearchClinics); // Search clinics
router.get("/:doctorId", getDoctorProfile); // Get specific doctor profile
router.get("/:doctorId/time-slots", getDoctorAvailableTimeSlots); // Get available time slots for a doctor
router.get("/:doctorId/clinics", getDoctorClinics); // Get doctor clinics
router.get("/:doctorId/reviews", getPublicDoctorReviews); // Get public doctor reviews
router.post("/:doctorId/reviews", createDoctorReview); // Create a new review for a doctor
router.post("/:doctorId/create-test-slots", createTestTimeSlots); // Create test time slots for a doctor

// Protected routes (require authentication)
router.use(authGuard);

// Current doctor routes (must come before /:doctorId routes)
router.get("/me", getCurrentDoctorProfile); // Get basic doctor info
router.get("/me/profile", getCurrentDoctorProfile);
router.put("/me/profile", updateDoctorProfile);
router.get("/me/appointments", getDoctorAppointments);
router.get("/me/dashboard/stats", getDoctorDashboardStats);
router.put("/me/appointments/:appointmentId/status", updateAppointmentStatus);
router.get("/me/consultation-records", getConsultationRecords);
router.post("/me/consultation-summaries", createConsultationSummary);
router.post("/me/consultation-advice", createConsultationAdvice);
router.post("/me/prescriptions", createPrescription);
router.post("/me/upload-consultation-file", uploadConsultation.single('file'), uploadConsultationFile);

// Time slot management routes
router.get("/me/time-slots", getDoctorTimeSlots);
router.post("/me/time-slots", createTimeSlot);
router.put("/me/time-slots/:slotId", updateTimeSlot);
router.delete("/me/time-slots/:slotId", deleteTimeSlot);
router.post("/me/time-slots/block", blockTimeSlot);

// Review routes
router.get("/me/reviews", getDoctorReviews);
router.post("/me/reviews/:reviewId/respond", respondToReview);

// Public doctor profile routes (must come after /me routes)
router.get("/:doctorId", getDoctorProfile); // Get specific doctor profile
router.get("/:doctorId/time-slots", getDoctorAvailableTimeSlots); // Get available time slots for a doctor
router.post("/:doctorId/create-test-slots", createTestTimeSlots); // Create test time slots for a doctor

export default router;
