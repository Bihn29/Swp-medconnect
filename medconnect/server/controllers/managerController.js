import Doctor from "../models/doctor.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

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
      .select(
        "fullName avatarUrl specializationIds ratingAvg ratingCount isVerified"
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

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

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

    const timeSlots = await DoctorTimeSlot.find(filter)
      .populate({
        path: "appointmentId",
        select: "status mode reason patientId scheduledStart scheduledEnd",
        populate: {
          path: "patientId",
          select: "fullName phone",
        },
      })
      .sort({ startAt: 1 })
      .limit(parseInt(limit))
      .lean();

    // Format slots similar to doctor's own view
    const formattedSlots = timeSlots.map((slot) => {
      const appointment = slot.appointmentId;
      let patientName = null;
      let appointmentStatus = null;
      let reason = null;
      let mode = null;

      if (appointment) {
        patientName = appointment.patientId?.fullName || null;
        appointmentStatus = appointment.status || null;
        reason = appointment.reason || null;
        mode = appointment.mode || null;
      }

      const isAvailable = !appointment && slot.status === "available";

      return {
        _id: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: slot.status,
        patientName,
        appointmentId: appointment?._id || null,
        appointmentStatus,
        reason,
        mode,
        available: isAvailable,
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
    console.error("Error fetching doctor time slots for manager:", error);
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
      patientName,
      patientPhone,
      reason,
      mode,
      scheduledStart,
      scheduledEnd,
    } = req.body;

    if (
      !doctorId ||
      !patientName ||
      !patientPhone ||
      !reason ||
      !mode ||
      !scheduledStart ||
      !scheduledEnd
    ) {
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

    // Find or create patient
    let patient = await Patient.findOne({ phone: patientPhone });
    if (!patient) {
      // Create a basic patient profile
      const user = await User.findOne({ phone: patientPhone });
      let userId = user?._id;

      if (!userId) {
        // Create a basic user account
        const newUser = new User({
          phone: patientPhone,
          fullName: patientName,
          role: "patient",
          status: "active",
        });
        await newUser.save();
        userId = newUser._id;
      }

      patient = new Patient({
        userId,
        fullName: patientName,
        phone: patientPhone,
        isProfileComplete: false,
      });
      await patient.save();
    }

    // Create appointment (similar to doctor's createAppointmentByDoctor)
    const appointmentData = {
      patientId: patient._id,
      doctorId: doctor._id,
      slotId: slotId || null,
      mode,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
      reason,
      status: "pending_doctor",
    };

    const appointment = await Appointment.create(appointmentData);

    // Update slot status if slotId provided
    if (slotId) {
      await DoctorTimeSlot.findByIdAndUpdate(slotId, {
        status: "booked",
        appointmentId: appointment._id,
      });
    }

    return ok(res, { appointment });
  } catch (error) {
    console.error("Error creating appointment by manager:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}
