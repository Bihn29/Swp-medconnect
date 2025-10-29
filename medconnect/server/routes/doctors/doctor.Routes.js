import express from "express";
import { authGuard } from "../../middleware/auth.js";
import { uploadConsultation } from "../../middleware/upload.js";
import {
  getDoctorProfile,
  getCurrentDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorAppointmentDetail,
  getDoctorDashboardStats,
  updateAppointmentStatus,
  getAllDoctors,
  getConsultationRecords,
  createConsultationSummary,
  createConsultationAdvice,
  getDoctorConsultationSummaries,
  getDoctorConsultationAdvice,
  createPrescription,
  getDoctorReviews,
  getPublicDoctorReviews,
  createDoctorReview,
  respondToReview,
  getDoctorClinics,
  debugAuth,
  getDoctorTimeSlots,
  autoGenerateTimeSlots,
  getDoctorScheduleRules,
  updateDoctorScheduleRules,
  createTestTimeSlots,
  getSearchDoctors,
  getSearchSpecializations,
  getSearchClinics,
  uploadConsultationFile
} from "../../controllers/doctorController.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctors); // Get all doctors for search/listing

// Public doctor routes
router.get("/search", getSearchDoctors); // Search doctors with filters
router.get("/specializations/search", getSearchSpecializations); // Search specializations
router.get("/clinics/search", getSearchClinics); // Search clinics
router.get("/:doctorId", getDoctorProfile); // Get specific doctor profile
router.get("/:doctorId/clinics", getDoctorClinics); // Get doctor clinics
router.get("/:doctorId/reviews", getPublicDoctorReviews); // Get public doctor reviews
router.post("/:doctorId/reviews", createDoctorReview); // Create a new review for a doctor
router.post("/:doctorId/create-test-slots", createTestTimeSlots); // Create test time slots for a doctor

// Protected routes (require authentication)
router.use(authGuard);

// Current doctor routes
router.get("/me", getCurrentDoctorProfile); // Get basic doctor info
router.get("/me/profile", getCurrentDoctorProfile);
router.put("/me/profile", updateDoctorProfile);
router.get("/me/appointments", getDoctorAppointments);
router.get("/me/appointments/:appointmentId", getDoctorAppointmentDetail);
router.get("/me/dashboard/stats", getDoctorDashboardStats);
router.put("/me/appointments/:appointmentId/status", updateAppointmentStatus);
router.get("/me/consultation-records", getConsultationRecords);
router.get("/me/consultation-summaries", getDoctorConsultationSummaries);
router.get("/me/consultation-advice", getDoctorConsultationAdvice);
router.post("/me/consultation-summaries", createConsultationSummary);
router.post("/me/consultation-advice", createConsultationAdvice);
router.post("/me/prescriptions", createPrescription);
router.post("/me/upload-consultation-file", uploadConsultation.single('file'), uploadConsultationFile);

// Time slot routes
router.get("/me/time-slots", getDoctorTimeSlots);
router.post("/me/time-slots/auto-generate", autoGenerateTimeSlots);

// Schedule rules routes
router.get("/me/schedule-rules", getDoctorScheduleRules);
router.put("/me/schedule-rules", updateDoctorScheduleRules);

// Debug route
router.get("/me/debug-auth", debugAuth);

// Review routes
router.get("/me/reviews", getDoctorReviews);
router.post("/me/reviews/:reviewId/respond", respondToReview);

export default router;
