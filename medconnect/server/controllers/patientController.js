import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Specialization from "../models/specialization.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Appointment from "../models/appointment.model.js";
import ConsultationSummary from "../models/consultationSummary.model.js";
import ConsultationAdvice from "../models/consultationAdvice.model.js";
import {
  createBookingNotification,
  createAppointmentNotification,
} from "../services/notificationService.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Cancel appointment by patient
 */
export async function cancelAppointment(req, res) {
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

    // Find patient
    const patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      return fail(
        res,
        404,
        ERROR_CODES.USER_NOT_FOUND,
        "Patient profile not found"
      );
    }

    // Find appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
    });

    if (!appointment) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Appointment not found or does not belong to this patient"
      );
    }

    // Check if appointment can be cancelled
    if (!["pending_doctor", "accepted"].includes(appointment.status)) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Appointment cannot be cancelled in current status"
      );
    }

    // Update appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: appUserId,
        cancelReason: cancelReason || "Cancelled by patient",
      },
      { new: true }
    )
      .populate("patientId", "fullName phone")
      .populate("doctorId", "fullName")
      .populate("slotId", "startAt endAt")
      .lean();

    // Free up the time slot
    await DoctorTimeSlot.findByIdAndUpdate(appointment.slotId, {
      status: "available",
    });

    // Create notification for doctor about cancellation
    try {
      await createAppointmentNotification(appointmentId, "cancelled", {
        cancelReason: cancelReason || "Cancelled by patient",
      });
      console.log(
        `✅ Cancellation notification created for appointment ${appointmentId}`
      );
    } catch (notificationError) {
      console.error(
        "❌ Error creating cancellation notification:",
        notificationError
      );
      // Don't fail the main request if notification fails
    }

    return ok(res, {
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get current patient profile with full information
 */
export async function getCurrentPatientProfile(req, res) {
  try {
    const claims = req.user || {};

    // Try to get app_user_id first, fall back to email-based lookup
    let appUserId = claims.app_user_id;
    let user;

    if (appUserId) {
      // Use app_user_id if available
      user = await User.findById(appUserId).lean();
    } else {
      // Fall back to email-based lookup (compatible with Google login)
      const userEmail = claims.email;
      if (!userEmail) {
        console.log("❌ No app_user_id or email found in token");
        return fail(
          res,
          401,
          ERROR_CODES.UNAUTHORIZED,
          "User ID or email not found in token"
        );
      }

      console.log("🔍 Looking up user by email:", userEmail);
      user = await User.findOne({ email: userEmail }).lean();

      if (user) {
        appUserId = user._id;
      }
    }

    if (!user) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    console.log("👤 Found user:", {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    });

    // Find patient profile, create if not exists
    let patient = await Patient.findOne({ userId: appUserId }).lean();

    if (!patient) {
      // Create a basic patient profile if it doesn't exist
      console.log("Creating new patient profile for user:", appUserId);
      const newPatient = new Patient({
        userId: appUserId,
        fullName: user.fullName || "Chưa cập nhật",
        phone: user.phone || "",
        isComplete: false,
      });

      await newPatient.save();
      patient = newPatient.toObject();
      console.log("Created patient profile:", patient._id);
    }

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
            ethnicity: patient.ethnicity,
            occupation: patient.occupation,
            citizenId: patient.citizenId,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            houseNumber: patient.houseNumber,
            // Người đại diện
            representativeName: patient.representativeName,
            representativeCitizenId: patient.representativeCitizenId,
            representativeRelation: patient.representativeRelation,
            representativePhone: patient.representativePhone,
            // Thông tin y tế
            bloodType: patient.bloodType,
            allergyNotes: patient.allergyNotes,
            medicalHistory: patient.medicalHistory,
            // Ghi chú
            notes: patient.notes,
            // Legacy fields
            nationalId: patient.nationalId,
            wardCode: patient.wardCode,
            districtCode: patient.districtCode,
            provinceCode: patient.provinceCode,
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

    // Try to get app_user_id first, fall back to email-based lookup
    let appUserId = claims.app_user_id;

    if (!appUserId) {
      // Fall back to email-based lookup
      const userEmail = claims.email;
      if (!userEmail) {
        return fail(
          res,
          401,
          ERROR_CODES.UNAUTHORIZED,
          "User ID or email not found in token"
        );
      }

      const user = await User.findOne({ email: userEmail }).lean();
      if (!user) {
        return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
      }
      appUserId = user._id;
    }

    const updateData = req.body;

    // Server-side validation
    const validationErrors = {};

    // Validate required fields
    if (updateData.fullName && updateData.fullName.trim().length < 2) {
      validationErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Validate email format
    if (
      updateData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)
    ) {
      validationErrors.email = "Email không đúng định dạng";
    }

    // Validate phone format
    if (
      updateData.phone &&
      !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(updateData.phone.replace(/\s/g, ""))
    ) {
      validationErrors.phone = "Số điện thoại không đúng định dạng";
    }

    // Validate date of birth
    if (updateData.dob) {
      const birthDate = new Date(updateData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        validationErrors.dob = "Ngày sinh không thể là tương lai";
      } else if (age > 120) {
        validationErrors.dob = "Tuổi không hợp lệ";
      }
    }

    // Validate citizen ID format
    if (updateData.citizenId && !/^[0-9]{9,12}$/.test(updateData.citizenId)) {
      validationErrors.citizenId = "CCCD/CMND phải có 9-12 chữ số";
    }

    // Validate representative citizen ID
    if (
      updateData.representativeCitizenId &&
      !/^[0-9]{9,12}$/.test(updateData.representativeCitizenId)
    ) {
      validationErrors.representativeCitizenId =
        "CCCD/CMND người đại diện phải có 9-12 chữ số";
    }

    // Validate phone numbers
    if (
      updateData.representativePhone &&
      !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(
        updateData.representativePhone.replace(/\s/g, "")
      )
    ) {
      validationErrors.representativePhone =
        "Số điện thoại người đại diện không đúng định dạng";
    }

    // Validate representative name
    if (updateData.representativeName) {
      if (updateData.representativeName.trim().length < 2) {
        validationErrors.representativeName =
          "Họ tên người đại diện phải có ít nhất 2 ký tự";
      } else if (updateData.representativeName.length > 100) {
        validationErrors.representativeName =
          "Họ tên người đại diện không được quá 100 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(updateData.representativeName)) {
        validationErrors.representativeName =
          "Họ tên chỉ được chứa chữ cái và khoảng trắng";
      }
    }

    // Validate text length
    if (updateData.allergyNotes && updateData.allergyNotes.length > 500) {
      validationErrors.allergyNotes = "Ghi chú dị ứng không được quá 500 ký tự";
    }

    if (updateData.notes && updateData.notes.length > 1000) {
      validationErrors.notes = "Ghi chú không được quá 1000 ký tự";
    }

    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      return fail(
        res,
        400,
        ERROR_CODES.VALIDATION_ERROR,
        "Dữ liệu không hợp lệ",
        validationErrors
      );
    }

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
      ethnicity: updateData.ethnicity,
      occupation: updateData.occupation,
      citizenId: updateData.citizenId,
      phone: updateData.phone,
      email: updateData.email,
      address: updateData.address,
      houseNumber: updateData.houseNumber,
      // Người đại diện
      representativeName: updateData.representativeName,
      representativeCitizenId: updateData.representativeCitizenId,
      representativeRelation: updateData.representativeRelation,
      representativePhone: updateData.representativePhone,
      // Thông tin y tế
      bloodType: updateData.bloodType,
      allergyNotes: updateData.allergyNotes,
      medicalHistory: updateData.medicalHistory,
      // Ghi chú
      notes: updateData.notes,
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

    // Get all appointments using these slots to check if they're really available
    const slotIds = timeSlots.map((slot) => slot._id);
    const appointments = await Appointment.find({
      slotId: { $in: slotIds },
      status: {
        $in: [
          "pending_doctor",
          "accepted",
          "in_progress",
          // Exclude cancelled, rejected, no_show, done, rescheduled
        ],
      },
    })
      .select("slotId")
      .lean();

    // Create a set of booked slot IDs
    const bookedSlotIds = new Set(
      appointments.map((apt) => apt.slotId?.toString())
    );

    // Filter out slots that are booked by active appointments
    const reallyAvailableSlots = timeSlots.filter(
      (slot) => !bookedSlotIds.has(slot._id.toString())
    );

    // Format time slots for frontend
    const formattedSlots = reallyAvailableSlots.map((slot) => ({
      _id: slot._id,
      startAt: slot.startAt, // Keep original for datetime calculation
      endAt: slot.endAt,
      startTime: slot.startAt.toTimeString().slice(0, 5), // HH:MM format
      endTime: slot.endAt.toTimeString().slice(0, 5),
      timeRange: `${slot.startAt.toTimeString().slice(0, 5)} - ${slot.endAt
        .toTimeString()
        .slice(0, 5)}`,
      available: true,
      status: "available",
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
      patientId, // Optional: specific patient ID for family member booking
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

    // Get patient profile
    let patient;
    if (patientId) {
      // If patientId is provided, use that patient (for family member booking)
      patient = await Patient.findOne({
        _id: patientId,
        userId: appUserId, // Verify the patient belongs to this user
      });

      if (!patient) {
        return fail(
          res,
          403,
          ERROR_CODES.UNAUTHORIZED,
          "Patient not found or does not belong to you"
        );
      }
    } else {
      // Otherwise, get or create the user's own patient profile
      patient = await Patient.findOne({ userId: appUserId });
      if (!patient) {
        // Create a basic patient profile if it doesn't exist
        console.log("Creating new patient profile for user:", appUserId);
        const user = await User.findById(appUserId);
        if (!user) {
          return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
        }

        const newPatient = new Patient({
          userId: appUserId,
          fullName: user.fullName || "Chưa cập nhật",
          phone: user.phone || "",
          isComplete: false,
        });

        await newPatient.save();
        patient = newPatient;
        console.log("Created patient profile:", patient._id);
      }
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

    // Create appointment with pending_doctor status and unpaid paymentStatus
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId: doctorId,
      slotId: slotId,
      mode: mode,
      clinicId: mode === "offline" ? clinicId : undefined,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
      status: "pending_doctor", // Waiting for doctor approval
      paymentStatus: "unpaid", // Initially unpaid
      // paymentDeadline không set - không giới hạn thời gian thanh toán
      reason: reason,
      autoExpireAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    });

    await appointment.save();

    // Update time slot status to booked
    await DoctorTimeSlot.findByIdAndUpdate(slotId, { status: "booked" });

    // Create notification for doctor about new appointment
    try {
      await createBookingNotification(appointment._id);
      console.log(
        `✅ Booking notification created for appointment ${appointment._id}`
      );
    } catch (notificationError) {
      console.error(
        "❌ Error creating booking notification:",
        notificationError
      );
      // Don't fail the main request if notification fails
    }

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

    // Try to get app_user_id first, fall back to email-based lookup
    let appUserId = claims.app_user_id;
    let user;

    if (appUserId) {
      user = await User.findById(appUserId).lean();
    } else {
      const userEmail = claims.email;
      if (!userEmail) {
        return fail(
          res,
          401,
          ERROR_CODES.UNAUTHORIZED,
          "User ID or email not found in token"
        );
      }
      user = await User.findOne({ email: userEmail }).lean();
      if (user) {
        appUserId = user._id;
      }
    }

    if (!user) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    // Find patient by user ID, create if not exists
    let patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      // Create a basic patient profile if it doesn't exist
      console.log("Creating new patient profile for user:", appUserId);

      const newPatient = new Patient({
        userId: appUserId,
        fullName: user.fullName || "Chưa cập nhật",
        phone: user.phone || "",
        isComplete: false,
      });

      await newPatient.save();
      patient = newPatient;
      console.log("Created patient profile:", patient._id);
    }

    const { status, page = 1, limit = 50 } = req.query;

    const query = { patientId: patient._id };
    if (status) {
      query.status = status;
    }

    // Exclude rescheduled appointments (they are replaced by new appointments)
    // Only exclude if status is "rescheduled" AND has rescheduledToId
    query.$nor = [
      {
        status: "rescheduled",
        rescheduledToId: { $exists: true, $ne: null },
      },
    ];

    // Debug: Log query and count
    console.log("Patient appointments query:", query);
    const totalCount = await Appointment.countDocuments(query);
    console.log("Total appointments for patient:", totalCount);

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
      .populate({
        path: "rescheduledFromId",
        select: "scheduledStart scheduledEnd status",
      })
      .sort({ scheduledStart: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Debug: Log returned appointments
    console.log("Returned appointments count:", appointments.length);
    console.log(
      "Appointments details:",
      appointments.map((apt) => ({
        id: apt._id,
        status: apt.status,
        scheduledStart: apt.scheduledStart,
        doctor: apt.doctorId?.fullName,
      }))
    );

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

    // Try to get app_user_id first, fall back to email-based lookup
    let appUserId = claims.app_user_id;
    let user;

    if (appUserId) {
      user = await User.findById(appUserId).lean();
    } else {
      const userEmail = claims.email;
      if (!userEmail) {
        return fail(
          res,
          401,
          ERROR_CODES.UNAUTHORIZED,
          "User ID or email not found in token"
        );
      }
      user = await User.findOne({ email: userEmail }).lean();
      if (user) {
        appUserId = user._id;
      }
    }

    if (!user) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    const { appointmentId } = req.params;
    const { cancelReason } = req.body;

    // Find patient by user ID, create if not exists
    let patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      // Create a basic patient profile if it doesn't exist
      console.log("Creating new patient profile for user:", appUserId);

      const newPatient = new Patient({
        userId: appUserId,
        fullName: user.fullName || "Chưa cập nhật",
        phone: user.phone || "",
        isComplete: false,
      });

      await newPatient.save();
      patient = newPatient;
      console.log("Created patient profile:", patient._id);
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

/**
 * Get appointment details by ID
 */
export async function getAppointmentDetails(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;
    const { appointmentId } = req.params;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    // Find patient by userId
    const patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "Patient not found");
    }

    // Get appointment with populated data
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
    })
      .populate({
        path: "doctorId",
        select: "fullName name specializationIds avatarUrl",
        populate: [
          {
            path: "specializationIds",
            select: "name",
          },
          {
            path: "userId",
            select: "phone fullName",
          },
        ],
      })
      .populate("clinicId", "name address")
      .populate("slotId", "startAt endAt")
      .lean();

    // Map phone from userId to doctorId for easier access
    if (appointment?.doctorId?.userId?.phone) {
      appointment.doctorId.phone = appointment.doctorId.userId.phone;
    }

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    console.log("✅ Patient appointment detail fetched:", {
      appointmentId: appointment._id.toString(),
      status: appointment.status,
      hasDoctor: !!appointment.doctorId,
      doctorName: appointment.doctorId?.fullName || appointment.doctorId?.name,
      doctorIdValue: appointment.doctorId,
      appointmentData: JSON.stringify(appointment, null, 2),
    });

    return ok(res, appointment);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    console.error("Error stack:", error.stack);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      "Failed to fetch appointment details"
    );
  }
}

/**
 * Get patient's consultation summaries (medical history)
 */
export async function getPatientConsultationSummaries(req, res) {
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

    const { page = 1, limit = 20 } = req.query;

    // Get consultation summaries for this patient
    const consultationSummaries = await ConsultationSummary.find({
      patientId: patient._id,
      status: "final", // Only get finalized summaries
    })
      .populate({
        path: "doctorId",
        select: "fullName specializationIds avatarUrl",
        populate: {
          path: "specializationIds",
          select: "name",
        },
      })
      .populate("appointmentId", "scheduledStart scheduledEnd mode reason")
      .populate("clinicId", "name address")
      .sort({ visitDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await ConsultationSummary.countDocuments({
      patientId: patient._id,
      status: "final",
    });

    // Format the response for frontend
    const formattedSummaries = consultationSummaries.map((summary) => {
      // Get primary diagnosis
      const primaryDiagnosis =
        summary.diagnoses && summary.diagnoses.length > 0
          ? summary.diagnoses[0].name
          : "Không có chẩn đoán";

      // Format medications
      const medicationsText =
        summary.medications && summary.medications.length > 0
          ? summary.medications
              .map(
                (med) =>
                  `${med.name} - ${med.quantity || "N/A"} - ${med.instruction}`
              )
              .join(", ")
          : "Không có đơn thuốc";

      // Format documents (lab results + imaging results)
      const documents = [];
      if (summary.labResults && summary.labResults.length > 0) {
        summary.labResults.forEach((lab) => {
          documents.push({
            name: `${lab.testName} - Kết quả xét nghiệm.pdf`,
            type: "pdf",
          });
        });
      }
      if (summary.imagingResults && summary.imagingResults.length > 0) {
        summary.imagingResults.forEach((img) => {
          documents.push({
            name: `${img.type} - Kết quả hình ảnh.pdf`,
            type: "pdf",
          });
        });
      }

      return {
        id: summary._id,
        specialty:
          summary.doctorId?.specializationIds?.[0]?.name || "Không xác định",
        date: new Date(summary.visitDate).toLocaleDateString("vi-VN"),
        doctor: `BS. ${summary.doctorId?.fullName || "Không xác định"}`,
        diagnosis: primaryDiagnosis,
        prescription: medicationsText,
        documents: documents,
        // Full details for modal
        fullDetails: {
          reasonForVisit: summary.reasonForVisit,
          visitDate: summary.visitDate,
          treatmentResult: summary.treatmentResult,
          diagnoses: summary.diagnoses,
          vitals: summary.vitals,
          labResults: summary.labResults,
          imagingResults: summary.imagingResults,
          medications: summary.medications,
          procedures: summary.procedures,
          summaryText: summary.summaryText,
          treatmentMethod: summary.treatmentMethod,
          followUpInstructions: summary.followUpInstructions,
          nextAppointmentDate: summary.nextAppointmentDate,
          appointment: summary.appointmentId,
          clinic: summary.clinicId,
        },
      };
    });

    return ok(res, {
      consultationSummaries: formattedSummaries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patient consultation summaries:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get patient's consultation advice (consultation history)
 */
export async function getPatientConsultationAdvice(req, res) {
  try {
    const claims = req.user || {};

    // Try to get app_user_id first, fall back to email-based lookup
    let appUserId = claims.app_user_id;
    let user;

    if (appUserId) {
      user = await User.findById(appUserId).lean();
    } else {
      const userEmail = claims.email;
      if (!userEmail) {
        return fail(
          res,
          401,
          ERROR_CODES.UNAUTHORIZED,
          "User ID or email not found in token"
        );
      }

      user = await User.findOne({ email: userEmail }).lean();
      if (user) {
        appUserId = user._id;
      }
    }

    if (!user) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    // Find patient by user ID, create if not exists
    let patient = await Patient.findOne({ userId: appUserId });
    if (!patient) {
      // Create a basic patient profile if it doesn't exist
      console.log(
        "Creating new patient profile for consultation advice:",
        appUserId
      );

      const newPatient = new Patient({
        userId: appUserId,
        fullName: user.fullName || "Chưa cập nhật",
        phone: user.phone || "",
        isComplete: false,
      });

      await newPatient.save();
      patient = newPatient;
      console.log("Created patient profile:", patient._id);
    }

    const { page = 1, limit = 20 } = req.query;

    // Get consultation advice for this patient
    const consultationAdvice = await ConsultationAdvice.find({
      patientId: patient._id,
    })
      .populate({
        path: "doctorId",
        select: "fullName specializationIds avatarUrl",
        populate: {
          path: "specializationIds",
          select: "name",
        },
      })
      .populate("appointmentId", "scheduledStart scheduledEnd mode reason")
      .populate("clinicId", "name address")
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await ConsultationAdvice.countDocuments({
      patientId: patient._id,
    });

    // Format the response for frontend
    const formattedAdvice = consultationAdvice.map((advice) => {
      // Get primary diagnosis
      const primaryDiagnosis =
        advice.diagnoses && advice.diagnoses.length > 0
          ? advice.diagnoses[0].name
          : "Không có chẩn đoán";

      // Format medications
      const medicationsText =
        advice.medications && advice.medications.length > 0
          ? advice.medications
              .map(
                (med) =>
                  `${med.name} - ${med.quantity || "N/A"} - ${med.instruction}`
              )
              .join(", ")
          : "Không có đơn thuốc";

      // Format documents
      const documents = [];
      if (advice.attachmentUrl) {
        documents.push({
          name: `Tài liệu tư vấn.pdf`,
          type: "pdf",
        });
      }

      // Get date/time from appointment if available, otherwise from advice
      const appointmentStart = advice.appointmentId?.scheduledStart;
      const appointmentEnd = advice.appointmentId?.scheduledEnd;
      const adviceDate = advice.appointmentDate;

      // Use appointment date/time as primary source
      const consultationDateTime = appointmentStart || adviceDate;

      // Safe date handling - format with date and time
      let formattedDate = "Không xác định";
      let formattedDateTime = null; // For full date+time display

      if (appointmentStart) {
        formattedDate = new Date(appointmentStart).toLocaleDateString("vi-VN");
        formattedDateTime = new Date(appointmentStart).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (adviceDate) {
        formattedDate = new Date(adviceDate).toLocaleDateString("vi-VN");
        formattedDateTime = new Date(adviceDate).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Calculate duration
      let duration = "Không xác định";
      if (advice.durationMinutes) {
        // If durationMinutes exists in advice (from old data)
        duration = `${advice.durationMinutes} phút`;
      } else if (appointmentStart && appointmentEnd) {
        // Calculate from appointment time
        const start = new Date(appointmentStart);
        const end = new Date(appointmentEnd);
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        if (diffMinutes > 0) {
          duration = `${diffMinutes} phút`;
        }
      } else if (advice.startedAt && advice.endedAt) {
        // Calculate from startedAt/endedAt if available
        const start = new Date(advice.startedAt);
        const end = new Date(advice.endedAt);
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        if (diffMinutes > 0) {
          duration = `${diffMinutes} phút`;
        }
      }

      // Safe summary handling - check if summary exists and is a string
      const summaryText = advice.summary || advice.notes || "Không có tóm tắt";
      const summaryString =
        typeof summaryText === "string" ? summaryText : String(summaryText);
      const topic =
        summaryString.length > 100
          ? summaryString.substring(0, 100) + "..."
          : summaryString;

      // Get mode from appointment or advice
      const mode = advice.appointmentId?.mode || advice.mode || "offline";

      return {
        id: advice._id,
        type: mode === "online" ? "Video Call" : "Chat",
        date: formattedDate,
        dateTime: formattedDateTime || formattedDate, // Full date+time for display
        doctor: `BS. ${advice.doctorId?.fullName || "Không xác định"}`,
        specialty:
          advice.doctorId?.specializationIds?.[0]?.name || "Không xác định",
        duration: duration,
        topic: topic,
        summary: summaryString,
        documents: documents,
        // Full details for modal
        fullDetails: {
          adviceType: advice.adviceType,
          summary: summaryString,
          startedAt: appointmentStart || advice.startedAt || adviceDate,
          endedAt: appointmentEnd || advice.endedAt,
          durationMinutes:
            advice.durationMinutes ||
            (appointmentStart && appointmentEnd
              ? Math.round(
                  (new Date(appointmentEnd).getTime() -
                    new Date(appointmentStart).getTime()) /
                    (1000 * 60)
                )
              : null),
          consultationDateTime: consultationDateTime,
          diagnoses: advice.diagnoses || [],
          medications: advice.medications || [],
          attachmentUrl: advice.attachmentUrl,
          notes: advice.notes,
          appointment: advice.appointmentId,
          clinic: advice.clinicId,
          doctor: advice.doctorId,
        },
      };
    });

    return ok(res, {
      consultationAdvice: formattedAdvice,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patient consultation advice:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get all family members (all patients under the same userId)
 */
export async function getFamilyMembers(req, res) {
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

    // Get all patients under this userId
    const familyMembers = await Patient.find({ userId: appUserId })
      .select("_id fullName dob gender relationshipToOwner phone avatarUrl")
      .sort({ relationshipToOwner: 1, createdAt: 1 })
      .lean();

    return ok(res, {
      familyMembers,
    });
  } catch (error) {
    console.error("Error fetching family members:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Create a new family member patient profile
 */
export async function createFamilyMember(req, res) {
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
      fullName,
      dob,
      gender,
      relationshipToOwner,
      phone,
      address,
      houseNumber,
      citizenId,
      bloodType,
      allergyNotes,
      medicalHistory,
    } = req.body;

    // Validate required fields
    if (!fullName || !dob || !gender || !relationshipToOwner) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Missing required fields: fullName, dob, gender, relationshipToOwner"
      );
    }

    // Validate relationship (but allow all relationships even for family members)
    const validRelationships = [
      "self",
      "father",
      "mother",
      "spouse",
      "child",
      "grandparent",
      "other",
    ];
    if (!validRelationships.includes(relationshipToOwner)) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid relationship");
    }

    // Validate gender enum
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender)) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid gender");
    }

    // Create new family member patient
    const newPatient = new Patient({
      userId: appUserId,
      fullName,
      dob: new Date(dob),
      gender,
      relationshipToOwner,
      phone,
      address,
      houseNumber,
      citizenId,
      bloodType,
      allergyNotes,
      medicalHistory,
      isComplete: false,
    });

    await newPatient.save();

    return ok(res, {
      message: "Family member created successfully",
      patient: newPatient,
    });
  } catch (error) {
    console.error("Error creating family member:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}
