import express from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getAllDoctorsForManager,
  getDoctorTimeSlotsForManager,
  getAppointmentDetailForManager,
  createAppointmentByManager,
  generateSlotsForManager,
  deleteTimeSlotForManager,
  blockSingleSlotForManager,
  blockSlotsByDateRangeForManager,
  unblockSlotsByDateRangeForManager,
} from "../controllers/managerController.js";
import {
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../controllers/leaveRequestController.js";

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
router.post(
  "/doctors/:doctorId/time-slots/:slotId/block",
  authGuard,
  blockSingleSlotForManager
);
router.post(
  "/doctors/:doctorId/time-slots/block",
  authGuard,
  blockSlotsByDateRangeForManager
);
router.post(
  "/doctors/:doctorId/time-slots/unblock",
  authGuard,
  unblockSlotsByDateRangeForManager
);
router.get(
  "/appointments/:appointmentId",
  authGuard,
  getAppointmentDetailForManager
);
router.post("/appointments", authGuard, createAppointmentByManager);

// Leave request routes
router.get("/leave-requests", authGuard, getLeaveRequests);
router.post(
  "/leave-requests/:leaveRequestId/approve",
  authGuard,
  approveLeaveRequest
);
router.post(
  "/leave-requests/:leaveRequestId/reject",
  authGuard,
  rejectLeaveRequest
);

export default router;
