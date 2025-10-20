import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Specialization from "../models/specialization.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Appointment from "../models/appointment.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Get current patient profile with full information
 */
export async function getCurrentPatientProfile(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    // Find user by app_user_id
    const user = await User.findById(appUserId).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    // Find patient profile
    const patient = await Patient.findOne({ userId: appUserId }).lean();

    // Combine user and patient data
    const profileData = {
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: patient
        ? {
            _id: patient._id,
            fullName: patient.fullName,
            dob: patient.dob,
            gender: patient.gender,
            nationalId: patient.nationalId,
            phone: patient.phone,
            address: patient.address,
            wardCode: patient.wardCode,
            districtCode: patient.districtCode,
            provinceCode: patient.provinceCode,
            bloodType: patient.bloodType,
            allergyNotes: patient.allergyNotes,
            relationshipToOwner: patient.relationshipToOwner,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            isComplete: !!(
              patient.fullName &&
              patient.dob &&
              patient.gender &&
              patient.phone
            ),
          }
        : null,
    };

    return ok(res, profileData);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Update patient profile
 */
export async function updatePatientProfile(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    const updateData = req.body;

    // Update user basic info
    const userUpdate = {};
    if (updateData.fullName) userUpdate.fullName = updateData.fullName;
    if (updateData.phone) userUpdate.phone = updateData.phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(appUserId, userUpdate);
    }

    // Update or create patient profile
    const patientUpdate = {
      userId: appUserId,
      fullName: updateData.fullName,
      dob: updateData.dob,
      gender: updateData.gender,
      nationalId: updateData.nationalId,
      phone: updateData.phone,
      address: updateData.address,
      wardCode: updateData.wardCode,
      districtCode: updateData.districtCode,
      provinceCode: updateData.provinceCode,
      bloodType: updateData.bloodType,
      allergyNotes: updateData.allergyNotes,
    };

    const patient = await Patient.findOneAndUpdate(
      { userId: appUserId },
      patientUpdate,
      { upsert: true, new: true }
    );

    return ok(res, {
      message: "Profile updated successfully",
      profile: patient,
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get all specializations for appointment booking
 */
export async function getSpecializations(req, res) {
  try {
    const specializations = await Specialization.find({})
      .select("_id name description")
      .sort({ name: 1 })
      .lean();

    return ok(res, { specializations });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get doctors by specialization
 */
export async function getDoctorsBySpecialization(req, res) {
  try {
    const { specializationId } = req.params;

    if (!specializationId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Specialization ID is required"
      );
    }

    const doctors = await Doctor.find({
      specializationIds: specializationId,
      isVerified: true,
    })
      .populate("specializationIds", "name")
      .select(
        "_id fullName bio avatarUrl specializationIds ratingCount ratingAvg yearsExperience"
      )
      .sort({ ratingAvg: -1 })
      .lean();

    return ok(res, { doctors });
  } catch (error) {
    console.error("Error fetching doctors by specialization:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get available time slots for a doctor
 */
export async function getDoctorTimeSlots(req, res) {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    if (!date) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Date is required");
    }

    // Parse date and create date range for the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get available time slots for the doctor on the specified date
    const timeSlots = await DoctorTimeSlot.find({
      doctorId: doctorId,
      startAt: { $gte: startDate, $lte: endDate },
      status: "available",
    })
      .sort({ startAt: 1 })
      .lean();

    // Format time slots for frontend
    const formattedSlots = timeSlots.map((slot) => ({
      _id: slot._id,
      startTime: slot.startAt.toTimeString().slice(0, 5), // HH:MM format
      endTime: slot.endAt.toTimeString().slice(0, 5),
      timeRange: `${slot.startAt.toTimeString().slice(0, 5)} - ${slot.endAt
        .toTimeString()
        .slice(0, 5)}`,
      available: slot.status === "available",
    }));

    return ok(res, { timeSlots: formattedSlots });
  } catch (error) {
    console.error("Error fetching doctor time slots:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Book an appointment
 */
export async function bookAppointment(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    const {
      doctorId,
      slotId,
      mode, // "online" or "offline"
      clinicId, // required if mode is "offline"
      reason,
      scheduledStart,
      scheduledEnd,
    } = req.body;

    // Validate required fields
    if (!doctorId || !slotId || !mode || !scheduledStart || !scheduledEnd) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Missing required fields"
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

    // Get or create patient profile
    let patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      return fail(
        res,
        404,
        ERROR_CODES.USER_NOT_FOUND,
        "Patient profile not found. Please complete your profile first."
      );
    }

    // Verify the time slot exists and is available
    const timeSlot = await DoctorTimeSlot.findById(slotId);
    if (!timeSlot) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Time slot not found");
    }

    if (timeSlot.status !== "available") {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Time slot is no longer available"
      );
    }

    if (timeSlot.doctorId.toString() !== doctorId) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Time slot does not belong to the selected doctor"
      );
    }

    // TODO: Comment out payment validation for now
    // Check if payment is required and completed
    // const doctor = await Doctor.findById(doctorId);
    // if (doctor.requiresPayment && !paymentId) {
    //   return fail(res, 400, ERROR_CODES.PAYMENT_REQUIRED, "Payment is required for this appointment");
    // }

    // Create appointment with pending_doctor status
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId: doctorId,
      slotId: slotId,
      mode: mode,
      clinicId: mode === "offline" ? clinicId : undefined,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
      status: "pending_doctor", // Waiting for doctor approval
      reason: reason,
      // TODO: Comment out payment-related fields for now
      // paymentId: paymentId,
      // patientPaidAt: paymentId ? new Date() : undefined,
      autoExpireAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    });

    await appointment.save();

    // Update time slot status to booked
    await DoctorTimeSlot.findByIdAndUpdate(slotId, { status: "booked" });

    // Populate appointment data for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "fullName phone")
      .populate("doctorId", "fullName")
      .populate("slotId", "startAt endAt")
      .lean();

    return ok(res, {
      message: "Appointment booked successfully. Waiting for doctor approval.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);

    // Handle duplicate slot booking error
    if (error.code === 11000) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "This time slot has already been booked"
      );
    }

    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get patient's appointments
 */
export async function getPatientAppointments(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    // Find patient by user ID
    const patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      return fail(
        res,
        404,
        ERROR_CODES.USER_NOT_FOUND,
        "Patient profile not found"
      );
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { patientId: patient._id };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "doctorId",
        select: "fullName specializationIds avatarUrl",
        populate: {
          path: "specializationIds",
          select: "name",
        },
      })
      .populate("slotId", "startAt endAt")
      .populate("clinicId", "name address")
      .sort({ scheduledStart: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Appointment.countDocuments(query);

    return ok(res, {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Cancel patient appointment
 */
export async function cancelPatientAppointment(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    const { appointmentId } = req.params;
    const { cancelReason } = req.body;

    // Find patient by user ID
    const patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      return fail(
        res,
        404,
        ERROR_CODES.USER_NOT_FOUND,
        "Patient profile not found"
      );
    }

    // Find appointment belonging to this patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    // Check if appointment can be cancelled
    if (appointment.status === "cancelled") {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Appointment is already cancelled"
      );
    }

    if (appointment.status === "done") {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Cannot cancel completed appointment"
      );
    }

    // Update appointment status
    const updateData = {
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: appUserId,
    };

    if (cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
      .populate("doctorId", "fullName specializationIds avatarUrl")
      .populate("slotId", "startAt endAt")
      .populate("clinicId", "name address");

    return ok(res, {
      appointment: updatedAppointment,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling patient appointment:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}
