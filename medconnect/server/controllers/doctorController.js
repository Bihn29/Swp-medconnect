import mongoose from "mongoose";
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
import { createAppointmentNotification } from "../services/notificationService.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";
import { sendMail } from "../utils/email.js";

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
    console.error("getDoctorProfile error:", e);
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
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User email not found in token"
      );
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    // Find doctor profile
    const doctor = await Doctor.findOne({ userId: user._id })
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone")
      .lean();

    if (!doctor) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Doctor profile not found for user"
      );
    }
    return ok(res, { doctor });
  } catch (e) {
    console.error("getCurrentDoctorProfile error:", e);
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
      await User.findByIdAndUpdate(appUserId, userUpdate, {
        new: true,
      });
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
    if (specializationIds)
      doctorUpdateData.specializationIds = specializationIds;


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


    return ok(res, { doctor });
  } catch (e) {
    console.error("updateDoctorProfile error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get doctor appointments
 */
export async function getDoctorAppointments(req, res) {
  try {
    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User email not found in token"
      );
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

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
      .populate("rescheduledToId", "scheduledStart scheduledEnd status")
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
    console.error("getDoctorAppointments error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get doctor dashboard statistics
 */
export async function getDoctorDashboardStats(req, res) {
  try {
    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User email not found in token"
      );
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

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
    console.error("getDoctorDashboardStats error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get appointment detail by ID
 */
export async function getDoctorAppointmentDetail(req, res) {
  try {
    
    const userEmail = req.user?.email;
    if (!userEmail) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User email not found in token");
    }

    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }
    
    const { appointmentId } = req.params;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    })
      .populate({
        path: "patientId",
        select: "fullName dob gender phone"
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
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Appointment not found or does not belong to this doctor");
    }

    return ok(res, appointment);
  } catch (e) {
    console.error("getDoctorAppointmentDetail error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Helper function to send appointment acceptance email to patient
 */
async function sendAppointmentAcceptanceEmail(appointment, patient, doctor) {
  try {
    console.log(`📧 sendAppointmentAcceptanceEmail called with:`, {
      patientEmail: patient?.email,
      patientUserId: patient?.userId,
      hasUserIdObject: patient?.userId && typeof patient.userId === 'object',
      userIdEmail: patient?.userId?.email
    });

    // Lấy email từ Patient hoặc User
    let patientEmail = patient.email;
    
    // Nếu Patient không có email, lấy từ User (userId có thể là object đã populate hoặc ObjectId)
    if (!patientEmail) {
      if (patient.userId && typeof patient.userId === 'object' && patient.userId.email) {
        // userId đã được populate
        patientEmail = patient.userId.email;
        console.log(`📧 Found email from populated userId: ${patientEmail}`);
      } else if (patient.userId) {
        // userId là ObjectId, cần query
        console.log(`📧 Querying User for email, userId: ${patient.userId}`);
        const patientUser = await User.findById(patient.userId).select("email").lean();
        if (patientUser) {
          patientEmail = patientUser.email;
          console.log(`📧 Found email from User query: ${patientEmail}`);
        } else {
          console.log(`⚠️ User not found for userId: ${patient.userId}`);
        }
      }
    } else {
      console.log(`📧 Using email from patient object: ${patientEmail}`);
    }

    // Nếu vẫn không có email, không gửi
    if (!patientEmail) {
      console.log("⚠️ Patient email not found, skipping email notification. Patient data:", {
        patientId: patient?._id,
        patientEmail: patient?.email,
        userId: patient?.userId
      });
      return;
    }

    console.log(`📧 Sending acceptance email to: ${patientEmail}`);

    // Format thời gian
    const scheduledStart = new Date(appointment.scheduledStart);
    const scheduledEnd = new Date(appointment.scheduledEnd);
    
    const dateStr = scheduledStart.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = `${scheduledStart.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${scheduledEnd.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const modeText = appointment.mode === "online" ? "Online" : "Trực tiếp tại phòng khám";
    
    // Lấy tên bác sĩ
    const doctorName = doctor?.fullName || doctor?.userId?.fullName || "Bác sĩ";

    // Tạo nội dung email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2b6cb0; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px;">
          Lịch hẹn của bạn đã được xác nhận
        </h2>
        <p>Xin chào <strong>${patient.fullName || "Bệnh nhân"}</strong>,</p>
        <p>Chúng tôi xin thông báo rằng lịch hẹn khám của bạn đã được <strong style="color: #059669;">xác nhận</strong> bởi bác sĩ.</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2b6cb0; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Thông tin lịch hẹn:</h3>
          <p style="margin: 8px 0;"><strong>Bác sĩ:</strong> ${doctorName}</p>
          <p style="margin: 8px 0;"><strong>Thời gian:</strong> ${dateStr}</p>
          <p style="margin: 8px 0;"><strong>Giờ:</strong> ${timeStr}</p>
          <p style="margin: 8px 0;"><strong>Hình thức:</strong> ${modeText}</p>
          ${appointment.reason ? `<p style="margin: 8px 0;"><strong>Lý do khám:</strong> ${appointment.reason}</p>` : ""}
        </div>

        <p>Vui lòng đảm bảo bạn có mặt đúng giờ hẹn.</p>
        ${appointment.mode === "online" ? "<p><strong>Lưu ý:</strong> Đây là cuộc hẹn online. Vui lòng chuẩn bị kết nối internet ổn định và tham gia cuộc gọi video đúng giờ.</p>" : ""}
        
        <p style="margin-top: 30px;">Trân trọng,<br><strong>MedConnect</strong></p>
      </div>
    `;

    const textContent = `
Lịch hẹn của bạn đã được xác nhận

Xin chào ${patient.fullName || "Bệnh nhân"},

Chúng tôi xin thông báo rằng lịch hẹn khám của bạn đã được xác nhận bởi bác sĩ.

Thông tin lịch hẹn:
- Bác sĩ: ${doctorName}
- Thời gian: ${dateStr}
- Giờ: ${timeStr}
- Hình thức: ${modeText}
${appointment.reason ? `- Lý do khám: ${appointment.reason}` : ""}

Vui lòng đảm bảo bạn có mặt đúng giờ hẹn.
${appointment.mode === "online" ? "\nLưu ý: Đây là cuộc hẹn online. Vui lòng chuẩn bị kết nối internet ổn định và tham gia cuộc gọi video đúng giờ." : ""}

Trân trọng,
MedConnect
    `;

    console.log(`📧 Attempting to send email via sendMail...`);
    const emailResult = await sendMail({
      to: patientEmail,
      subject: "Lịch hẹn của bạn đã được xác nhận - MedConnect",
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Appointment acceptance email sent successfully to ${patientEmail}`);
    console.log(`📧 Email result:`, { messageId: emailResult?.messageId, response: emailResult?.response });
  } catch (error) {
    console.error("❌ Error sending appointment acceptance email:", error);
    console.error("❌ Error details:", {
      message: error?.message,
      stack: error?.stack,
      status: error?.status
    });
    // Không throw error để không ảnh hưởng đến flow chính
  }
}

/**
 * Helper function to send appointment rejection email to patient
 */
async function sendAppointmentRejectionEmail(appointment, patient, doctor, rejectReason) {
  try {
    console.log(`📧 sendAppointmentRejectionEmail called with:`, {
      patientEmail: patient?.email,
      patientUserId: patient?.userId,
      hasUserIdObject: patient?.userId && typeof patient.userId === 'object',
      userIdEmail: patient?.userId?.email,
      rejectReason: rejectReason
    });

    // Lấy email từ Patient hoặc User
    let patientEmail = patient.email;
    
    // Nếu Patient không có email, lấy từ User (userId có thể là object đã populate hoặc ObjectId)
    if (!patientEmail) {
      if (patient.userId && typeof patient.userId === 'object' && patient.userId.email) {
        // userId đã được populate
        patientEmail = patient.userId.email;
        console.log(`📧 Found email from populated userId: ${patientEmail}`);
      } else if (patient.userId) {
        // userId là ObjectId, cần query
        console.log(`📧 Querying User for email, userId: ${patient.userId}`);
        const patientUser = await User.findById(patient.userId).select("email").lean();
        if (patientUser) {
          patientEmail = patientUser.email;
          console.log(`📧 Found email from User query: ${patientEmail}`);
        } else {
          console.log(`⚠️ User not found for userId: ${patient.userId}`);
        }
      }
    } else {
      console.log(`📧 Using email from patient object: ${patientEmail}`);
    }

    // Nếu vẫn không có email, không gửi
    if (!patientEmail) {
      console.log("⚠️ Patient email not found, skipping email notification. Patient data:", {
        patientId: patient?._id,
        patientEmail: patient?.email,
        userId: patient?.userId
      });
      return;
    }

    console.log(`📧 Sending rejection email to: ${patientEmail}`);

    // Format thời gian
    const scheduledStart = new Date(appointment.scheduledStart);
    const scheduledEnd = new Date(appointment.scheduledEnd);
    
    const dateStr = scheduledStart.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = `${scheduledStart.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${scheduledEnd.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    const modeText = appointment.mode === "online" ? "Online" : "Trực tiếp tại phòng khám";
    
    // Lấy tên bác sĩ
    const doctorName = doctor?.fullName || doctor?.userId?.fullName || "Bác sĩ";

    // Tạo nội dung email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          Lịch hẹn của bạn đã bị từ chối
        </h2>
        <p>Xin chào <strong>${patient.fullName || "Bệnh nhân"}</strong>,</p>
        <p>Chúng tôi rất tiếc thông báo rằng lịch hẹn khám của bạn đã bị <strong style="color: #dc2626;">từ chối</strong> bởi bác sĩ.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Thông tin lịch hẹn:</h3>
          <p style="margin: 8px 0;"><strong>Bác sĩ:</strong> ${doctorName}</p>
          <p style="margin: 8px 0;"><strong>Thời gian:</strong> ${dateStr}</p>
          <p style="margin: 8px 0;"><strong>Giờ:</strong> ${timeStr}</p>
          <p style="margin: 8px 0;"><strong>Hình thức:</strong> ${modeText}</p>
          ${appointment.reason ? `<p style="margin: 8px 0;"><strong>Lý do khám:</strong> ${appointment.reason}</p>` : ""}
          ${rejectReason ? `<p style="margin: 8px 0;"><strong>Lý do từ chối:</strong> ${rejectReason}</p>` : ""}
        </div>

        <p>Bạn có thể đặt lịch hẹn mới với bác sĩ khác hoặc chọn thời gian khác phù hợp hơn.</p>
        <p>Chúng tôi xin lỗi vì sự bất tiện này và cảm ơn bạn đã tin tưởng sử dụng dịch vụ của MedConnect.</p>
        
        <p style="margin-top: 30px;">Trân trọng,<br><strong>MedConnect</strong></p>
      </div>
    `;

    const textContent = `
Lịch hẹn của bạn đã bị từ chối

Xin chào ${patient.fullName || "Bệnh nhân"},

Chúng tôi rất tiếc thông báo rằng lịch hẹn khám của bạn đã bị từ chối bởi bác sĩ.

Thông tin lịch hẹn:
- Bác sĩ: ${doctorName}
- Thời gian: ${dateStr}
- Giờ: ${timeStr}
- Hình thức: ${modeText}
${appointment.reason ? `- Lý do khám: ${appointment.reason}` : ""}
${rejectReason ? `- Lý do từ chối: ${rejectReason}` : ""}

Bạn có thể đặt lịch hẹn mới với bác sĩ khác hoặc chọn thời gian khác phù hợp hơn.
Chúng tôi xin lỗi vì sự bất tiện này và cảm ơn bạn đã tin tưởng sử dụng dịch vụ của MedConnect.

Trân trọng,
MedConnect
    `;

    console.log(`📧 Attempting to send rejection email via sendMail...`);
    const emailResult = await sendMail({
      to: patientEmail,
      subject: "Lịch hẹn của bạn đã bị từ chối - MedConnect",
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Appointment rejection email sent successfully to ${patientEmail}`);
    console.log(`📧 Email result:`, { messageId: emailResult?.messageId, response: emailResult?.response });
  } catch (error) {
    console.error("❌ Error sending appointment rejection email:", error);
    console.error("❌ Error details:", {
      message: error?.message,
      stack: error?.stack,
      status: error?.status
    });
    // Không throw error để không ảnh hưởng đến flow chính
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(req, res) {
  try {
    console.log("==========================================");
    console.log("📞 updateAppointmentStatus called");
    console.log("🔍 updateAppointmentStatus - req.user:", req.user);
    console.log(
      "🔍 updateAppointmentStatus - req.user.email:",
      req.user?.email
    );

    // Use email-based authentication instead of Firebase UID
    const userEmail = req.user?.email;
    if (!userEmail) {
      console.log("❌ User email not found in token");
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User email not found in token"
      );
    }

    // Find user directly by email (simplified approach)
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found by email");
    }

    const { appointmentId } = req.params;
    const { status, cancelReason } = req.body;

    console.log("🔍 updateAppointmentStatus - Request params:", {
      appointmentId,
      status,
      cancelReason
    });
    console.log("📧 Will send email if status is accepted or rejected:", status === "accepted" || status === "rejected");

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor profile not found");
    }

    console.log("✅ updateAppointmentStatus - Doctor found:", doctor._id);

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });
    
    console.log("🔍 updateAppointmentStatus - Appointment lookup result:", {
      found: !!appointment,
      currentStatus: appointment?.status,
      appointmentId,
      doctorId: doctor._id
    });

    if (!appointment) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Appointment not found or does not belong to this doctor"
      );
    }

    // Validate status transition
    const validStatusTransitions = {
      pending_doctor: ["accepted", "rejected", "cancelled"],
      accepted: ["in_progress", "cancelled", "done", "no_show"],
      in_progress: ["done", "cancelled"],
      // "rejected", "cancelled", "done", "no_show" are terminal states or handled by patient
    };

    if (
      !validStatusTransitions[appointment.status] ||
      !validStatusTransitions[appointment.status].includes(status)
    ) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        `Invalid status transition from ${appointment.status} to ${status}`
      );
    }

    const updateData = { status };

    // Handle different status updates
    if (status === "accepted") {
      updateData.acceptedBy = doctor._id;
    } else if (status === "rejected") {
      updateData.rejectedBy = doctor._id;
      updateData.rejectReason = cancelReason; // Use cancelReason as rejectReason
    } else if (status === "cancelled") {
      updateData.cancelReason = cancelReason;
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = user._id;
    } else if (status === "no_show") {
      updateData.noShowAt = new Date();
      updateData.noShowBy = doctor._id;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
      .populate({
        path: "patientId",
        select: "fullName dob gender phone email userId",
        populate: {
          path: "userId",
          select: "email fullName"
        }
      })
      .populate("slotId")
      .populate({
        path: "doctorId",
        select: "fullName",
        populate: {
          path: "userId",
          select: "fullName email"
        }
      });

    // Send email notification when appointment is accepted or rejected
    if (status === "accepted" || status === "rejected") {
      console.log(`📧 Preparing to send ${status} email for appointment ${appointmentId}`);
      try {
        const populatedAppointment = await Appointment.findById(appointmentId)
          .populate({
            path: "patientId",
            select: "fullName dob gender phone email userId",
            populate: {
              path: "userId",
              select: "email fullName"
            }
          })
          .populate({
            path: "doctorId",
            select: "fullName",
            populate: {
              path: "userId",
              select: "fullName email"
            }
          })
          .lean();

        console.log(`📧 Populated appointment:`, {
          hasPatientId: !!populatedAppointment?.patientId,
          patientEmail: populatedAppointment?.patientId?.email,
          userIdEmail: populatedAppointment?.patientId?.userId?.email,
          patientName: populatedAppointment?.patientId?.fullName
        });

        if (populatedAppointment?.patientId) {
          if (status === "accepted") {
            // Gửi email xác nhận cho cả online và offline
            console.log(`📧 Calling sendAppointmentAcceptanceEmail...`);
            await sendAppointmentAcceptanceEmail(
              populatedAppointment,
              populatedAppointment.patientId,
              populatedAppointment.doctorId
            );
            console.log(`✅ sendAppointmentAcceptanceEmail completed`);
          } else if (status === "rejected") {
            // Gửi email từ chối cho cả online và offline
            console.log(`📧 Calling sendAppointmentRejectionEmail...`);
            await sendAppointmentRejectionEmail(
              populatedAppointment,
              populatedAppointment.patientId,
              populatedAppointment.doctorId,
              cancelReason || populatedAppointment.rejectReason
            );
            console.log(`✅ sendAppointmentRejectionEmail completed`);
          }
        } else {
          console.log(`⚠️ No patientId found in populated appointment`);
        }
      } catch (emailError) {
        console.error(`❌ Error sending ${status} email:`, emailError);
        console.error(`❌ Error stack:`, emailError.stack);
        // Don't fail the main request if email fails
      }
    }

    // Create notification for status change
    try {
      const additionalData = {};
      if (status === "rejected" && cancelReason) {
        additionalData.rejectReason = cancelReason;
      } else if (status === "cancelled" && cancelReason) {
        additionalData.cancelReason = cancelReason;
      }

      await createAppointmentNotification(
        appointmentId,
        status,
        additionalData
      );
      console.log(
        `✅ Notification created for appointment ${appointmentId} status: ${status}`
      );
    } catch (notificationError) {
      console.error("❌ Error creating notification:", notificationError);
      // Don't fail the main request if notification fails
    }

    return ok(res, {
      message: "Appointment status updated successfully",
      appointment: updatedAppointment,
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
      facility,
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

    if (facility) {
      // Find clinic by name and filter doctors by clinicDefaultId
      try {
        console.log("🔍 Searching for clinic with facility name:", facility);

        // Try exact match first
        let clinic = await Clinic.findOne({ name: facility });

        // If not found, try regex match
        if (!clinic) {
          clinic = await Clinic.findOne({
            name: { $regex: facility, $options: "i" },
          });
        }

        // If still not found, try partial match
        if (!clinic) {
          const words = facility.split(" ").filter((word) => word.length > 2);
          if (words.length > 0) {
            clinic = await Clinic.findOne({
              name: { $regex: words.join("|"), $options: "i" },
            });
          }
        }

        if (clinic) {
          filter.clinicDefaultId = clinic._id;
          console.log("✅ Found clinic:", clinic.name, "ID:", clinic._id);
          console.log("🔍 Filter will be:", JSON.stringify(filter, null, 2));
        } else {
          console.log("❌ Clinic not found for facility:", facility);
          // List all clinics for debugging
          const allClinics = await Clinic.find({}, "name").lean();
          console.log(
            "Available clinics:",
            allClinics.map((c) => c.name)
          );

          // Return empty results if clinic not found
          return ok(res, {
            doctors: [],
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              pages: 0,
            },
          });
        }
      } catch (error) {
        console.error("Error finding clinic:", error);
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Invalid facility name"
        );
      }
    }

    console.log("Doctor filter:", JSON.stringify(filter, null, 2)); // Debug log
    console.log("Specialization parameter:", specialization); // Debug log
    console.log("Facility parameter:", facility); // Debug log

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

    // Firebase user object has uid, not app_user_id
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User not authenticated");
    }

    // First, find the AuthProvider document by Firebase UID
    const authProvider = await AuthProvider.findOne({
      providerUid: firebaseUid,
      provider: "local",
    }).lean();

    if (!authProvider) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Auth provider not found");
    }

    // Then find the User document by userId from auth provider
    const user = await User.findById(authProvider.userId).lean();
    if (!user) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "User not found in database"
      );
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

    const {
      appointmentId,
      summaryText,
      reasonForVisit,
      visitDate,
      treatmentResult,
      consultationCategory,
      diagnoses,
      vitals,
      labResults,
      imagingResults,
      medications,
      procedures,
      treatmentMethod,
      nextAppointmentDate,
      followUpInstructions,
    } = req.body;

    // Debug logging
    console.log("🔍 Received imagingResults:", JSON.stringify(imagingResults, null, 2));
    console.log("🔍 Type of imagingResults:", typeof imagingResults);
    console.log("🔍 Is array:", Array.isArray(imagingResults));

    if (!appointmentId) {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Missing appointmentId");
    }

    // Check if appointment belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    }).populate("patientId clinicId");

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
    };

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
    if (followUpInstructions)
      summaryData.followUpInstructions = followUpInstructions;

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

    const { appointmentId, notes, attachmentUrl, diagnoses, medications } =
      req.body;

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
      mode: "online",
    }).populate("patientId clinicId");

    if (!appointment) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Appointment not found or not online"
      );
    }

    // Import ConsultationAdvice model
    const ConsultationAdvice = (
      await import("../models/consultationAdvice.model.js")
    ).default;

    const adviceData = {
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: doctor._id,
      clinicId: appointment.clinicId?._id,
      appointmentDate: appointment.scheduledStart,
      mode: "online",
      notes: notes,
      createdBy: doctor._id,
    };

    if (attachmentUrl) adviceData.attachmentUrl = attachmentUrl;
    if (diagnoses) adviceData.diagnoses = diagnoses;
    if (medications) adviceData.medications = medications;

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
 * Get public doctor reviews (for public viewing)
 */
export async function getPublicDoctorReviews(req, res) {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, search, rating, sort = "newest" } = req.query;
    const skip = (page - 1) * limit;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId)
      .populate("specializationIds", "name")
      .populate("clinicDefaultId", "name address")
      .lean();

    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    const filter = { doctorId: new mongoose.Types.ObjectId(doctorId) };

    if (rating && rating !== "all") {
      filter.rating = parseInt(rating);
    }

    if (search) {
      filter.comment = { $regex: search, $options: "i" };
    }

    let sortObj = {};
    switch (sort) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "highest":
        sortObj = { rating: -1 };
        break;
      case "lowest":
        sortObj = { rating: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const reviews = await Review.find(filter)
      .populate("patientId", "fullName avatarUrl")
      .populate("appointmentId", "scheduledStart mode status")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Review.countDocuments(filter);

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    let ratingDistribution = {};
    if (ratingStats.length > 0) {
      const distribution = ratingStats[0].ratingDistribution;
      for (let i = 1; i <= 5; i++) {
        ratingDistribution[i] = distribution.filter((r) => r === i).length;
      }
    }

    return ok(res, {
      doctor: {
        _id: doctor._id,
        fullName: doctor.fullName,
        avatarUrl: doctor.avatarUrl,
        specializationIds: doctor.specializationIds,
        clinicDefaultId: doctor.clinicDefaultId,
        ratingAvg: ratingStats[0]?.averageRating || 0,
        ratingCount: ratingStats[0]?.totalReviews || 0,
        ratingDistribution,
      },
      reviews: reviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        tags: review.tags || [],
        isAnonymous: review.isAnonymous,
        doctorResponse: review.doctorResponse,
        doctorResponseAt: review.doctorResponseAt,
        helpfulCount: review.helpfulCount,
        verified: review.verified,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        patient: {
          _id: review.patientId?._id,
          fullName: review.isAnonymous
            ? "Bệnh nhân"
            : review.patientId?.fullName || "Bệnh nhân",
          avatarUrl: review.isAnonymous ? null : review.patientId?.avatarUrl,
        },
        appointment: {
          _id: review.appointmentId?._id,
          scheduledStart: review.appointmentId?.scheduledStart,
          mode: review.appointmentId?.mode,
          status: review.appointmentId?.status,
        },
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("❌ getPublicDoctorReviews error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Create a new review for a doctor
 */
export async function createDoctorReview(req, res) {
  try {
    const { doctorId } = req.params;
    const { appointmentId, rating, comment, tags, isAnonymous } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    // Verify appointment exists and belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorId,
      status: "done", // Only allow reviews for completed appointments
    });

    if (!appointment) {
      return fail(
        res,
        404,
        ERROR_CODES.NOT_FOUND,
        "Appointment not found or not completed"
      );
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return fail(
        res,
        400,
        ERROR_CODES.BAD_REQUEST,
        "Review already exists for this appointment"
      );
    }

    // Create new review
    const review = new Review({
      appointmentId,
      patientId: appointment.patientId,
      doctorId,
      rating,
      comment,
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      verified: true,
    });

    await review.save();

    // Populate the review with patient and appointment data
    await review.populate([
      { path: "patientId", select: "fullName avatarUrl" },
      { path: "appointmentId", select: "scheduledStart mode status" },
    ]);

    return ok(res, { review }, "Review created successfully");
  } catch (e) {
    console.error("❌ createDoctorReview error:", e);
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

    // Import Appointment and Patient models
    const Appointment = (await import("../models/appointment.model.js")).default;
    const Patient = (await import("../models/patient.model.js")).default;
    
    // Get slot IDs to fetch appointments
    const slotIds = timeSlots.map(slot => slot._id);
    
    // Fetch appointments for these slots
    const appointments = await Appointment.find({ slotId: { $in: slotIds } })
      .populate({
        path: 'patientId',
        select: 'fullName',
        model: 'Patient'
      })
      .lean();
    
    // Create a map of slotId -> appointment
    const appointmentMap = {};
    console.log("🔍 START Mapping appointments, total:", appointments.length);
    appointments.forEach(appointment => {
      console.log("🔍 Processing appointment:", {
        _id: appointment._id?.toString(),
        slotId: appointment.slotId?.toString(),
        status: appointment.status,
        mode: appointment.mode
      });
      // Handle both populated patientId object and ObjectId
      let patientName = 'Bệnh nhân';
      if (appointment.patientId) {
        if (typeof appointment.patientId === 'object' && appointment.patientId.fullName) {
          patientName = appointment.patientId.fullName;
        } else if (typeof appointment.patientId === 'string') {
          // If it's still an ObjectId string, fetch the patient
          // For now, use a fallback
          patientName = 'Bệnh nhân';
        }
      }
      
      // Convert slotId to string for consistent lookup
      const slotIdKey = appointment.slotId.toString();
      const appointmentIdStr = appointment._id?.toString();
      
      console.log("🔍 STORING in map:", {
        slotIdKey: slotIdKey,
        appointmentId: appointmentIdStr,
        patientName: patientName
      });
      
      appointmentMap[slotIdKey] = {
        appointmentId: appointmentIdStr, // Add appointmentId
        patientName: patientName,
        reason: appointment.reason || null,
        appointmentStatus: appointment.status || 'booked', // Include appointment status
        mode: appointment.mode || 'offline' // Include mode (online/offline)
      };
    });
    
    console.log("🔍 COMPLETED mapping, appointmentMap:", Object.keys(appointmentMap).length, "entries");
    
    console.log("🔍 Found appointments:", appointments.length);
    console.log("🔍 Appointment map keys:", Object.keys(appointmentMap));
    if (appointments.length > 0) {
      console.log("🔍 Sample appointment:", {
        _id: appointments[0]._id,
        slotId: appointments[0].slotId?.toString(),
        patientId: appointments[0].patientId,
        reason: appointments[0].reason
      });
    }

    const serializedSlots = timeSlots.map(slot => {
      const slotIdStr = slot._id.toString();
      const appointment = appointmentMap[slotIdStr];
      
      // Map appointment status to display status
      let displayStatus = slot.status;
      if (appointment) {
        // Map appointment statuses to display statuses
        const statusMap = {
          'pending_doctor': 'pending',
          'accepted': 'confirmed',
          'in_progress': 'in_progress',
          'cancelled': 'cancelled',
          'done': 'completed',
          'rejected': 'cancelled',
          'no_show': 'cancelled'
        };
        displayStatus = statusMap[appointment.appointmentStatus] || slot.status;
      }
      
      console.log("🔍 Serializing slot:", {
        slotId: slotIdStr,
        hasAppointment: !!appointment,
        patientName: appointment?.patientName || 'null',
        appointmentStatus: appointment?.appointmentStatus,
        displayStatus: displayStatus,
        appointmentId: appointment?.appointmentId || 'null',
        fullAppointment: appointment
      });
      
      return {
        ...slot,
        _id: slot._id.toString(),
        doctorId: slot.doctorId.toString(),
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: displayStatus, // Use mapped status instead of slot.status
        displayStatus: displayStatus, // Keep displayStatus for reference
        patientName: appointment?.patientName || null,
        reason: appointment?.reason || null,
        mode: appointment?.mode || null,
        appointmentId: appointment?.appointmentId || null // Add appointmentId to slot - FROM appointmentMap
      };
    });

    console.log("🔍 Serialized slots count:", serializedSlots.length);
    const bookedSlots = serializedSlots.filter(s => s.status === 'booked');
    console.log("🔍 Booked slots count:", bookedSlots.length);
    if (bookedSlots.length > 0) {
      console.log("🔍 Sample booked slot:", {
        slotId: bookedSlots[0]._id,
        status: bookedSlots[0].status,
        patientName: bookedSlots[0].patientName,
        reason: bookedSlots[0].reason
      });
    }

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
 * Doctor creates appointment directly (no need for approval)
 */
export async function createAppointmentByDoctor(req, res) {
  try {
    console.log("🔍 createAppointmentByDoctor - req.user:", req.user);
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

    const { slotId, patientName, patientPhone, reason, mode, scheduledStart, scheduledEnd } = req.body;

    if (!patientName || !patientPhone || !reason || !mode || !scheduledStart || !scheduledEnd) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Missing required fields");
    }

    if (!["online", "offline"].includes(mode)) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Mode must be 'online' or 'offline'");
    }

    // Tìm hoặc tạo time slot
    let timeSlot;
    if (slotId) {
      // Nếu có slotId, tìm slot đó
      timeSlot = await DoctorTimeSlot.findById(slotId);
      if (!timeSlot) {
        return fail(res, 404, ERROR_CODES.NOT_FOUND, "Time slot not found");
      }
      if (timeSlot.doctorId.toString() !== doctor._id.toString()) {
        return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Time slot does not belong to this doctor");
      }
    } else {
      // Nếu không có slotId, tìm slot theo thời gian hoặc tạo mới
      const startAt = new Date(scheduledStart);
      const endAt = new Date(scheduledEnd);
      
      // Tìm slot với khoảng thời gian gần (trong vòng 1 phút để tránh lỗi do timezone)
      const oneMinute = 60 * 1000;
      timeSlot = await DoctorTimeSlot.findOne({
        doctorId: doctor._id,
        startAt: {
          $gte: new Date(startAt.getTime() - oneMinute),
          $lte: new Date(startAt.getTime() + oneMinute)
        },
        endAt: {
          $gte: new Date(endAt.getTime() - oneMinute),
          $lte: new Date(endAt.getTime() + oneMinute)
        }
      });

      if (!timeSlot) {
        // Tạo slot mới nếu chưa có
        timeSlot = await DoctorTimeSlot.create({
          doctorId: doctor._id,
          startAt: startAt,
          endAt: endAt,
          status: "available"
        });
        console.log("✅ Created new time slot:", timeSlot._id);
      }
    }

    // Find or create patient by phone number
    let patient = await Patient.findOne({ phone: patientPhone });
    
    if (!patient) {
      // Tìm User có số điện thoại này
      let patientUser = await User.findOne({ phone: patientPhone });
      
      if (!patientUser) {
        // Tạo User mới cho bệnh nhân
        patientUser = new User({
          email: `${patientPhone}@temp.medconnect.com`, // Temporary email
          fullName: patientName,
          phone: patientPhone,
          role: 'patient',
          authProvider: 'phone',
        });
        await patientUser.save();
        console.log("✅ Created new user for patient:", patientUser._id);
      }

      // Tạo Patient profile
      patient = new Patient({
        userId: patientUser._id,
        fullName: patientName,
        phone: patientPhone,
        isComplete: false,
      });
      await patient.save();
      console.log("✅ Created new patient profile:", patient._id);
    } else {
      // Cập nhật tên nếu khác
      if (patient.fullName !== patientName) {
        patient.fullName = patientName;
        await patient.save();
      }
    }

    // Check if slot is already booked (chỉ check các appointment còn active)
    const existingAppointment = await Appointment.findOne({ 
      slotId: timeSlot._id,
      status: { $nin: ["cancelled", "rejected", "no_show"] }
    });
    if (existingAppointment) {
      return fail(res, 400, ERROR_CODES.INVALID_INPUT, "Time slot has already been booked");
    }

    // Create appointment with accepted status (doctor booked, no approval needed)
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId: doctor._id,
      slotId: timeSlot._id,
      mode: mode,
      clinicId: mode === "offline" ? (req.body.clinicId || null) : undefined,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: new Date(scheduledEnd),
      status: "accepted", // Bác sĩ đặt nên không cần chờ duyệt
      reason: reason,
      acceptedBy: doctor._id, // Bác sĩ tự chấp nhận
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

    console.log("✅ Appointment created by doctor:", populatedAppointment._id);

    return ok(res, {
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("❌ createAppointmentByDoctor error:", error);
    
    // Handle duplicate slot booking error
    if (error.code === 11000) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "This time slot has already been booked"
      );
    }

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
      filename: req.file.filename,
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
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ getAllAppointments error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Get doctors for search page
 */
export async function getSearchDoctors(req, res) {
  try {
    const {
      search,
      specialization,
      location,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    // Search by name or specialty
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by specialization
    if (specialization) {
      filter.specializationIds = specialization;
    }

    // Filter by location (clinic)
    if (location) {
      filter.clinicDefaultId = location;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doctors = await Doctor.find(filter)
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone")
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
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    console.error("❌ getSearchDoctors error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get specializations for search page
 */
export async function getSearchSpecializations(req, res) {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const specializations = await Specialization.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Count doctors for each specialization
    const specializationsWithCount = await Promise.all(
      specializations.map(async (spec) => {
        const doctorCount = await Doctor.countDocuments({
          specializationIds: spec._id,
          isActive: true,
        });
        return { ...spec, doctorCount };
      })
    );

    const total = await Specialization.countDocuments(filter);

    return ok(res, {
      specializations: specializationsWithCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    console.error("❌ getSearchSpecializations error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get clinics for search page
 */
export async function getSearchClinics(req, res) {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const clinics = await Clinic.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get specializations available at each clinic
    const clinicsWithSpecializations = await Promise.all(
      clinics.map(async (clinic) => {
        const doctors = await Doctor.find({
          clinicDefaultId: clinic._id,
          isActive: true,
        }).populate("specializationIds", "name");

        const specializations = [
          ...new Set(
            doctors.flatMap((doctor) =>
              doctor.specializationIds.map((spec) => spec.name)
            )
          ),
        ];

        return { ...clinic, specializations };
      })
    );

    const total = await Clinic.countDocuments(filter);

    return ok(res, {
      clinics: clinicsWithSpecializations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    console.error("❌ getSearchClinics error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
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

