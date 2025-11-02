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
  deleteTimeSlot,
  blockSingleSlot,
  blockSlotsByDateRange,
  unblockSlotsByDateRange,
  getDoctorScheduleRules,
  updateDoctorScheduleRules,
  createTestTimeSlots,
  getSearchDoctors,
  getSearchSpecializations,
  getSearchClinics,
  uploadConsultationFile,
  createAppointmentByDoctor,
} from "../../controllers/doctorController.js";
import { createLeaveRequest } from "../../controllers/leaveRequestController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllDoctors); // Get all doctors for search/listing
router.get("/search", getSearchDoctors); // Search doctors with filters
router.get("/specializations/search", getSearchSpecializations); // Search specializations
router.get("/clinics/search", getSearchClinics); // Search clinics

// Protected /me routes (require authentication)
// CRITICAL: /me/* routes MUST be defined BEFORE /:doctorId routes
// Express matches routes in order, so literal /me will match before parameterized /:doctorId
router.get("/me", authGuard, getCurrentDoctorProfile); // Get basic doctor info
router.get("/me/profile", authGuard, getCurrentDoctorProfile);
router.put("/me/profile", authGuard, updateDoctorProfile);
router.get("/me/appointments", authGuard, getDoctorAppointments);
router.get(
  "/me/appointments/:appointmentId",
  authGuard,
  getDoctorAppointmentDetail
);
router.post("/me/appointments/create", authGuard, createAppointmentByDoctor);
router.get("/me/dashboard/stats", authGuard, getDoctorDashboardStats);
router.put(
  "/me/appointments/:appointmentId/status",
  authGuard,
  (req, res, next) => {
    console.log("==========================================");
    console.log("📞 PUT /me/appointments/:appointmentId/status route hit");
    console.log("📞 Params:", req.params);
    console.log("📞 Body:", req.body);
    console.log("📞 User:", req.user?.email);
    next();
  },
  updateAppointmentStatus
);
router.get("/me/consultation-records", authGuard, getConsultationRecords);
router.get(
  "/me/consultation-summaries",
  authGuard,
  getDoctorConsultationSummaries
);
router.get("/me/consultation-advice", authGuard, getDoctorConsultationAdvice);
router.post("/me/consultation-summaries", authGuard, createConsultationSummary);
router.post("/me/consultation-advice", authGuard, createConsultationAdvice);
router.post("/me/prescriptions", authGuard, createPrescription);
router.post(
  "/me/upload-consultation-file",
  authGuard,
  uploadConsultation.single("file"),
  uploadConsultationFile
);
router.get("/me/time-slots", authGuard, getDoctorTimeSlots);
router.post("/me/time-slots/auto-generate", authGuard, autoGenerateTimeSlots);
router.delete("/me/time-slots/:slotId", authGuard, deleteTimeSlot);
router.post("/me/leave-requests", authGuard, createLeaveRequest);
// Note: blockSingleSlot, blockSlotsByDateRange, unblockSlotsByDateRange removed - doctors now use leave requests
router.get("/me/schedule-rules", authGuard, getDoctorScheduleRules);
router.put("/me/schedule-rules", authGuard, updateDoctorScheduleRules);
router.get("/me/debug-auth", authGuard, debugAuth);
router.get("/me/reviews", authGuard, getDoctorReviews);
router.post("/me/reviews/:reviewId/respond", authGuard, respondToReview);

// Public routes with dynamic params (no authentication required)
// These must be defined AFTER /me routes so Express matches /me before /:doctorId
router.get("/:doctorId", getDoctorProfile); // Get specific doctor profile
router.get("/:doctorId/clinics", getDoctorClinics); // Get doctor clinics
router.get("/:doctorId/reviews", getPublicDoctorReviews); // Get public doctor reviews
router.post("/:doctorId/reviews", createDoctorReview); // Create a new review for a doctor
router.post("/:doctorId/create-test-slots", createTestTimeSlots); // Create test time slots for a doctor

export default router;
