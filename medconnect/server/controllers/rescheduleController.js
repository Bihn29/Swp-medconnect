import mongoose from "mongoose";
import RescheduleRequest from "../models/rescheduleRequest.model.js";
import Appointment from "../models/appointment.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import { createAppointmentNotification } from "../services/notificationService.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Request reschedule for an appointment
 */
export async function requestReschedule(req, res) {
  try {
    const { appointmentId, newDateTime, reason } = req.body;
    const userId = req.user.app_user_id;

    if (!appointmentId || !newDateTime || !reason) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Missing required fields: appointmentId, newDateTime, reason"
      );
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "userId fullName")
      .populate("doctorId", "userId fullName")
      .lean();

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    // Check if user owns this appointment (patient)
    if (appointment.patientId.userId.toString() !== userId) {
      return fail(
        res,
        403,
        ERROR_CODES.FORBIDDEN,
        "You can only reschedule your own appointments"
      );
    }

    // Check if reschedule is allowed
    const canReschedule = RescheduleRequest.canReschedule(
      appointment.scheduledStart
    );
    if (!canReschedule) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Cannot reschedule appointment less than 24 hours before scheduled time"
      );
    }

    // Check if appointment can be rescheduled
    if (!["pending_doctor", "accepted"].includes(appointment.status)) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Appointment cannot be rescheduled in current status"
      );
    }

    // Check if there's already a pending reschedule request
    const existingRequest = await RescheduleRequest.findOne({
      originalAppointmentId: appointmentId,
      status: "pending",
    });

    if (existingRequest) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "There is already a pending reschedule request for this appointment"
      );
    }

    // Validate new datetime
    const newDate = new Date(newDateTime);
    const now = new Date();

    if (newDate <= now) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "New appointment time must be in the future"
      );
    }

    // Create reschedule request
    const rescheduleRequest = new RescheduleRequest({
      originalAppointmentId: appointmentId,
      requestedBy: userId,
      newDateTime: newDate,
      reason: reason.trim(),
    });

    await rescheduleRequest.save();

    // Send notification to doctor
    try {
      await createAppointmentNotification(
        appointmentId,
        "reschedule_requested",
        {
          reason: reason,
          newDateTime: newDate,
          patientName: appointment.patientId.fullName,
          originalDateTime: appointment.scheduledStart,
        }
      );
      console.log(
        `✅ Reschedule request notification sent for appointment ${appointmentId}`
      );
    } catch (notificationError) {
      console.error(
        "❌ Error creating reschedule notification:",
        notificationError
      );
      // Don't fail the main request if notification fails
    }

    return ok(res, {
      message: "Reschedule request sent successfully",
      request: rescheduleRequest,
    });
  } catch (error) {
    console.error("❌ Error requesting reschedule:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * Get reschedule requests for a doctor
 */
export async function getRescheduleRequests(req, res) {
  try {
    const doctorId = req.user.app_user_id;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Find doctor's appointments
    const doctorAppointments = await Appointment.find({ doctorId }).select(
      "_id"
    );
    const appointmentIds = doctorAppointments.map((apt) => apt._id);

    // Build filter
    const filter = { originalAppointmentId: { $in: appointmentIds } };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get reschedule requests
    const requests = await RescheduleRequest.find(filter)
      .populate("requestedBy", "fullName email")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await RescheduleRequest.countDocuments(filter);

    return ok(res, {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error getting reschedule requests:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * Approve reschedule request
 */
export async function approveReschedule(req, res) {
  try {
    const { requestId } = req.params;
    const doctorId = req.user.app_user_id;

    // Find reschedule request
    const request = await RescheduleRequest.findById(requestId).populate(
      "originalAppointmentId"
    );

    if (!request) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Reschedule request not found"
      );
    }

    if (request.status !== "pending") {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Request has already been processed"
      );
    }

    const originalAppointment = request.originalAppointmentId;

    // Check if doctor owns this appointment
    if (originalAppointment.doctorId.toString() !== doctorId) {
      return fail(
        res,
        403,
        ERROR_CODES.FORBIDDEN,
        "You can only approve reschedule requests for your own appointments"
      );
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update original appointment status
      await Appointment.findByIdAndUpdate(
        originalAppointment._id,
        {
          status: "rescheduled",
          rescheduledToId: null, // Will be set after creating new appointment
          rescheduledBy: doctorId,
          rescheduledAt: new Date(),
          rescheduleReason: request.reason,
        },
        { session }
      );

      // Create new appointment
      const newAppointmentData = {
        ...originalAppointment.toObject(),
        _id: new mongoose.Types.ObjectId(),
        scheduledStart: request.newDateTime,
        scheduledEnd: new Date(request.newDateTime.getTime() + 30 * 60000), // +30 minutes
        status: "accepted",
        rescheduledFromId: originalAppointment._id,
        rescheduledToId: null,
        rescheduleReason: null,
        rescheduledBy: null,
        rescheduledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newAppointment = await Appointment.create([newAppointmentData], {
        session,
      });

      // Update original appointment with new appointment ID
      await Appointment.findByIdAndUpdate(
        originalAppointment._id,
        { rescheduledToId: newAppointment[0]._id },
        { session }
      );

      // Update reschedule request
      await RescheduleRequest.findByIdAndUpdate(
        requestId,
        {
          status: "approved",
          reviewedBy: doctorId,
          reviewedAt: new Date(),
        },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();

      // Send notifications
      try {
        await createAppointmentNotification(
          originalAppointment._id,
          "rescheduled",
          {
            reason: request.reason,
            newDateTime: request.newDateTime,
            approvedBy: doctorId,
          }
        );
        console.log(
          `✅ Reschedule approved notification sent for appointment ${originalAppointment._id}`
        );
      } catch (notificationError) {
        console.error(
          "❌ Error creating reschedule approved notification:",
          notificationError
        );
      }

      return ok(res, {
        message: "Reschedule request approved successfully",
        newAppointment: newAppointment[0],
        originalAppointment: originalAppointment._id,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("❌ Error approving reschedule:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * Reject reschedule request
 */
export async function rejectReschedule(req, res) {
  try {
    const { requestId } = req.params;
    const { reviewNotes } = req.body;
    const doctorId = req.user.app_user_id;

    // Find reschedule request
    const request = await RescheduleRequest.findById(requestId).populate(
      "originalAppointmentId"
    );

    if (!request) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Reschedule request not found"
      );
    }

    if (request.status !== "pending") {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Request has already been processed"
      );
    }

    const originalAppointment = request.originalAppointmentId;

    // Check if doctor owns this appointment
    if (originalAppointment.doctorId.toString() !== doctorId) {
      return fail(
        res,
        403,
        ERROR_CODES.FORBIDDEN,
        "You can only reject reschedule requests for your own appointments"
      );
    }

    // Update reschedule request
    const updatedRequest = await RescheduleRequest.findByIdAndUpdate(
      requestId,
      {
        status: "rejected",
        reviewedBy: doctorId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "Request rejected by doctor",
      },
      { new: true }
    );

    // Send notification to patient
    try {
      await createAppointmentNotification(
        originalAppointment._id,
        "reschedule_rejected",
        {
          reason: request.reason,
          rejectedBy: doctorId,
          reviewNotes: reviewNotes,
        }
      );
      console.log(
        `✅ Reschedule rejected notification sent for appointment ${originalAppointment._id}`
      );
    } catch (notificationError) {
      console.error(
        "❌ Error creating reschedule rejected notification:",
        notificationError
      );
    }

    return ok(res, {
      message: "Reschedule request rejected",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("❌ Error rejecting reschedule:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * Get reschedule requests for a patient
 */
export async function getPatientRescheduleRequests(req, res) {
  try {
    const userId = req.user.app_user_id;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { requestedBy: userId };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get reschedule requests
    const requests = await RescheduleRequest.find(filter)
      .populate("originalAppointmentId", "scheduledStart scheduledEnd status")
      .populate("reviewedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await RescheduleRequest.countDocuments(filter);

    return ok(res, {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error getting patient reschedule requests:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}
