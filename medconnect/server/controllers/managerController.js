import Doctor from "../models/doctor.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import DoctorScheduleRule from "../models/doctor_schedule_rules.model.js";
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
    const appointments = await Appointment.find({
      slotId: { $in: slotIds },
      // Filter out appointments that are rescheduled AND have been replaced
      $nor: [
        {
          status: "rescheduled",
          rescheduledToId: { $exists: true, $ne: null },
        },
      ],
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
      .lean();

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    return ok(res, appointment);
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
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 1); // 1 month instead of 14 days
    endDate.setHours(23, 59, 59, 999);

    console.log("🔍 Creating slots from:", today.toISOString().split("T")[0]);
    console.log(
      "🔍 Creating slots until:",
      endDate.toISOString().split("T")[0]
    );

    // Check how many future slots already exist
    const existingFutureSlots = await DoctorTimeSlot.countDocuments({
      doctorId: doctor._id,
      startAt: { $gte: today },
    });

    console.log(`📊 Existing future slots: ${existingFutureSlots}`);

    // Only create slots if we have less than 100 future slots
    // This prevents creating slots too frequently
    if (existingFutureSlots >= 100) {
      console.log(
        `⏭️ Skipping slot generation - already have ${existingFutureSlots} future slots (>= 100)`
      );
      return ok(res, {
        message: `No new slots created. Doctor already has ${existingFutureSlots} future slots.`,
        createdSlots: 0,
        skippedSlots: 0,
        existingSlots: existingFutureSlots,
        note: "Slots are only auto-generated when doctor has less than 100 future slots.",
      });
    }

    const createdSlots = [];
    const skippedSlots = [];

    // Calculate number of days in the month
    const daysInMonth = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let dayOffset = 0; dayOffset < daysInMonth; dayOffset++) {
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
      message: `Generated ${createdSlots.length} new time slots for doctor ${doctor.fullName} based on schedule rules (next month)`,
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
