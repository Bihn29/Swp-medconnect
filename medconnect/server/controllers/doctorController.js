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
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Get doctor profile by ID
 */
export async function getDoctorProfile(req, res) {
  try {
    const { doctorId } = req.params;
    
    const doctor = await Doctor.findById(doctorId)
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name code')
      .populate('clinicDefaultId', 'name address phone')
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
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId })
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name code')
      .populate('clinicDefaultId', 'name address phone')
      .lean();

    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

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
      licenseNo,
      yearsExperience,
      bio,
      avatarUrl,
      clinicDefaultId,
      specializationIds
    } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (licenseNo) updateData.licenseNo = licenseNo;
    if (yearsExperience !== undefined) updateData.yearsExperience = yearsExperience;
    if (bio) updateData.bio = bio;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (clinicDefaultId) updateData.clinicDefaultId = clinicDefaultId;
    if (specializationIds) updateData.specializationIds = specializationIds;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: appUserId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name code')
      .populate('clinicDefaultId', 'name address phone');

    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

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
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { status, date, page = 1, limit = 10 } = req.query;
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
      .populate('patientId', 'fullName dob gender phone')
      .populate('slotId')
      .sort({ scheduledStart: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Appointment.countDocuments(filter);

    return ok(res, {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
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
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      scheduledStart: { $gte: startOfDay, $lt: endOfDay }
    });

    // Available slots today
    const availableSlots = await Appointment.countDocuments({
      doctorId: doctor._id,
      scheduledStart: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'pending'
    });

    // Completed appointments this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: 'done',
      scheduledStart: { $gte: startOfMonth }
    });

    return ok(res, {
      stats: {
        todayAppointments,
        availableSlots,
        pendingAppointments,
        completedAppointments
      }
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
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const { appointmentId } = req.params;
    const { status, cancelReason } = req.body;

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    const updateData = { status };
    if (status === 'cancelled' && cancelReason) {
      updateData.cancelReason = cancelReason;
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = appUserId;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
      .populate('patientId', 'fullName dob gender phone')
      .populate('slotId');

    return ok(res, { appointment: updatedAppointment });
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
      verified = true 
    } = req.query;
    
    const skip = (page - 1) * limit;
    const filter = { isVerified: verified === 'true' };
    
    if (specialization) {
      filter.specializationIds = specialization;
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name code')
      .populate('clinicDefaultId', 'name address phone')
      .sort({ ratingAvg: -1, ratingCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Doctor.countDocuments(filter);

    return ok(res, {
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    console.error("❌ getAllDoctors error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get consultation records (completed appointments with summaries)
 */
export async function getConsultationRecords(req, res) {
  try {
    const appUserId = req.user?.app_user_id;
    if (!appUserId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    const doctor = await Doctor.findOne({ userId: appUserId });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = { 
      doctorId: doctor._id,
      status: 'done'
    };

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName dob gender phone')
      .populate('slotId')
      .sort({ scheduledStart: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get consultation summaries for these appointments
    const appointmentIds = appointments.map(apt => apt._id);
    const summaries = await ConsultationSummary.find({
      appointmentId: { $in: appointmentIds }
    }).lean();

    // Get prescriptions for these appointments
    const prescriptions = await Prescription.find({
      appointmentId: { $in: appointmentIds }
    }).lean();

    // Combine data
    const records = appointments.map(appointment => {
      const summary = summaries.find(s => s.appointmentId.toString() === appointment._id.toString());
      const prescription = prescriptions.find(p => p.appointmentId.toString() === appointment._id.toString());
      
      return {
        ...appointment,
        summary: summary?.summaryText || null,
        prescription: prescription || null
      };
    });

    const total = await Appointment.countDocuments(filter);

    return ok(res, {
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
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

    const { appointmentId, summaryText } = req.body;

    if (!appointmentId || !summaryText) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing appointmentId or summaryText");
    }

    // Check if appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    const summary = await ConsultationSummary.create({
      appointmentId,
      summaryText,
      createdBy: doctor._id
    });

    return ok(res, { summary });
  } catch (e) {
    console.error("❌ createConsultationSummary error:", e);
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
      doctorId: doctor._id
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    const prescription = await Prescription.create({
      appointmentId,
      diagnosis,
      note,
      items,
      createdBy: doctor._id
    });

    return ok(res, { prescription });
  } catch (e) {
    console.error("❌ createPrescription error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
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
      .populate('clinicId', 'name address')
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
        pages: Math.ceil(total / limit)
      }
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
        { endAt: { $gt: startAt, $lte: endAt } }
      ]
    });

    if (conflict) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Time slot conflicts with existing slot");
    }

    const slot = await DoctorTimeSlot.create({
      doctorId: doctor._id,
      clinicId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      mode,
      notes
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
      doctorId: doctor._id
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
      notes: reason || notes
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
      .populate('patientId', 'fullName')
      .populate('appointmentId', 'scheduledStart mode')
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
        pages: Math.ceil(total / limit)
      }
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
