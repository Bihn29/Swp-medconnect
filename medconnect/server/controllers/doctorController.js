import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Specialization from "../models/specialization.model.js";
import Clinic from "../models/clinic.model.js";
import ConsultationSummary from "../models/consultationSummary.model.js";
import Prescription from "../models/prescription.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import DoctorScheduleRule from "../models/Doctor_schedule_rules.model.js";
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
    // Use email-based authentication (consistent with other functions)
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    // Find user directly by email
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const {
      fullName,
      licenseNo,
      yearsExperience,
      bio,
      avatarUrl,
      clinicDefaultId,
      specializationIds,
    } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (licenseNo) updateData.licenseNo = licenseNo;
    if (yearsExperience !== undefined)
      updateData.yearsExperience = yearsExperience;
    if (bio) updateData.bio = bio;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (clinicDefaultId) updateData.clinicDefaultId = clinicDefaultId;
    if (specializationIds) updateData.specializationIds = specializationIds;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user._id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone");

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
      .populate("patientId", "fullName dob gender phone")
      .populate("slotId")
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
 * Get consultation records (completed appointments with summaries)
 */
export async function getConsultationRecords(req, res) {
  try {
    console.log("🔍 getConsultationRecords - req.user:", req.user);
    
    // Use email-based authentication (consistent with other functions)
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    // Find user directly by email
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    // Find doctor profile
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
    // Use email-based authentication
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { appointmentId, summaryText } = req.body;

    if (!appointmentId || !summaryText) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Missing appointmentId or summaryText"
      );
    }

    // Check if appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found");
    }

    const summary = await ConsultationSummary.create({
      appointmentId,
      summaryText,
      createdBy: doctor._id,
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
    // Use email-based authentication
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
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
 * Debug endpoint to test authentication
 */
export async function debugAuth(req, res) {
  try {
    console.log("🔍 debugAuth - req.user:", req.user);
    console.log("🔍 debugAuth - req.user type:", typeof req.user);
    console.log("🔍 debugAuth - req.user keys:", req.user ? Object.keys(req.user) : "req.user is null/undefined");
    
    return ok(res, {
      user: req.user,
      hasAppUserId: !!req.user?.app_user_id,
      hasEmail: !!req.user?.email,
      hasUid: !!req.user?.uid
    });
  } catch (e) {
    console.error("❌ debugAuth error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}




/**
 * Get doctor reviews
 */
export async function getDoctorReviews(req, res) {
  try {
    // Use email-based authentication
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
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
    // Use email-based authentication
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
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
 * Get doctor time slots
 */
export async function getDoctorTimeSlots(req, res) {
  try {
    const userEmail = req.user?.email;
    console.log("🔍 getDoctorTimeSlots - userEmail:", userEmail);
    
    if (!userEmail) {
      console.log("❌ No user email found in token");
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      console.log("❌ User not found by email:", userEmail);
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    console.log("🔍 getDoctorTimeSlots - Found user:", { id: user._id, email: user.email });

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      console.log("❌ Doctor profile not found for user:", user._id);
      return ok(res, {
        slots: [],
        pagination: {
          page: parseInt(req.query.page || 1),
          limit: parseInt(req.query.limit || 50),
          total: 0,
          pages: 0,
        },
      });
    }

    console.log("🔍 getDoctorTimeSlots - Found doctor:", { 
      id: doctor._id, 
      fullName: doctor.fullName,
      userId: doctor.userId,
      userEmail: userEmail
    });

    const { page = 1, limit = 50, date, startDate, endDate, status } = req.query;
    console.log("🔍 getDoctorTimeSlots query params:", { page, limit, date, startDate, endDate, status });

    const mongoose = await import("mongoose");
    
    // Check if doctor._id is already an ObjectId or needs conversion
    let doctorObjectId;
    try {
      if (typeof doctor._id === 'string') {
        doctorObjectId = new mongoose.default.Types.ObjectId(doctor._id);
      } else {
        doctorObjectId = doctor._id; // Already an ObjectId
      }
    } catch (error) {
      console.error("❌ Invalid doctor ID format:", doctor._id, error);
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid doctor ID format");
    }
    
    const filter = { doctorId: doctorObjectId };
    
    console.log("🔍 Filter with ObjectId:", {
      doctorId: doctor._id,
      convertedDoctorId: filter.doctorId,
      doctorIdType: typeof doctor._id,
      convertedType: typeof filter.doctorId
    });

    if (date) {
      try {
        const startDate = new Date(date);
        if (isNaN(startDate.getTime())) {
          console.error("❌ Invalid single date format:", date);
          return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid date format");
        }
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        filter.startAt = { $gte: startDate, $lte: endDate };
        console.log("🔍 Single date filter applied:", {
          date: date,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      } catch (dateError) {
        console.error("❌ Single date parsing error:", dateError);
        return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid date format");
      }
    } else if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error("❌ Invalid date format:", { startDate, endDate });
          return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid date format");
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        filter.startAt = { $gte: start, $lte: end };
        console.log("🔍 Date range filter applied:", {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          startDateParam: startDate,
          endDateParam: endDate
        });
      } catch (dateError) {
        console.error("❌ Date parsing error:", dateError);
        return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Invalid date format");
      }
    } else {
      console.log("⚠️ No date filter provided, returning slots for next 7 days");
      // Nếu không có date filter, trả về slot trong 7 ngày tới
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);
      filter.startAt = { $gte: today, $lte: nextWeek };
      console.log("🔍 Default date range filter applied:", {
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString()
      });
    }

    console.log("🔍 Final filter:", filter);

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    try {
      const timeSlots = await DoctorTimeSlot.find(filter)
        .sort({ startAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await DoctorTimeSlot.countDocuments(filter);

    console.log("🔍 Database query results:", {
      filterApplied: filter,
      slotsFound: timeSlots.length,
      totalInRange: total,
      limit: parseInt(limit),
      skip: skip,
      doctorId: doctor._id,
      doctorEmail: userEmail
    });

      if (timeSlots.length > 0) {
        console.log("🔍 Sample slots:", timeSlots.slice(0, 3).map(slot => ({
          id: slot._id,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: slot.status
        })));
      }

    if (timeSlots.length === 0) {
      console.log("🔍 No time slots found, returning empty array");
      console.log("🔍 Doctor ID:", doctor._id);
      console.log("🔍 Filter applied:", filter);
      return ok(res, {
        slots: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      });
    }

    const serializedSlots = timeSlots.map(slot => ({
      ...slot,
      _id: slot._id.toString(),
      doctorId: slot.doctorId.toString(),
      startAt: slot.startAt,
      endAt: slot.endAt,
      status: slot.status
    }));

    console.log("🔍 Serialized slots count:", serializedSlots.length);
    console.log("🔍 Sample serialized slot:", serializedSlots[0]);

    return ok(res, {
      slots: serializedSlots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
    } catch (dbError) {
      throw dbError;
    }
  } catch (e) {
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Generate time slots based on doctor's schedule rules
 */
export async function autoGenerateTimeSlots(req, res) {
  try {
    console.log("🔍 autoGenerateTimeSlots - req.user:", req.user);
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    console.log("🔍 autoGenerateTimeSlots - Found doctor:", { id: doctor._id, fullName: doctor.fullName });

    // First, create default schedule rules if they don't exist
    await createDefaultScheduleRules(doctor._id);

    // Get active schedule rules for this doctor
    const scheduleRules = await DoctorScheduleRule.find({
      doctorId: doctor._id,
      isActive: true
    }).lean();

    if (scheduleRules.length === 0) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "No schedule rules found. Please set up your schedule rules first.");
    }

    console.log(`📋 Found ${scheduleRules.length} schedule rules for doctor ${doctor.fullName}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);
    endDate.setHours(23, 59, 59, 999);

    console.log("🔍 Creating slots from:", today.toISOString().split('T')[0]);
    console.log("🔍 Creating slots until:", endDate.toISOString().split('T')[0]);

    const createdSlots = [];
    const skippedSlots = [];

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const weekday = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Find schedule rule for this weekday
      const dayRule = scheduleRules.find(rule => rule.weekday === weekday);
      if (!dayRule) {
        console.log(`⚠️ No schedule rule for weekday ${weekday} (${currentDate.toDateString()})`);
        continue;
      }

      console.log(`📅 Processing ${currentDate.toDateString()} (weekday ${weekday}) with ${dayRule.blocks.length} blocks`);
      let daySlotCount = 0;

      // Generate slots based on schedule rules
      const generatedSlots = DoctorScheduleRule.generateSlotsForDate({
        date: currentDate,
        blocks: dayRule.blocks,
        slotBlockMinutes: dayRule.slotBlockMinutes
      });

      console.log(`🔍 Generated ${generatedSlots.length} slots for ${currentDate.toDateString()}`);

      for (const slotData of generatedSlots) {
        try {
          console.log(`🔍 Checking slot: ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}`);
          
          const existingSlot = await DoctorTimeSlot.findOne({
            doctorId: doctor._id,
            startAt: slotData.startAt,
            endAt: slotData.endAt
          });

          if (!existingSlot) {
            console.log(`✅ Creating new slot: ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}`);
            const newSlot = await DoctorTimeSlot.create({
              doctorId: doctor._id,
              startAt: slotData.startAt,
              endAt: slotData.endAt,
              status: "available"
            });
            createdSlots.push(newSlot);
            daySlotCount++;
            console.log(`✅ Slot created successfully: ${newSlot._id}`);
          } else {
            console.log(`⚠️ Slot already exists: ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}`);
            skippedSlots.push({
              startAt: slotData.startAt,
              endAt: slotData.endAt,
              reason: "Already exists"
            });
          }
        } catch (error) {
          console.error(`❌ Error creating slot ${slotData.startAt.toTimeString()} - ${slotData.endAt.toTimeString()}:`, error);
          skippedSlots.push({
            startAt: slotData.startAt,
            endAt: slotData.endAt,
            reason: error.message
          });
        }
      }
      
      console.log(`📊 Day ${dayOffset + 1} completed: ${daySlotCount} slots created`);
    }

    console.log(`✅ Created ${createdSlots.length} new time slots for doctor ${doctor.fullName} based on schedule rules`);
    console.log(`⚠️ Skipped ${skippedSlots.length} slots (already exist or error)`);
    console.log(`📊 Actual created: ${createdSlots.length} slots`);

    return ok(res, {
      message: `Generated ${createdSlots.length} new time slots for doctor ${doctor.fullName} based on schedule rules (next 14 days)`,
      createdSlots: createdSlots.length,
      skippedSlots: skippedSlots.length,
      dateRange: {
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      scheduleRules: scheduleRules.length,
      details: {
        created: createdSlots.slice(0, 5), // Show first 5 as sample
        skipped: skippedSlots.slice(0, 5) // Show first 5 as sample
      }
    });
  } catch (error) {
    console.error("❌ autoGenerateTimeSlots error:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message || String(error));
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
 * Get all appointments (public endpoint for fallback)
 */
export async function getAllAppointments(req, res) {
  try {
    console.log("🔍 getAllAppointments - query:", req.query);
    
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({})
      .populate('patientId', 'fullName dob gender phone')
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


/**
 * Get doctor's schedule rules
 */
export async function getDoctorScheduleRules(req, res) {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const scheduleRules = await DoctorScheduleRule.find({
      doctorId: doctor._id,
      isActive: true
    }).sort({ weekday: 1 }).lean();

    return ok(res, {
      scheduleRules,
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName
      }
    });
  } catch (error) {
    console.error("❌ getDoctorScheduleRules error:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message || String(error));
  }
}

/**
 * Update doctor's schedule rules
 */
export async function updateDoctorScheduleRules(req, res) {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const { scheduleRules } = req.body;
    if (!scheduleRules || !Array.isArray(scheduleRules)) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Schedule rules array is required");
    }

    // Deactivate existing rules
    await DoctorScheduleRule.updateMany(
      { doctorId: doctor._id },
      { isActive: false }
    );

    // Create new rules
    const newRules = scheduleRules.map(rule => ({
      ...rule,
      doctorId: doctor._id,
      effectiveFrom: new Date(),
      isActive: true
    }));

    const createdRules = await DoctorScheduleRule.insertMany(newRules);

    return ok(res, {
      message: "Schedule rules updated successfully",
      scheduleRules: createdRules,
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName
      }
    });
  } catch (error) {
    console.error("❌ updateDoctorScheduleRules error:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, error.message || String(error));
  }
}

/**
 * Create default schedule rules for a doctor
 */
async function createDefaultScheduleRules(doctorId) {
  try {
    // Check if rules already exist
    const existingRules = await DoctorScheduleRule.find({
      doctorId: doctorId,
      isActive: true
    });

    if (existingRules.length > 0) {
      console.log("Schedule rules already exist for doctor:", doctorId);
      return;
    }

    // Create default schedule rules for weekdays (Monday to Friday)
    const defaultRules = [];
    
    for (let weekday = 1; weekday <= 5; weekday++) { // Monday to Friday
      const rule = {
        doctorId: doctorId,
        weekday: weekday,
        blocks: [
          {
            startTime: "07:00",
            endTime: "11:40"
          },
          {
            startTime: "13:00", 
            endTime: "17:00"
          }
        ],
        slotBlockMinutes: 20,
        consultMinutes: 20,
        effectiveFrom: new Date(),
        isActive: true
      };
      defaultRules.push(rule);
    }

    await DoctorScheduleRule.insertMany(defaultRules);
    console.log(`Created default schedule rules for doctor ${doctorId}`);
    
  } catch (error) {
    console.error("Error creating default schedule rules:", error);
    throw error;
  }
}

