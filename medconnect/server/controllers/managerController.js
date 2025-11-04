import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import DoctorScheduleRule from "../models/doctor_schedule_rules.model.js";
import DoctorRate from "../models/doctor_rates.model.js";
import Clinic from "../models/clinic.model.js";
import {
  createAppointmentNotification,
  createBookingNotification,
} from "../services/notificationService.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Check if doctor has all required information to be active
 * Required fields: yearsExperience > 0, bio (non-empty), and at least one DoctorRate
 */
async function checkDoctorCanBeActive(doctorId) {
  try {
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return { canBeActive: false, reason: "Doctor not found" };
    }

    // Check yearsExperience
    if (!doctor.yearsExperience || doctor.yearsExperience <= 0) {
      return {
        canBeActive: false,
        reason: "Số năm kinh nghiệm chưa được điền hoặc bằng 0",
      };
    }

    // Check bio
    if (!doctor.bio || doctor.bio.trim().length === 0) {
      return {
        canBeActive: false,
        reason: "Lời giới thiệu chưa được điền",
      };
    }

    // Check if doctor has at least one active DoctorRate
    const doctorRates = await DoctorRate.find({
      doctorId: doctor._id,
      isActive: true,
    }).lean();

    if (!doctorRates || doctorRates.length === 0) {
      return {
        canBeActive: false,
        reason: "Chưa có giá tiền cho slot khám (cần set ít nhất 1 mức giá)",
      };
    }

    return { canBeActive: true };
  } catch (error) {
    console.error("Error checking doctor can be active:", error);
    return {
      canBeActive: false,
      reason: "Lỗi khi kiểm tra thông tin bác sĩ",
    };
  }
}

/**
 * Get all doctors for manager to select
 * Manager should see all verified doctors to manage their schedules
 * Supports filtering by name and specializationId
 */
export async function getAllDoctorsForManager(req, res) {
  try {
    const { name, specializationId } = req.query;

    // Log query for debugging
    console.log("[Manager] Fetching verified doctors...", {
      name,
      specializationId,
    });

    // Build query filter
    const filter = { isVerified: true };

    // Filter by name (case-insensitive search)
    if (name && name.trim()) {
      // Escape special regex characters to prevent regex injection
      const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.fullName = { $regex: escapedName, $options: "i" };
    }

    // Filter by specializationId (specializationIds is an array, use $in)
    if (specializationId) {
      filter.specializationIds = { $in: [specializationId] };
    }

    const doctors = await Doctor.find(filter)
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name")
      .populate("clinicDefaultId", "name address phone")
      .select(
        "fullName avatarUrl specializationIds ratingAvg ratingCount isVerified clinicDefaultId"
      )
      .sort({ fullName: 1 })
      .lean();

    console.log(`[Manager] Found ${doctors.length} verified doctors`);
    if (doctors.length > 0) {
      console.log(
        `[Manager] Sample doctors:`,
        doctors.slice(0, 3).map((d) => ({
          _id: d._id,
          fullName: d.fullName,
          isActive: d.isActive,
          isVerified: d.isVerified,
        }))
      );
    }

    return ok(res, { doctors });
  } catch (error) {
    console.error("Error fetching doctors for manager:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get time slots for a specific doctor (manager can view any doctor's schedule)
 */
export async function getDoctorTimeSlotsForManager(req, res) {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 1000, startDate, endDate } = req.query;

    console.log("🔍 [Manager] getDoctorTimeSlotsForManager called with:", {
      doctorId,
      startDate,
      endDate,
      limit,
    });

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log("❌ Doctor not found:", doctorId);
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    console.log("✅ Doctor found:", { id: doctor._id, name: doctor.fullName });

    const filter = { doctorId };

    // Apply date range filter
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return fail(
            res,
            400,
            ERROR_CODES.INVALID_INPUT,
            "Invalid date format"
          );
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        filter.startAt = { $gte: start, $lte: end };
      } catch (dateError) {
        return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid date format");
      }
    }

    console.log("🔍 Querying time slots with filter:", filter);

    const timeSlots = await DoctorTimeSlot.find(filter)
      .sort({ startAt: 1 })
      .limit(parseInt(limit))
      .lean();

    console.log(
      `✅ Found ${timeSlots.length} time slots for doctor ${doctor.fullName}`
    );

    // Get slot IDs to fetch appointments
    const slotIds = timeSlots.map((slot) => slot._id);

    // Fetch appointments for these slots
    // Exclude ALL rescheduled appointments (they are replaced by new appointments)
    // A rescheduled appointment means the old appointment is no longer active
    const appointments = await Appointment.find({
      slotId: { $in: slotIds },
      // Filter out ALL appointments with status "rescheduled" - they should not appear in the schedule
      status: { $ne: "rescheduled" },
    })
      .populate({
        path: "patientId",
        select: "fullName phone",
        model: "Patient",
      })
      .lean();

    console.log(`✅ Found ${appointments.length} appointments for these slots`);

    // Create a map of slotId -> appointment
    const appointmentMap = {};
    appointments.forEach((appointment) => {
      const slotIdKey = appointment.slotId.toString();

      let patientName = null;
      if (appointment.patientId) {
        if (
          typeof appointment.patientId === "object" &&
          appointment.patientId.fullName
        ) {
          patientName = appointment.patientId.fullName;
        }
      }

      appointmentMap[slotIdKey] = {
        appointmentId: appointment._id.toString(),
        patientName: patientName,
        reason: appointment.reason || null,
        appointmentStatus: appointment.status || "booked",
        mode: appointment.mode || "offline",
        rescheduledFromId: appointment.rescheduledFromId
          ? appointment.rescheduledFromId.toString()
          : null, // Include rescheduledFromId to identify rescheduled appointments
      };
    });

    // Fetch leave requests for these slots
    const LeaveRequest = (await import("../models/leaveRequest.model.js"))
      .default;
    const leaveRequests = await LeaveRequest.find({
      slotId: { $in: slotIds },
      status: "pending",
    }).lean();

    // Create a map of slotId -> leave request
    const leaveRequestMap = {};
    leaveRequests.forEach((leaveRequest) => {
      const slotIdKey = leaveRequest.slotId.toString();
      leaveRequestMap[slotIdKey] = leaveRequest;
    });

    // Format slots similar to doctor's own view with proper status mapping
    const formattedSlots = timeSlots.map((slot) => {
      const slotIdStr = slot._id.toString();
      const appointment = appointmentMap[slotIdStr];
      const pendingLeaveRequest = leaveRequestMap[slotIdStr];

      // Map appointment status to display status (same logic as Doctor)
      let displayStatus = slot.status;
      if (appointment) {
        const statusMap = {
          pending_doctor: "pending",
          accepted: "confirmed",
          in_progress: "in_progress",
          cancelled: "cancelled",
          done: "completed",
          rejected: "cancelled",
          no_show: "cancelled",
        };
        displayStatus = statusMap[appointment.appointmentStatus] || slot.status;
      } else {
        // No appointment found for this slot
        // If slot status is "booked" but no appointment exists (e.g., rescheduled appointment was removed),
        // treat it as "available" so it appears empty
        if (slot.status === "booked") {
          displayStatus = "available";
        }
      }

      return {
        _id: slot._id.toString(),
        doctorId: slot.doctorId.toString(),
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: displayStatus, // Use mapped status
        patientName: appointment?.patientName || null,
        appointmentId: appointment?.appointmentId || null,
        appointmentStatus: appointment?.appointmentStatus || null,
        reason: appointment?.reason || null,
        mode: appointment?.mode || null,
        rescheduledFromId: appointment?.rescheduledFromId || null, // Flag to identify rescheduled appointments
        leaveReason: slot.leaveReason || null, // Lý do nghỉ
        hasPendingLeaveRequest: !!pendingLeaveRequest, // Flag để biết có leave request đang pending
        leaveRequestId: pendingLeaveRequest?._id?.toString() || null,
      };
    });

    return ok(res, {
      slots: formattedSlots,
      doctor: {
        _id: doctor._id,
        fullName: doctor.fullName,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching doctor time slots for manager:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error message:", error.message);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get appointment detail by appointment ID (manager can view any doctor's appointments)
 */
export async function getAppointmentDetailForManager(req, res) {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Appointment ID is required"
      );
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "patientId",
        select:
          "fullName dob gender phone relationshipToOwner representativeName representativeRelation representativePhone representativeCitizenId",
      })
      .populate({
        path: "doctorId",
        select: "fullName specializationIds phone avatarUrl",
        populate: {
          path: "specializationIds",
          select: "name",
        },
      })
      .populate("clinicId", "name address")
      .populate("slotId", "startAt endAt")
      .populate({
        path: "rescheduledFromId",
        select:
          "scheduledStart scheduledEnd status rescheduleReason rescheduledAt",
        populate: {
          path: "slotId",
          select: "startAt endAt",
        },
      })
      .lean();

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    // Ensure patientId is properly populated
    let patientId = appointment.patientId;
    if (!patientId || (typeof patientId === 'object' && !patientId.fullName)) {
      console.warn(`⚠️ Appointment ${appointment._id} has invalid patientId:`, patientId);
      patientId = {
        _id: appointment.patientId?._id || appointment.patientId || null,
        fullName: appointment.patientId?.fullName || "Không có thông tin",
        dob: appointment.patientId?.dob || null,
        gender: appointment.patientId?.gender || null,
        phone: appointment.patientId?.phone || null,
        relationshipToOwner: appointment.patientId?.relationshipToOwner || null,
        representativeName: appointment.patientId?.representativeName || null,
        representativeRelation: appointment.patientId?.representativeRelation || null,
        representativePhone: appointment.patientId?.representativePhone || null,
        representativeCitizenId: appointment.patientId?.representativeCitizenId || null,
      };
    }

    // Ensure new fields have default values for backward compatibility
    const appointmentWithDefaults = {
      ...appointment,
      patientId, // Use properly populated patientId
      services: appointment.services || [],
      totalPay: appointment.totalPay !== undefined && appointment.totalPay !== null ? appointment.totalPay : 0,
      amountPaid: appointment.amountPaid !== undefined && appointment.amountPaid !== null ? appointment.amountPaid : 0,
      paymentStatus: appointment.paymentStatus || 'unpaid',
    };

    return ok(res, appointmentWithDefaults);
  } catch (error) {
    console.error("❌ getAppointmentDetailForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Get all patients for manager to select when booking appointments
 */
export async function getAllPatientsForManager(req, res) {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get patients with populated user info, filter only users with role='patient'
    const patients = await Patient.find(query)
      .populate({
        path: "userId",
        select: "email status role createdAt",
        match: { role: "patient" },
      })
      .select("fullName phone email dob gender avatarUrl createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out patients where userId is null (due to role filter)
    const validPatients = patients.filter(
      (p) => p.userId && p.userId.role === "patient"
    );

    // Get total count - need to count only patients with role='patient'
    const patientUserIds = await User.find({ role: "patient" })
      .select("_id")
      .lean();
    const patientIds = patientUserIds.map((u) => u._id);
    const countQuery = { ...query, userId: { $in: patientIds } };
    const total = await Patient.countDocuments(countQuery);

    // Format response
    const formattedPatients = validPatients.map((patient) => ({
      _id: patient._id,
      id: patient._id,
      userId: patient.userId?._id,
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email || patient.userId?.email,
      dob: patient.dob,
      gender: patient.gender,
      avatarUrl: patient.avatarUrl,
      status: patient.userId?.status || "active",
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));

    return ok(res, {
      patients: formattedPatients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching patients for manager:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Create appointment by manager (for any doctor)
 */
export async function createAppointmentByManager(req, res) {
  try {
    const {
      doctorId,
      slotId,
      patientId, // New: patient ID if selecting from existing patients
      patientName, // For new patient
      patientPhone, // For new patient
      dob, // Date of birth for new patient
      gender, // Gender for new patient
      citizenId, // Citizen ID for new patient
      address, // Address for new patient
      allergyNotes, // Allergy notes for new patient
      reason,
      mode,
      clinicId, // Clinic ID for offline mode
      scheduledStart,
      scheduledEnd,
    } = req.body;

    if (!doctorId || !reason || !mode || !scheduledStart || !scheduledEnd) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Missing required fields"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    // Find patient - prioritize patientId, fallback to patientName/patientPhone
    let patient = null;

    if (patientId) {
      // Use existing patient by ID
      patient = await Patient.findById(patientId);
      if (!patient) {
        return fail(res, 404, ERROR_CODES.NOT_FOUND, "Patient not found");
      }
    } else if (patientPhone && patientName) {
      // Create new patient with full information
      console.log("🔍 [Manager] Creating new patient with data:", {
        patientName,
        patientPhone,
        dob,
        gender,
        citizenId,
        address,
        hasAllergyNotes: !!allergyNotes,
      });

      // Validate required fields for new patient
      if (!dob || !gender || !citizenId || !address) {
        console.error("❌ [Manager] Missing required patient information:", {
          hasDob: !!dob,
          hasGender: !!gender,
          hasCitizenId: !!citizenId,
          hasAddress: !!address,
        });
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Missing required patient information: dob, gender, citizenId, address are required for new patients"
        );
      }

      // Find existing User by phone, or create minimal User if not found
      let user = await User.findOne({ phone: patientPhone });
      let userId;

      if (!user) {
        // Create minimal User for the patient (required by Patient model)
        console.log(
          "🔍 [Manager] User not found, creating minimal User for patient"
        );
        try {
          // Generate a unique email
          const baseEmail = `${patientPhone}@patient.medconnect.local`;
          let finalEmail = baseEmail;
          let emailExists = await User.findOne({ email: finalEmail });
          let counter = 1;
          while (emailExists) {
            finalEmail = `${patientPhone}_${Date.now()}_${counter}@patient.medconnect.local`;
            emailExists = await User.findOne({ email: finalEmail });
            counter++;
          }

          // Create minimal User (no password required for phone auth)
          user = new User({
            phone: patientPhone,
            email: finalEmail,
            fullName: patientName,
            role: "patient",
            status: "active",
            authProvider: "phone", // Set to "phone" so passwordHash is not required
          });
          await user.save();
          userId = user._id;
          console.log("✅ [Manager] Created minimal User:", userId);
        } catch (userError) {
          // Handle duplicate key error (race condition)
          if (userError.code === 11000) {
            console.log(
              "⚠️ [Manager] Duplicate key error, finding existing user"
            );
            user = await User.findOne({ phone: patientPhone });
            if (user) {
              userId = user._id;
              console.log(
                "✅ [Manager] Found existing User after error:",
                userId
              );
            } else {
              console.error("❌ [Manager] Error creating User:", userError);
              throw userError;
            }
          } else {
            console.error("❌ [Manager] Error creating User:", userError);
            throw userError;
          }
        }
      } else {
        userId = user._id;
        console.log("✅ [Manager] Found existing User:", userId);
      }

      // Validate DOB format
      let dobDate;
      try {
        dobDate = new Date(dob);
        if (isNaN(dobDate.getTime())) {
          console.error("❌ [Manager] Invalid DOB format:", dob);
          return fail(
            res,
            400,
            ERROR_CODES.INVALID_INPUT,
            "Invalid date of birth format"
          );
        }
      } catch (error) {
        console.error("❌ [Manager] Error parsing DOB:", error, dob);
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Invalid date of birth format"
        );
      }

      // Always create new patient (even if one exists with same phone)
      console.log("🔍 [Manager] Creating new Patient");
      patient = new Patient({
        userId,
        fullName: patientName,
        phone: patientPhone,
        dob: dobDate,
        gender: gender,
        citizenId: citizenId,
        address: address,
        allergyNotes: allergyNotes || "",
        isProfileComplete: true, // Mark as complete since we have all required fields
      });
      await patient.save();
      console.log("✅ [Manager] Created new Patient:", patient._id);
    } else {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Either patientId or patientName+patientPhone with full information must be provided"
      );
    }

    // Create appointment (similar to doctor's createAppointmentByDoctor)
    console.log("🔍 [Manager] Creating appointment with data:", {
      patientId: patient._id,
      doctorId: doctor._id,
      slotId: slotId || null,
      mode,
      scheduledStart,
      scheduledEnd,
      reason,
      clinicId: mode === "offline" ? clinicId : null,
    });

    // Validate scheduled dates
    let scheduledStartDate, scheduledEndDate;
    try {
      if (!scheduledStart || !scheduledEnd) {
        console.error("❌ [Manager] Missing scheduled dates:", {
          scheduledStart,
          scheduledEnd,
        });
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Missing scheduledStart or scheduledEnd"
        );
      }

      scheduledStartDate = new Date(scheduledStart);
      scheduledEndDate = new Date(scheduledEnd);

      if (
        isNaN(scheduledStartDate.getTime()) ||
        isNaN(scheduledEndDate.getTime())
      ) {
        console.error("❌ [Manager] Invalid scheduled dates:", {
          scheduledStart,
          scheduledEnd,
          parsedStart: scheduledStartDate,
          parsedEnd: scheduledEndDate,
        });
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Invalid scheduled start or end date"
        );
      }
    } catch (error) {
      console.error("❌ [Manager] Error parsing scheduled dates:", error);
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Invalid scheduled start or end date format"
      );
    }

    // Ensure dates are properly set and in future
    console.log("🔍 [Manager] Validating scheduled dates:", {
      scheduledStartDate: scheduledStartDate.toISOString(),
      scheduledEndDate: scheduledEndDate.toISOString(),
      now: new Date().toISOString(),
      isFuture: scheduledStartDate > new Date(),
    });

    if (scheduledStartDate <= new Date()) {
      console.error("❌ [Manager] scheduledStart is not in the future:", {
        scheduledStart: scheduledStartDate.toISOString(),
        now: new Date().toISOString(),
      });
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Scheduled start time must be in the future"
      );
    }

    const appointmentData = {
      patientId: patient._id,
      doctorId: doctor._id,
      slotId: slotId || null,
      mode,
      scheduledStart: scheduledStartDate,
      scheduledEnd: scheduledEndDate,
      reason,
      status: "pending_doctor",
    };

    // Add clinicId if mode is offline
    if (mode === "offline") {
      if (!clinicId) {
        console.error(
          "❌ [Manager] Clinic ID is required for offline appointments"
        );
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Clinic ID is required for offline appointments"
        );
      }
      // Verify clinic exists
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        console.error("❌ [Manager] Clinic not found:", clinicId);
        return fail(res, 404, ERROR_CODES.NOT_FOUND, "Clinic not found");
      }
      appointmentData.clinicId = clinicId;
      console.log("✅ [Manager] Added clinicId to appointment:", clinicId);
    }

    // Double check that scheduledStartDate is set correctly
    if (!appointmentData.scheduledStart || !appointmentData.scheduledEnd) {
      console.error(
        "❌ [Manager] scheduledStart or scheduledEnd is missing in appointmentData:",
        appointmentData
      );
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "scheduledStart and scheduledEnd must be set"
      );
    }

    console.log("🔍 [Manager] Final appointmentData before save:", {
      ...appointmentData,
      scheduledStart: appointmentData.scheduledStart?.toISOString(),
      scheduledEnd: appointmentData.scheduledEnd?.toISOString(),
      scheduledStartType: typeof appointmentData.scheduledStart,
      scheduledEndType: typeof appointmentData.scheduledEnd,
    });

    console.log("🔍 [Manager] Saving appointment...");
    const appointment = await Appointment.create(appointmentData);
    console.log("✅ [Manager] Created appointment:", appointment._id);

    // Update slot status if slotId provided
    if (slotId) {
      await DoctorTimeSlot.findByIdAndUpdate(slotId, {
        status: "booked",
        appointmentId: appointment._id,
      });
    }

    // Send notification to doctor about new appointment created by manager
    try {
      await createBookingNotification(appointment._id, {
        createdByManager: true,
      });
      console.log(
        `✅ [Manager] Sent booking notification to doctor for appointment ${appointment._id}`
      );
    } catch (notificationError) {
      // Log error but don't fail the request if notification fails
      console.error(
        "⚠️ [Manager] Error sending notification to doctor:",
        notificationError
      );
    }

    return ok(res, { appointment });
  } catch (error) {
    console.error("❌ [Manager] Error creating appointment by manager:", error);
    console.error("❌ [Manager] Error stack:", error.stack);
    console.error(
      "❌ [Manager] Request body:",
      JSON.stringify(req.body, null, 2)
    );

    // Return more detailed error message
    const errorMessage = error.message || "Internal server error";
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      `Error creating appointment: ${errorMessage}`
    );
  }
}

/**
 * Generate time slots for a specific doctor (manager can generate for any doctor)
 */
export async function generateSlotsForManager(req, res) {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    console.log("🔍 generateSlotsForManager - doctorId:", doctorId);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    console.log("🔍 generateSlotsForManager - Found doctor:", {
      id: doctor._id,
      fullName: doctor.fullName,
    });

    // First, create default schedule rules for missing weekdays
    const existingRules = await DoctorScheduleRule.find({
      doctorId: doctor._id,
      isActive: true,
    });

    // Get existing weekdays
    const existingWeekdays = new Set(existingRules.map((rule) => rule.weekday));

    console.log(
      `Existing weekdays for doctor ${doctor._id}:`,
      Array.from(existingWeekdays)
    );

    // Create default schedule rules for missing weekdays (Monday to Sunday)
    const defaultRules = [];

    // Check all weekdays: 0 (Sunday), 1 (Monday), 2 (Tuesday), 3 (Wednesday), 4 (Thursday), 5 (Friday), 6 (Saturday)
    const allWeekdays = [0, 1, 2, 3, 4, 5, 6];

    for (const weekday of allWeekdays) {
      // Skip if rule already exists for this weekday
      if (existingWeekdays.has(weekday)) {
        console.log(`Rule for weekday ${weekday} already exists, skipping...`);
        continue;
      }

      // Create rule for this weekday
      const rule = {
        doctorId: doctor._id,
        weekday: weekday,
        blocks: [
          {
            startTime: "07:00",
            endTime: "11:40",
          },
          {
            startTime: "13:00",
            endTime: "17:00",
          },
        ],
        slotBlockMinutes: 20,
        consultMinutes: 20,
        effectiveFrom: new Date(),
        isActive: true,
      };
      defaultRules.push(rule);
    }

    if (defaultRules.length > 0) {
      await DoctorScheduleRule.insertMany(defaultRules);
      console.log(
        `Created ${defaultRules.length} default schedule rules for doctor ${
          doctor._id
        } (missing weekdays: ${defaultRules.map((r) => r.weekday).join(", ")})`
      );
    } else {
      console.log(
        `All schedule rules already exist for doctor ${doctor._id} (all 7 days)`
      );
    }

    // Get active schedule rules for this doctor
    const scheduleRules = await DoctorScheduleRule.find({
      doctorId: doctor._id,
      isActive: true,
    }).lean();

    if (scheduleRules.length === 0) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "No schedule rules found. Please set up schedule rules first."
      );
    }

    console.log(
      `📋 Found ${scheduleRules.length} schedule rules for doctor ${doctor.fullName}`
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate end of current month (không tạo sang tháng mới)
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    console.log("🔍 Creating slots from:", today.toISOString().split("T")[0]);
    console.log(
      "🔍 Creating slots until end of current month:",
      endDate.toISOString().split("T")[0]
    );

    // Check how many future slots already exist in the current month
    const existingFutureSlots = await DoctorTimeSlot.countDocuments({
      doctorId: doctor._id,
      startAt: {
        $gte: today,
        $lte: endDate,
      },
    });

    console.log(
      `📊 Existing future slots in current month: ${existingFutureSlots}`
    );

    // Check if we already have slots for remaining days in the current month
    // Estimate: if we have more than 80% of needed slots (assuming average 30 slots per day)
    // Calculate days remaining from today to end of month
    const daysRemaining = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const estimatedSlotsNeeded = daysRemaining * 30; // Rough estimate: 30 slots per day

    if (existingFutureSlots >= estimatedSlotsNeeded * 0.8) {
      console.log(
        `⏭️ Skipping slot generation - already have ${existingFutureSlots} slots in current month (>= ${Math.floor(
          estimatedSlotsNeeded * 0.8
        )})`
      );
      return ok(res, {
        message: `No new slots created. Doctor already has enough slots for the remaining days of current month.`,
        createdSlots: 0,
        skippedSlots: 0,
        existingSlots: existingFutureSlots,
        note: "Slots are only auto-generated when remaining days of current month have insufficient slots.",
      });
    }

    const createdSlots = [];
    const skippedSlots = [];

    // Calculate number of days from today to end of current month
    const daysFromTodayToEndOfMonth = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (
      let dayOffset = 0;
      dayOffset < daysFromTodayToEndOfMonth;
      dayOffset++
    ) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const weekday = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Find schedule rule for this weekday
      const dayRule = scheduleRules.find((rule) => rule.weekday === weekday);
      if (!dayRule) {
        console.log(
          `⚠️ No schedule rule for weekday ${weekday} (${currentDate.toDateString()})`
        );
        continue;
      }

      console.log(
        `📅 Processing ${currentDate.toDateString()} (weekday ${weekday}) with ${
          dayRule.blocks.length
        } blocks`
      );
      let daySlotCount = 0;

      // Generate slots based on schedule rules
      const generatedSlots = DoctorScheduleRule.generateSlotsForDate({
        date: currentDate,
        blocks: dayRule.blocks,
        slotBlockMinutes: dayRule.slotBlockMinutes,
      });

      console.log(
        `🔍 Generated ${
          generatedSlots.length
        } slots for ${currentDate.toDateString()}`
      );

      for (const slotData of generatedSlots) {
        try {
          console.log(
            `🔍 Checking slot: ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}`
          );

          const existingSlot = await DoctorTimeSlot.findOne({
            doctorId: doctor._id,
            startAt: slotData.startAt,
            endAt: slotData.endAt,
          });

          if (!existingSlot) {
            console.log(
              `✅ Creating new slot: ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}`
            );
            const newSlot = await DoctorTimeSlot.create({
              doctorId: doctor._id,
              startAt: slotData.startAt,
              endAt: slotData.endAt,
              status: "available",
            });
            createdSlots.push(newSlot);
            daySlotCount++;
            console.log(`✅ Slot created successfully: ${newSlot._id}`);
          } else {
            console.log(
              `⚠️ Slot already exists: ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}`
            );
            skippedSlots.push({
              startAt: slotData.startAt,
              endAt: slotData.endAt,
              reason: "Already exists",
            });
          }
        } catch (error) {
          console.error(
            `❌ Error creating slot ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}:`,
            error
          );
          skippedSlots.push({
            startAt: slotData.startAt,
            endAt: slotData.endAt,
            reason: error.message,
          });
        }
      }

      console.log(
        `📊 Day ${dayOffset + 1} completed: ${daySlotCount} slots created`
      );
    }

    console.log(
      `✅ Created ${createdSlots.length} new time slots for doctor ${doctor.fullName} based on schedule rules`
    );
    console.log(
      `⚠️ Skipped ${skippedSlots.length} slots (already exist or error)`
    );
    console.log(`📊 Actual created: ${createdSlots.length} slots`);

    // Count total future slots after creation
    const totalFutureSlots = await DoctorTimeSlot.countDocuments({
      doctorId: doctor._id,
      startAt: { $gte: today },
    });

    return ok(res, {
      message: `Generated ${createdSlots.length} new time slots for doctor ${doctor.fullName} for remaining days of current month`,
      createdSlots: createdSlots.length,
      skippedSlots: skippedSlots.length,
      totalFutureSlots: totalFutureSlots, // Total future slots after creation
      dateRange: {
        startDate: today.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      scheduleRules: scheduleRules.length,
      details: {
        created: createdSlots.slice(0, 5),
        skipped: skippedSlots.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("❌ generateSlotsForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Delete a time slot for a specific doctor (manager can delete for any doctor)
 */
export async function deleteTimeSlotForManager(req, res) {
  try {
    const { doctorId, slotId } = req.params;

    if (!doctorId || !slotId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Doctor ID and Slot ID are required"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    console.log(
      "🔍 deleteTimeSlotForManager - doctor:",
      doctor._id,
      "slot:",
      slotId
    );

    // Find the slot and verify it belongs to the specified doctor
    const slot = await DoctorTimeSlot.findOne({
      _id: slotId,
      doctorId: doctor._id,
    });

    if (!slot) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Time slot not found or does not belong to this doctor"
      );
    }

    // Check if slot has active appointment
    const appointment = await Appointment.findOne({
      slotId: slot._id,
      status: {
        $nin: ["cancelled", "rejected", "no_show", "rescheduled"],
      },
    });

    if (appointment) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Cannot delete slot with active appointment"
      );
    }

    // Delete the slot
    await DoctorTimeSlot.findByIdAndDelete(slotId);
    console.log(
      `✅ Manager deleted time slot ${slotId} for doctor ${doctor.fullName}`
    );

    return ok(res, {
      message: "Time slot deleted successfully",
      deletedSlotId: slotId,
    });
  } catch (error) {
    console.error("❌ deleteTimeSlotForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Block a single slot by slotId for a specific doctor (manager can block for any doctor)
 */
export async function blockSingleSlotForManager(req, res) {
  try {
    const { doctorId, slotId } = req.params;
    const { reason } = req.body || {};

    if (!doctorId || !slotId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Doctor ID and Slot ID are required"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    // Find the specific slot
    const slot = await DoctorTimeSlot.findOne({
      _id: slotId,
      doctorId: doctor._id,
    });

    if (!slot) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Time slot not found or does not belong to this doctor"
      );
    }

    // Check if slot has active appointments
    const activeAppointments = await Appointment.find({
      slotId: slot._id,
      status: {
        $nin: ["cancelled", "rejected", "no_show", "rescheduled"],
      },
    }).select("slotId status");

    if (activeAppointments.length > 0) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Cannot block slot with active appointment. Please cancel the appointment first."
      );
    }

    // Block the slot
    slot.status = "blocked";
    slot.leaveReason = reason || "";
    await slot.save();

    console.log(
      `✅ Manager blocked single slot ${slotId} for doctor ${doctor.fullName} at ${slot.startAt}`
    );
    if (reason) {
      console.log(`Reason: ${reason}`);
    }

    return ok(res, {
      message: "Slot blocked successfully",
      blockedSlotId: slotId,
      slot: {
        id: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: slot.status,
      },
    });
  } catch (error) {
    console.error("❌ blockSingleSlotForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Block/unblock slots by date range for a specific doctor (manager can block for any doctor)
 */
export async function blockSlotsByDateRangeForManager(req, res) {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate, reason } = req.body;

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    if (!startDate || !endDate) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Start date and end date are required"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Start date must be before end date"
      );
    }

    // Find all slots in the date range for this doctor
    const slotsToBlock = await DoctorTimeSlot.find({
      doctorId: doctor._id,
      startAt: { $gte: start, $lte: end },
    });

    if (slotsToBlock.length === 0) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "No slots found in the specified date range"
      );
    }

    // Check if any slots have active appointments
    const slotIds = slotsToBlock.map((slot) => slot._id);
    const activeAppointments = await Appointment.find({
      slotId: { $in: slotIds },
      status: {
        $nin: ["cancelled", "rejected", "no_show", "rescheduled"],
      },
    }).select("slotId status");

    if (activeAppointments.length > 0) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        `Cannot block ${activeAppointments.length} slot(s) with active appointments. Please cancel those appointments first.`
      );
    }

    // Block all slots in the date range
    const updateResult = await DoctorTimeSlot.updateMany(
      {
        _id: { $in: slotIds },
      },
      {
        $set: { status: "blocked" },
      }
    );

    console.log(
      `✅ Manager blocked ${updateResult.modifiedCount} slots for doctor ${doctor.fullName} from ${startDate} to ${endDate}`
    );
    if (reason) {
      console.log(`Reason: ${reason}`);
    }

    return ok(res, {
      message: `Successfully blocked ${updateResult.modifiedCount} slots`,
      blockedSlots: updateResult.modifiedCount,
      dateRange: {
        startDate: startDate,
        endDate: endDate,
      },
      reason: reason || null,
    });
  } catch (error) {
    console.error("❌ blockSlotsByDateRangeForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Reschedule appointment by manager (direct reschedule without approval)
 */
export async function rescheduleAppointmentByManager(req, res) {
  try {
    const { appointmentId } = req.params;
    const { newDateTime, reason, mode, clinicId } = req.body;
    const userId = req.user.app_user_id;

    if (!appointmentId || !newDateTime || !reason || !mode) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Missing required fields: appointmentId, newDateTime, reason, mode"
      );
    }

    // Validate mode
    if (!["online", "offline"].includes(mode)) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Mode must be 'online' or 'offline'"
      );
    }

    // If offline mode, clinicId is required
    if (mode === "offline" && !clinicId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Clinic ID is required for offline appointments"
      );
    }

    // Find appointment with populated data
    const originalAppointment = await Appointment.findById(appointmentId)
      .populate("patientId", "userId fullName")
      .populate("doctorId", "userId fullName")
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "email fullName",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "email fullName",
        },
      });

    if (!originalAppointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    // Check if appointment can be rescheduled
    if (!["pending_doctor", "accepted"].includes(originalAppointment.status)) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Appointment cannot be rescheduled in current status"
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
          rescheduledBy: userId,
          rescheduledAt: new Date(),
          rescheduleReason: reason.trim(),
        },
        { session }
      );

      // Calculate appointment duration
      const appointmentDuration =
        originalAppointment.scheduledEnd.getTime() -
        originalAppointment.scheduledStart.getTime();

      const newScheduledStart = newDate;
      const newScheduledEnd = new Date(newDate.getTime() + appointmentDuration);

      const doctorId =
        originalAppointment.doctorId._id || originalAppointment.doctorId;

      // Find or create a time slot for the new datetime
      let newTimeSlot = await DoctorTimeSlot.findOne({
        doctorId: doctorId,
        startAt: newScheduledStart,
        endAt: newScheduledEnd,
      }).session(session);

      if (!newTimeSlot) {
        // Create new time slot for the rescheduled appointment
        newTimeSlot = new DoctorTimeSlot({
          doctorId: doctorId,
          startAt: newScheduledStart,
          endAt: newScheduledEnd,
          status: "available", // Will be set to "booked" after appointment creation
        });
        await newTimeSlot.save({ session });
        console.log(
          `✅ Created new time slot ${newTimeSlot._id} for rescheduled appointment`
        );
      }

      // Verify slot is available
      if (newTimeSlot.status !== "available") {
        await session.abortTransaction();
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Time slot for new datetime is no longer available"
        );
      }

      // Create new appointment with the NEW time slot
      const newAppointmentData = {
        patientId:
          originalAppointment.patientId._id || originalAppointment.patientId,
        doctorId: doctorId,
        clinicId:
          mode === "offline"
            ? clinicId ||
              originalAppointment.clinicId?._id ||
              originalAppointment.clinicId
            : undefined,
        slotId: newTimeSlot._id,
        scheduledStart: newScheduledStart,
        scheduledEnd: newScheduledEnd,
        mode: mode,
        status: "accepted",
        reason:
          originalAppointment.reason || originalAppointment.reasonForVisit,
        rescheduledFromId: originalAppointment._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newAppointment = new Appointment(newAppointmentData);
      await newAppointment.save({ session });

      // Mark the new time slot as booked
      await DoctorTimeSlot.findByIdAndUpdate(
        newTimeSlot._id,
        { status: "booked" },
        { session }
      );

      // Free the old slot by setting it to "available"
      // This allows the old slot to be reused since the appointment has been moved
      const oldSlotId =
        originalAppointment.slotId?._id || originalAppointment.slotId;
      if (oldSlotId) {
        await DoctorTimeSlot.findByIdAndUpdate(
          oldSlotId,
          { status: "available" },
          { session }
        );
        console.log(
          `✅ Freed old slot ${oldSlotId} - set to available after reschedule`
        );
      }

      // Update original appointment with new appointment ID
      await Appointment.findByIdAndUpdate(
        originalAppointment._id,
        { rescheduledToId: newAppointment._id },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();

      // Send notifications to both doctor and patient
      try {
        // Notification for both patient and doctor (using original appointment to get both users)
        await createAppointmentNotification(
          originalAppointment._id,
          "rescheduled",
          {
            reason: reason.trim(),
            newDateTime: newDate,
            rescheduledBy: userId,
            rescheduledByType: "manager",
            notifyDoctor: true, // Flag to notify doctor
            newAppointmentId: newAppointment._id, // Include new appointment ID for reference
          }
        );

        console.log(
          `✅ Reschedule notifications sent for appointment ${originalAppointment._id}`
        );
      } catch (notificationError) {
        console.error(
          "❌ Error creating reschedule notifications:",
          notificationError
        );
      }

      // Send email notification to patient (reuse function from rescheduleController)
      try {
        const { sendAppointmentRescheduledEmail } = await import(
          "../controllers/rescheduleController.js"
        );

        // Get doctor object for email (populate userId if needed)
        const doctor = await Doctor.findById(doctorId)
          .populate("userId", "email fullName")
          .lean();

        await sendAppointmentRescheduledEmail(
          originalAppointment,
          newAppointment,
          reason.trim(),
          doctor
        );
        console.log("✅ Reschedule confirmation email sent successfully");
      } catch (emailError) {
        console.error(
          "⚠️ Failed to send reschedule confirmation email:",
          emailError.message
        );
        // Don't block reschedule if email fails
      }

      return ok(res, {
        message: "Appointment rescheduled successfully",
        newAppointment: newAppointment,
        originalAppointment: originalAppointment._id,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("❌ Error rescheduling appointment by manager:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message);
  }
}

/**
 * Unblock slots by date range for a specific doctor (manager can unblock for any doctor)
 */
export async function unblockSlotsByDateRangeForManager(req, res) {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.body;

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    if (!startDate || !endDate) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Start date and end date are required"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Start date must be before end date"
      );
    }

    // Find all blocked slots in the date range for this doctor
    const slotsToUnblock = await DoctorTimeSlot.find({
      doctorId: doctor._id,
      startAt: { $gte: start, $lte: end },
      status: "blocked",
    });

    if (slotsToUnblock.length === 0) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "No blocked slots found in the specified date range"
      );
    }

    // Unblock all slots in the date range
    const updateResult = await DoctorTimeSlot.updateMany(
      {
        doctorId: doctor._id,
        startAt: { $gte: start, $lte: end },
        status: "blocked",
      },
      {
        $set: { status: "available" },
      }
    );

    console.log(
      `✅ Manager unblocked ${updateResult.modifiedCount} slots for doctor ${doctor.fullName} from ${startDate} to ${endDate}`
    );

    return ok(res, {
      message: `Successfully unblocked ${updateResult.modifiedCount} slots`,
      unblockedSlots: updateResult.modifiedCount,
      dateRange: {
        startDate: startDate,
        endDate: endDate,
      },
    });
  } catch (error) {
    console.error("❌ unblockSlotsByDateRangeForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

// ================== INVOICE MANAGEMENT CONTROLLERS ==================

/**
 * Get all invoices (payments) for manager
 * GET /api/managers/invoices?invoiceType=booking&page=1&limit=20
 */
export async function getManagerInvoices(req, res) {
  try {
    const { invoiceType, page = 1, limit = 20, status, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};

    // Filter by invoiceType (booking or service)
    if (invoiceType && invoiceType !== "all") {
      query.invoiceType = invoiceType;
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    // Get payments with populated data
    const Payment = (await import("../models/payment.model.js")).default;
    
    const payments = await Payment.find(query)
      .populate("appointmentId", "scheduledStart status mode")
      .populate("billTo.patientId", "fullName phone dob gender")
      .populate("billFrom.doctorId", "fullName")
      .populate("billFrom.clinicId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Payment.countDocuments(query);

    // Format invoices for response
    const formattedInvoices = payments.map((payment) => ({
      _id: payment._id,
      invoiceNumber: payment.invoiceNumber,
      invoiceType: payment.invoiceType,
      orderCode: payment.orderCode || payment.pendingOrderCode || null,
      appointmentId: payment.appointmentId?._id,
      appointmentDate: payment.appointmentId?.scheduledStart,
      appointmentStatus: payment.appointmentId?.status,
      appointmentMode: payment.appointmentId?.mode,
      patientName: payment.billTo?.name || payment.billTo?.patientId?.fullName || "N/A",
      patientPhone: payment.billTo?.phone || payment.billTo?.patientId?.phone || null,
      patientDateOfBirth: payment.billTo?.patientId?.dob || null,
      patientGender: payment.billTo?.patientId?.gender || null,
      doctorName: payment.billFrom?.doctorName || payment.billFrom?.doctorId?.fullName || "N/A",
      clinicName: payment.billFrom?.clinicName || payment.billFrom?.clinicId?.name || null,
      items: payment.items || [],
      subtotal: payment.subtotal,
      discount: payment.discount || 0,
      total: payment.total,
      gateway: payment.gateway,
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt || payment.capturedAt || payment.createdAt,
      createdAt: payment.createdAt,
      currency: payment.currency || "VND",
    }));

    return res.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching manager invoices:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tải danh sách hóa đơn",
      error: error.message,
    });
  }
}

/**
 * Delete invoice (payment) for manager
 * Only allows deletion of pending or cancelled invoices
 * DELETE /api/managers/invoices/:invoiceId
 */
export async function deleteManagerInvoice(req, res) {
  try {
    const { invoiceId } = req.params;

    if (!invoiceId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Invoice ID is required"
      );
    }

    const Payment = (await import("../models/payment.model.js")).default;
    
    // Find the payment/invoice
    const payment = await Payment.findById(invoiceId);

    if (!payment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Invoice not found");
    }

    // Only allow deletion of pending or cancelled invoices
    // Do not allow deletion of paid invoices
    if (payment.status === "paid") {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Cannot delete a paid invoice. Only pending or cancelled invoices can be deleted."
      );
    }

    // Delete the payment/invoice
    await Payment.findByIdAndDelete(invoiceId);

    console.log(`✅ Manager deleted invoice ${invoiceId}`);

    return ok(res, {
      message: "Invoice deleted successfully",
      deletedInvoiceId: invoiceId,
    });
  } catch (error) {
    console.error("❌ deleteManagerInvoice error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Get doctor pricing for a specific doctor
 * Manager can view pricing for any doctor
 */
export async function getDoctorPricingForManager(req, res) {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    // Get all pricing for this doctor
    const pricingList = await DoctorRate.find({
      doctorId: doctor._id,
      isActive: true,
    })
      .populate("clinicId", "name address")
      .sort({ mode: 1, createdAt: -1 })
      .lean();

    return ok(res, {
      doctor: {
        _id: doctor._id,
        fullName: doctor.fullName,
      },
      pricing: pricingList,
    });
  } catch (error) {
    console.error("❌ getDoctorPricingForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Create or update doctor pricing
 * Manager can set pricing for any doctor
 */
export async function setDoctorPricingForManager(req, res) {
  try {
    const { doctorId } = req.params;
    const { mode, clinicId, weekdayPrice, weekendPrice, isActive } = req.body;

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    if (!mode || !weekdayPrice || !weekendPrice) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Mode, weekdayPrice, and weekendPrice are required"
      );
    }

    if (mode !== "online" && mode !== "offline") {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Mode must be 'online' or 'offline'"
      );
    }

    if (mode === "offline" && !clinicId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Clinic ID is required for offline mode"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    // Verify clinic exists if offline mode
    if (mode === "offline") {
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        return fail(res, 404, ERROR_CODES.NOT_FOUND, "Clinic not found");
      }
    }

    // Check if pricing already exists
    const existingPricing = await DoctorRate.findOne({
      doctorId: doctor._id,
      mode: mode,
      ...(mode === "offline" && { clinicId: clinicId }),
      ...(mode === "online" && { clinicId: { $exists: false } }),
    });

    let pricing;
    if (existingPricing) {
      // Update existing pricing
      existingPricing.weekdayPrice = weekdayPrice;
      existingPricing.weekendPrice = weekendPrice;
      if (isActive !== undefined) {
        existingPricing.isActive = isActive;
      }
      await existingPricing.save();
      pricing = existingPricing;
      console.log(`✅ Updated pricing for doctor ${doctor.fullName}`);
    } else {
      // Create new pricing
      pricing = await DoctorRate.create({
        doctorId: doctor._id,
        mode: mode,
        ...(mode === "offline" && { clinicId: clinicId }),
        weekdayPrice: weekdayPrice,
        weekendPrice: weekendPrice,
        isActive: isActive !== undefined ? isActive : true,
      });
      console.log(`✅ Created new pricing for doctor ${doctor.fullName}`);
    }

    // If doctor is verified but not active, check if they can now be active
    // (they might have just set their pricing)
    if (doctor.isVerified && !doctor.isActive) {
      const activeCheck = await checkDoctorCanBeActive(doctor._id);
      if (activeCheck.canBeActive) {
        doctor.isActive = true;
        await doctor.save();
        console.log(
          `✅ Doctor ${doctor.fullName} (ID: ${doctor._id}) is now active after setting pricing`
        );
      }
    }

    return ok(res, {
      message: existingPricing
        ? "Pricing updated successfully"
        : "Pricing created successfully",
      pricing: pricing,
    });
  } catch (error) {
    console.error("❌ setDoctorPricingForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Delete doctor pricing
 * Manager can delete pricing for any doctor
 */
export async function deleteDoctorPricingForManager(req, res) {
  try {
    const { doctorId, pricingId } = req.params;

    if (!doctorId || !pricingId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Doctor ID and Pricing ID are required"
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    // Find and delete pricing
    const pricing = await DoctorRate.findOneAndDelete({
      _id: pricingId,
      doctorId: doctor._id,
    });

    if (!pricing) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Pricing not found or does not belong to this doctor"
      );
    }

    console.log(`✅ Deleted pricing for doctor ${doctor.fullName}`);

    return ok(res, {
      message: "Pricing deleted successfully",
      deletedPricingId: pricingId,
    });
  } catch (error) {
    console.error("❌ deleteDoctorPricingForManager error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}
