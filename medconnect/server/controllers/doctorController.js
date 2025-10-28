import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Specialization from "../models/specialization.model.js";
import Clinic from "../models/clinic.model.js";
import ConsultationSummary from "../models/consultationSummary.model.js";
import Prescription from "../models/prescription.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Review from "../models/review.model.js";
import AuthProvider from "../models/auth_providers.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Get doctor profile by ID
 */
export async function getDoctorProfile(req, res) {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone")
      .lean();

    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    return ok(res, { doctor });
  } catch (e) {
    console.error("❌ getDoctorProfile error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get current doctor profile (from authenticated user)
 */
export async function getCurrentDoctorProfile(req, res) {
  try {
    
    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      console.log("❌ User not found by email:", userEmail);
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }
    
    console.log("👤 Found user by email:", user);

    // Find doctor profile
    const doctor = await Doctor.findOne({ userId: user._id })
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name code')
      .populate('clinicDefaultId', 'name address phone')
      .lean();
      
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found for user");
    }
    
    console.log("👨‍⚕️ Found doctor:", doctor);
    console.log("👨‍⚕️ Doctor fullName:", doctor.fullName);
    console.log("👨‍⚕️ User fullName:", doctor.userId?.fullName);
    console.log("👨‍⚕️ Final name:", doctor.userId?.fullName || doctor.fullName);
    return ok(res, { doctor });
  } catch (e) {
    console.error("❌ getCurrentDoctorProfile error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Update doctor profile
 */
export async function updateDoctorProfile(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const {
      fullName,
      email,
      phone,
      licenseNo,
      yearsExperience,
      bio,
      avatarUrl,
      clinicDefaultId,
      specializationIds,
    } = req.body;

    // Update user basic info first (like in updatePatientProfile)
    const userUpdate = {};
    if (fullName) userUpdate.fullName = fullName;
    if (email) userUpdate.email = email;
    if (phone) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      console.log("🔄 Updating User table with:", userUpdate);
      const updatedUser = await User.findByIdAndUpdate(appUserId, userUpdate, { new: true });
      console.log("✅ User table updated:", updatedUser);
    }

    // Update doctor profile
    const doctorUpdateData = {};
    if (fullName) doctorUpdateData.fullName = fullName;
    if (licenseNo) doctorUpdateData.licenseNo = licenseNo;
    if (yearsExperience !== undefined)
      doctorUpdateData.yearsExperience = yearsExperience;
    if (bio) doctorUpdateData.bio = bio;
    if (avatarUrl) doctorUpdateData.avatarUrl = avatarUrl;
    if (clinicDefaultId) doctorUpdateData.clinicDefaultId = clinicDefaultId;
    if (specializationIds) doctorUpdateData.specializationIds = specializationIds;

    console.log("🔄 Updating Doctor table with:", doctorUpdateData);

    const doctor = await Doctor.findOneAndUpdate(
      { userId: appUserId },
      doctorUpdateData,
      { new: true, runValidators: true }
    )
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone");

    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    console.log("✅ Doctor table updated:", doctor);
    console.log("✅ Final User fullName:", doctor.userId?.fullName);
    console.log("✅ Final Doctor fullName:", doctor.fullName);

    return ok(res, { doctor });
  } catch (e) {
    console.error("❌ updateDoctorProfile error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get doctor appointments
 */
export async function getDoctorAppointments(req, res) {
  try {
    console.log("🔍 getDoctorAppointments - req.user:", req.user);
    
    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      console.log("❌ User not found by email:", userEmail);
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }
    
    console.log("👤 Found user by email:", user);

    // Then find the Doctor document by userId
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { status, date, page = 1, limit = 1000 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { doctorId: doctor._id };
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduledStart = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: "patientId",
        select: "fullName dob gender phone email",
        populate: {
          path: "userId",
          select: "email phone"
        }
      })
      .populate("slotId")
      .sort({ scheduledStart: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log("📋 Found appointments:", appointments.length);
    if (appointments.length > 0) {
      console.log("📋 First appointment mode:", appointments[0].mode);
      console.log("📋 All appointment modes:", appointments.map(apt => apt.mode));
    }

    const total = await Appointment.countDocuments(filter);

    return ok(res, {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("❌ getDoctorAppointments error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get doctor dashboard statistics
 */
export async function getDoctorDashboardStats(req, res) {
  try {
    console.log("🔍 getDoctorDashboardStats - req.user:", req.user);
    
    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      console.log("❌ User not found by email:", userEmail);
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }
    
    console.log("👤 Found user by email:", user);

    // Then find the Doctor document by userId
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      scheduledStart: { $gte: startOfDay, $lt: endOfDay },
    });

    // Available slots today
    const availableSlots = await Appointment.countDocuments({
      doctorId: doctor._id,
      scheduledStart: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: "pending",
    });

    // Completed appointments this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: "done",
      scheduledStart: { $gte: startOfMonth },
    });

    return ok(res, {
      stats: {
        todayAppointments,
        availableSlots,
        pendingAppointments,
        completedAppointments,
      },
    });
  } catch (e) {
    console.error("❌ getDoctorDashboardStats error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(req, res) {
  try {
    console.log("🔍 updateAppointmentStatus - req.user:", req.user);
    console.log("🔍 updateAppointmentStatus - req.user.email:", req.user?.email);
    
    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      console.log("❌ User email not found in token");
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }
    
    const { appointmentId } = req.params;
    const { status, cancelReason } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found or does not belong to this doctor");
    }


    // Validate status transition
    const validStatusTransitions = {
      "pending_doctor": ["accepted", "rejected", "cancelled"],
      "accepted": ["in_progress", "cancelled", "done", "no_show"],
      "in_progress": ["done", "cancelled"],
      // "rejected", "cancelled", "done", "no_show" are terminal states or handled by patient
    };

    if (!validStatusTransitions[appointment.status] || !validStatusTransitions[appointment.status].includes(status)) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, `Invalid status transition from ${appointment.status} to ${status}`);
    }

    const updateData = { status };
    
    // Handle different status updates
    if (status === 'accepted') {
      updateData.acceptedBy = doctor._id;
    } else if (status === 'rejected') {
      updateData.rejectedBy = doctor._id;
      updateData.rejectReason = cancelReason; // Use cancelReason as rejectReason
    } else if (status === 'cancelled') {
      updateData.cancelReason = cancelReason;
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = user._id;
    } else if (status === 'no_show') {
      updateData.noShowAt = new Date();
      updateData.noShowBy = doctor._id;
    }

    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
      .populate("patientId", "fullName dob gender phone")
      .populate("slotId");


    return ok(res, { 
      message: "Appointment status updated successfully", 
      appointment: updatedAppointment 
    });
  } catch (e) {
    console.error("❌ updateAppointmentStatus error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get all doctors (for search/listing)
 */
export async function getAllDoctors(req, res) {
  try {
    const {
      specialization,
      search,
      page = 1,
      limit = 10,
      verified,
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    // Only filter by verified if explicitly requested
    if (verified !== undefined) {
      filter.isVerified = verified === "true";
    }

    if (specialization) {
      // Convert string to ObjectId for proper MongoDB query
      try {
        const mongoose = await import("mongoose");
        const specializationObjectId = new mongoose.default.Types.ObjectId(
          specialization
        );
        filter.specializationIds = { $in: [specializationObjectId] };
        console.log(
          "Converted specialization to ObjectId:",
          specializationObjectId
        );
      } catch (error) {
        console.error("Invalid specialization ID:", specialization, error);
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Invalid specialization ID"
        );
      }
    }

    if (search) {
      // Only search by doctor name, not bio
      filter.fullName = { $regex: search, $options: "i" };
    }

    console.log("Doctor filter:", JSON.stringify(filter, null, 2)); // Debug log
    console.log("Specialization parameter:", specialization); // Debug log

    const doctors = await Doctor.find(filter)
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone")
      .sort({ ratingAvg: -1, ratingCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Doctor.countDocuments(filter);

    console.log(`Found ${doctors.length} doctors out of ${total} total`); // Debug log

    return ok(res, {
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("❌ getAllDoctors error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get available time slots for a specific doctor (public endpoint)
 */
export async function getDoctorAvailableTimeSlots(req, res) {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!doctorId) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Doctor ID is required");
    }

    if (!date) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Date is required");
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
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
 * Get consultation records (completed appointments with summaries)
 */
export async function getConsultationRecords(req, res) {
  try {
    console.log("🔍 getConsultationRecords - req.user:", req.user);
    
    // Firebase user object has uid, not app_user_id
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    // First, find the AuthProvider document by Firebase UID
    const authProvider = await AuthProvider.findOne({ 
      providerUid: firebaseUid,
      provider: 'local'
    }).lean();
    
    if (!authProvider) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Auth provider not found");
    }

    // Then find the User document by userId from auth provider
    const user = await User.findById(authProvider.userId).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found in database");
    }

    // Then find the Doctor document by userId
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      doctorId: doctor._id,
      status: "done",
    };

    const appointments = await Appointment.find(filter)
      .populate("patientId", "fullName dob gender phone")
      .populate("slotId")
      .sort({ scheduledStart: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get consultation summaries for these appointments
    const appointmentIds = appointments.map((apt) => apt._id);
    const summaries = await ConsultationSummary.find({
      appointmentId: { $in: appointmentIds },
    }).lean();

    // Get prescriptions for these appointments
    const prescriptions = await Prescription.find({
      appointmentId: { $in: appointmentIds },
    }).lean();

    // Combine data
    const records = appointments.map((appointment) => {
      const summary = summaries.find(
        (s) => s.appointmentId.toString() === appointment._id.toString()
      );
      const prescription = prescriptions.find(
        (p) => p.appointmentId.toString() === appointment._id.toString()
      );

      return {
        ...appointment,
        summary: summary?.summaryText || null,
        prescription: prescription || null,
      };
    });

    const total = await Appointment.countDocuments(filter);

    return ok(res, {
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("❌ getConsultationRecords error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Create consultation summary
 */
export async function createConsultationSummary(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { appointmentId, summaryText, reasonForVisit, visitDate, treatmentResult, 
      consultationCategory, diagnoses, vitals, labResults, imagingResults, medications, 
      procedures, treatmentMethod, nextAppointmentDate } = req.body;

    // Debug logging
    console.log("🔍 Received imagingResults:", JSON.stringify(imagingResults, null, 2));
    console.log("🔍 Type of imagingResults:", typeof imagingResults);
    console.log("🔍 Is array:", Array.isArray(imagingResults));

    if (!appointmentId) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Missing appointmentId"
      );
    }

    // Check if appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    }).populate('patientId clinicId');

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    const summaryData = {
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: doctor._id,
      clinicId: appointment.clinicId?._id,
      appointmentDate: appointment.scheduledStart,
      createdBy: doctor._id,
    }

    // Add optional fields if provided
    if (summaryText !== undefined) summaryData.summaryText = summaryText
    if (reasonForVisit !== undefined) summaryData.reasonForVisit = reasonForVisit
    if (visitDate) summaryData.visitDate = new Date(visitDate)
    if (treatmentResult !== undefined) summaryData.treatmentResult = treatmentResult
    if (consultationCategory !== undefined) summaryData.consultationCategory = consultationCategory
    if (diagnoses && Array.isArray(diagnoses)) summaryData.diagnoses = diagnoses
    if (vitals && typeof vitals === 'object') summaryData.vitals = vitals
    if (labResults && Array.isArray(labResults)) summaryData.labResults = labResults
    if (imagingResults && Array.isArray(imagingResults)) {
      // Filter out empty imaging results and ensure proper structure
      summaryData.imagingResults = imagingResults.filter(img => 
        img && img.imageUrl
      ).map(img => {
        // Ensure all fields are properly formatted
        const processedImg = {
          type: String(img.type || ''),
          conclusion: String(img.conclusion || ''),
          imageUrl: String(img.imageUrl || ''),
          performedAt: img.performedAt ? new Date(img.performedAt) : new Date()
        };
        
        console.log("🔍 Processing individual imaging result:", processedImg);
        return processedImg;
      });
      console.log("🔍 Processed imagingResults:", JSON.stringify(summaryData.imagingResults, null, 2));
    } else if (imagingResults) {
      console.log("⚠️ imagingResults is not an array:", typeof imagingResults, imagingResults);
    }
    if (medications && Array.isArray(medications)) summaryData.medications = medications
    if (procedures && Array.isArray(procedures)) summaryData.procedures = procedures
    if (treatmentMethod !== undefined) summaryData.treatmentMethod = treatmentMethod
    if (nextAppointmentDate) summaryData.nextAppointmentDate = new Date(nextAppointmentDate)

    console.log("🔍 Final summaryData before save:", JSON.stringify(summaryData, null, 2));

    // Validate the data before saving
    if (summaryData.imagingResults && summaryData.imagingResults.length > 0) {
      console.log("🔍 Validating imagingResults before save...");
      summaryData.imagingResults.forEach((img, index) => {
        console.log(`🔍 Imaging result ${index}:`, {
          type: typeof img.type,
          conclusion: typeof img.conclusion,
          imageUrl: typeof img.imageUrl,
          performedAt: typeof img.performedAt,
          isDate: img.performedAt instanceof Date
        });
      });
    }

    const summary = await ConsultationSummary.create(summaryData);

    console.log("✅ Successfully created consultation summary:", summary._id);
    return ok(res, { summary });
  } catch (e) {
    console.error("❌ createConsultationSummary error:", e);
    console.error("❌ Error details:", {
      message: e.message,
      name: e.name,
      stack: e.stack
    });
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Create consultation advice (for online appointments)
 */
export async function createConsultationAdvice(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { appointmentId, notes, attachmentUrl, diagnoses, medications } = req.body;

    if (!appointmentId || !notes) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Missing appointmentId or notes"
      );
    }

    // Check if appointment belongs to this doctor and is online
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
      mode: 'online'
    }).populate('patientId clinicId');

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found or not online");
    }

    // Import ConsultationAdvice model
    const ConsultationAdvice = (await import('../models/consultationAdvice.model.js')).default;

    const adviceData = {
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: doctor._id,
      clinicId: appointment.clinicId?._id,
      appointmentDate: appointment.scheduledStart,
      mode: 'online',
      notes: notes,
      createdBy: doctor._id
    }

    if (attachmentUrl) adviceData.attachmentUrl = attachmentUrl
    if (diagnoses) adviceData.diagnoses = diagnoses
    if (medications) adviceData.medications = medications

    const advice = await ConsultationAdvice.create(adviceData);

    return ok(res, { advice });
  } catch (e) {
    console.error("❌ createConsultationAdvice error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Create prescription
 */
export async function createPrescription(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { appointmentId, diagnosis, note, items } = req.body;

    if (!appointmentId || !items || !Array.isArray(items)) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing required fields");
    }

    // Check if appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    const prescription = await Prescription.create({
      appointmentId,
      diagnosis,
      note,
      items,
      createdBy: doctor._id,
    });

    return ok(res, { prescription });
  } catch (e) {
    console.error("❌ createPrescription error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get doctor clinics
 */
export async function getDoctorClinics(req, res) {
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

    // Get doctor's default clinic and any other clinics they work at
    const clinics = [];
    
    // Add default clinic if exists
    if (doctor.clinicDefaultId) {
      const defaultClinic = await Clinic.findById(doctor.clinicDefaultId);
      if (defaultClinic) {
        clinics.push(defaultClinic);
      }
    }

    // For now, we'll just return the default clinic
    // In the future, you might want to add a many-to-many relationship
    // between doctors and clinics

    return ok(res, { clinics });
  } catch (error) {
    console.error("Error fetching doctor clinics:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get doctor time slots
 */
export async function getDoctorTimeSlots(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { page = 1, limit = 50, date, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { doctorId: doctor._id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.startAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      filter.status = status;
    }

    const slots = await DoctorTimeSlot.find(filter)
      .populate("clinicId", "name address")
      .sort({ startAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await DoctorTimeSlot.countDocuments(filter);

    return ok(res, {
      slots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("❌ getDoctorTimeSlots error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Create time slot
 */
export async function createTimeSlot(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { startAt, endAt, mode, clinicId, notes } = req.body;

    if (!startAt || !endAt || !mode) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing required fields");
    }

    // Check for conflicts
    const conflict = await DoctorTimeSlot.findOne({
      doctorId: doctor._id,
      $or: [
        { startAt: { $lt: endAt, $gte: startAt } },
        { endAt: { $gt: startAt, $lte: endAt } },
      ],
    });

    if (conflict) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Time slot conflicts with existing slot"
      );
    }

    const slot = await DoctorTimeSlot.create({
      doctorId: doctor._id,
      clinicId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      mode,
      notes,
    });

    return ok(res, { slot });
  } catch (e) {
    console.error("❌ createTimeSlot error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Update time slot
 */
export async function updateTimeSlot(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { slotId } = req.params;
    const updateData = req.body;

    const slot = await DoctorTimeSlot.findOneAndUpdate(
      { _id: slotId, doctorId: doctor._id },
      updateData,
      { new: true }
    );

    if (!slot) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Time slot not found");
    }

    return ok(res, { slot });
  } catch (e) {
    console.error("❌ updateTimeSlot error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Delete time slot
 */
export async function deleteTimeSlot(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { slotId } = req.params;

    const slot = await DoctorTimeSlot.findOneAndDelete({
      _id: slotId,
      doctorId: doctor._id,
    });

    if (!slot) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Time slot not found");
    }

    return ok(res, { message: "Time slot deleted successfully" });
  } catch (e) {
    console.error("❌ deleteTimeSlot error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Block time slot
 */
export async function blockTimeSlot(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { startAt, endAt, reason, notes } = req.body;

    if (!startAt || !endAt) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing required fields");
    }

    const slot = await DoctorTimeSlot.create({
      doctorId: doctor._id,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      mode: "offline",
      status: "blocked",
      notes: reason || notes,
    });

    return ok(res, { slot });
  } catch (e) {
    console.error("❌ blockTimeSlot error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get doctor reviews
 */
export async function getDoctorReviews(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { page = 1, limit = 20, rating, sortBy = "newest" } = req.query;
    const skip = (page - 1) * limit;

    const filter = { doctorId: doctor._id };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "highest":
        sort = { rating: -1 };
        break;
      case "lowest":
        sort = { rating: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find(filter)
      .populate("patientId", "fullName")
      .populate("appointmentId", "scheduledStart mode")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments(filter);

    return ok(res, {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("❌ getDoctorReviews error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Respond to review
 */
export async function respondToReview(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { reviewId } = req.params;
    const { response } = req.body;

    if (!response) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Response is required");
    }

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, doctorId: doctor._id },
      { doctorResponse: response, doctorResponseAt: new Date() },
      { new: true }
    );

    if (!review) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Review not found");
    }

    return ok(res, { review });
  } catch (e) {
    console.error("❌ respondToReview error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Create test time slots for a doctor (for development/testing)
 */
export async function createTestTimeSlots(req, res) {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdSlots = [];

    // Create time slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      // Create slots from 9:00 AM to 5:00 PM, 30 minutes each
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startAt = new Date(currentDate);
          startAt.setHours(hour, minute, 0, 0);

          const endAt = new Date(currentDate);
          endAt.setHours(hour, minute + 30, 0, 0);

          // Skip if slot already exists
          const existingSlot = await DoctorTimeSlot.findOne({
            doctorId: doctorId,
            startAt,
            endAt,
          });

          if (!existingSlot) {
            const slot = await DoctorTimeSlot.create({
              doctorId: doctorId,
              startAt,
              endAt,
              status: "available",
            });
            createdSlots.push(slot);
          }
        }
      }
    }

    return ok(res, {
      message: `Created ${createdSlots.length} time slots for doctor ${doctor.fullName}`,
      slots: createdSlots,
    });
  } catch (e) {
    console.error("❌ createTestTimeSlots error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Upload consultation attachment file
 */
export async function uploadConsultationFile(req, res) {
  try {
    if (!req.file) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "No file uploaded");
    }

    // Construct the URL for the uploaded file
    const fileUrl = `/server-uploads/consultations/${req.file.filename}`;

    return ok(res, { 
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (e) {
    console.error("❌ uploadConsultationFile error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}


/**
 * Get all appointments (public endpoint for fallback)
 */
export async function getAllAppointments(req, res) {
  try {
    console.log("🔍 getAllAppointments - query:", req.query);
    
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({})
      .populate({
        path: 'patientId',
        select: 'fullName dob gender phone email',
        populate: {
          path: 'userId',
          select: 'email phone'
        }
      })
      .populate('doctorId', 'fullName licenseNo')
      .populate('slotId')
      .sort({ scheduledStart: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Appointment.countDocuments({});

    console.log("✅ getAllAppointments - found:", appointments.length);
    return ok(res, {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ getAllAppointments error:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message || String(error));
  }
}
