import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Specialization from "../models/specialization.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Appointment from "../models/appointment.model.js";
import ConsultationSummary from "../models/consultationSummary.model.js";
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
            ethnicity: patient.ethnicity,
            nationality: patient.nationality,
            occupation: patient.occupation,
            citizenId: patient.citizenId,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            houseNumber: patient.houseNumber,
            // Bảo hiểm y tế
            insuranceNumber: patient.insuranceNumber,
            primaryClinic: patient.primaryClinic,
            insuranceValidFrom: patient.insuranceValidFrom,
            insuranceValidTo: patient.insuranceValidTo,
            // Người đại diện
            representativeName: patient.representativeName,
            representativeCitizenId: patient.representativeCitizenId,
            representativeRelation: patient.representativeRelation,
            representativePhone: patient.representativePhone,
            // Liên hệ khẩn cấp
            emergencyContactName: patient.emergencyContactName,
            emergencyContactPhone: patient.emergencyContactPhone,
            // Thông tin y tế
            bloodType: patient.bloodType,
            allergyNotes: patient.allergyNotes,
            medicalHistory: patient.medicalHistory,
            vaccinationHistory: patient.vaccinationHistory,
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

    // Validate insurance dates
    if (updateData.insuranceValidFrom && updateData.insuranceValidTo) {
      const fromDate = new Date(updateData.insuranceValidFrom);
      const toDate = new Date(updateData.insuranceValidTo);

      if (fromDate >= toDate) {
        validationErrors.insuranceValidTo =
          "Ngày hết hạn phải sau ngày có hiệu lực";
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

    if (
      updateData.emergencyContactPhone &&
      !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(
        updateData.emergencyContactPhone.replace(/\s/g, "")
      )
    ) {
      validationErrors.emergencyContactPhone =
        "Số điện thoại liên hệ khẩn cấp không đúng định dạng";
    }

    // Validate text length
    if (updateData.allergyNotes && updateData.allergyNotes.length > 500) {
      validationErrors.allergyNotes = "Ghi chú dị ứng không được quá 500 ký tự";
    }

    if (updateData.notes && updateData.notes.length > 1000) {
      validationErrors.notes = "Ghi chú không được quá 1000 ký tự";
    }

    // Validate insurance number format
    if (
      updateData.insuranceNumber &&
      !/^[0-9]{10,15}$/.test(updateData.insuranceNumber.replace(/\s/g, ""))
    ) {
      validationErrors.insuranceNumber = "Số thẻ BHYT phải có 10-15 chữ số";
    }

    // Validate primary clinic name
    if (updateData.primaryClinic) {
      if (updateData.primaryClinic.trim().length < 3) {
        validationErrors.primaryClinic =
          "Tên cơ sở y tế phải có ít nhất 3 ký tự";
      } else if (updateData.primaryClinic.length > 200) {
        validationErrors.primaryClinic =
          "Tên cơ sở y tế không được quá 200 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s\d\-.,()]+$/.test(updateData.primaryClinic)) {
        validationErrors.primaryClinic =
          "Tên cơ sở y tế chỉ được chứa chữ cái, số và ký tự đặc biệt cơ bản";
      }
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

    // Validate emergency contact name
    if (updateData.emergencyContactName) {
      if (updateData.emergencyContactName.trim().length < 2) {
        validationErrors.emergencyContactName =
          "Họ tên người liên hệ khẩn cấp phải có ít nhất 2 ký tự";
      } else if (updateData.emergencyContactName.length > 100) {
        validationErrors.emergencyContactName =
          "Họ tên người liên hệ khẩn cấp không được quá 100 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(updateData.emergencyContactName)) {
        validationErrors.emergencyContactName =
          "Họ tên chỉ được chứa chữ cái và khoảng trắng";
      }
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
      nationality: updateData.nationality,
      occupation: updateData.occupation,
      citizenId: updateData.citizenId,
      phone: updateData.phone,
      email: updateData.email,
      address: updateData.address,
      houseNumber: updateData.houseNumber,
      // Bảo hiểm y tế
      insuranceNumber: updateData.insuranceNumber,
      primaryClinic: updateData.primaryClinic,
      insuranceValidFrom: updateData.insuranceValidFrom,
      insuranceValidTo: updateData.insuranceValidTo,
      // Người đại diện
      representativeName: updateData.representativeName,
      representativeCitizenId: updateData.representativeCitizenId,
      representativeRelation: updateData.representativeRelation,
      representativePhone: updateData.representativePhone,
      // Liên hệ khẩn cấp
      emergencyContactName: updateData.emergencyContactName,
      emergencyContactPhone: updateData.emergencyContactPhone,
      // Thông tin y tế
      bloodType: updateData.bloodType,
      allergyNotes: updateData.allergyNotes,
      medicalHistory: updateData.medicalHistory,
      vaccinationHistory: updateData.vaccinationHistory,
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

    const { status, page = 1, limit = 50 } = req.query;

    const query = { patientId: patient._id };
    if (status) {
      query.status = status;
    }

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
              .map((med) => `${med.name} - ${med.dosage} - ${med.instruction}`)
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
          followUpInstruction: summary.followUpInstruction,
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
