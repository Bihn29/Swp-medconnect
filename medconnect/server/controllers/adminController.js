import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";
import { sendMail } from "../utils/email.js";

/**
 * Get pending doctor registrations
 */
export async function getPendingDoctors(req, res) {
  try {
    const pendingDoctors = await User.find({
      role: "doctor",
      status: "pending"
    })
    .populate({
      path: "doctorProfile",
      model: "Doctor",
      select: "licenseNo isVerified isActive"
    })
    .select("-passwordHash")
    .lean();

    return ok(res, { doctors: pendingDoctors });
  } catch (e) {
    console.error("❌ /api/admin/pending-doctors error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Approve doctor registration
 */
export async function approveDoctor(req, res) {
  try {
    const { doctorId } = req.params;
    const { adminNotes } = req.body || {};

    // Find the doctor user
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "Doctor not found");
    }

    if (doctorUser.role !== "doctor") {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "User is not a doctor");
    }

    if (doctorUser.status !== "pending") {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Doctor is not pending approval");
    }

    // Update user status to active
    doctorUser.status = "active";
    await doctorUser.save();

    // Update doctor profile
    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    if (doctorProfile) {
      doctorProfile.isVerified = true;
      doctorProfile.isActive = true;
      await doctorProfile.save();
    }

    // Send approval email
    try {
      await sendMail({
        to: doctorUser.email,
        subject: "Tài khoản bác sĩ đã được phê duyệt - MedConnect",
        text: `Chào mừng bạn đến với MedConnect!\n\nTài khoản bác sĩ của bạn đã được admin phê duyệt thành công. Bây giờ bạn có thể đăng nhập và sử dụng hệ thống.\n\nThông tin tài khoản:\n- Email: ${doctorUser.email}\n- Họ tên: ${doctorUser.fullName}\n\n${adminNotes ? `Ghi chú từ admin: ${adminNotes}\n\n` : ''}Trân trọng,\nĐội ngũ MedConnect`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Chào mừng bạn đến với MedConnect!</h2>
            <p>Tài khoản bác sĩ của bạn đã được admin phê duyệt thành công. Bây giờ bạn có thể đăng nhập và sử dụng hệ thống.</p>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0891b2; margin-top: 0;">Thông tin tài khoản:</h3>
              <p><strong>Email:</strong> ${doctorUser.email}</p>
              <p><strong>Họ tên:</strong> ${doctorUser.fullName}</p>
            </div>
            
            ${adminNotes ? `<div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #d97706; margin-top: 0;">Ghi chú từ admin:</h3>
              <p>${adminNotes}</p>
            </div>` : ''}
            
            <p style="margin-top: 30px;">Trân trọng,<br>Đội ngũ MedConnect</p>
          </div>
        `
      });
    } catch (emailError) {
      console.warn("Failed to send approval email:", emailError);
    }

    console.log(`[approveDoctor] Doctor ${doctorId} approved by admin`);

    return ok(res, {
      message: "Doctor approved successfully",
      doctor: {
        id: doctorUser._id,
        fullName: doctorUser.fullName,
        email: doctorUser.email,
        status: doctorUser.status
      }
    });
  } catch (e) {
    console.error("❌ /api/admin/approve-doctor error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Reject doctor registration
 */
export async function rejectDoctor(req, res) {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body || {};

    // Find the doctor user
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "Doctor not found");
    }

    if (doctorUser.role !== "doctor") {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "User is not a doctor");
    }

    if (doctorUser.status !== "pending") {
      return fail(res, 400, ERROR_CODES.BAD_REQUEST, "Doctor is not pending approval");
    }

    // Update user status to blocked (rejected)
    doctorUser.status = "blocked";
    await doctorUser.save();

    // Update doctor profile
    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    if (doctorProfile) {
      doctorProfile.isVerified = false;
      doctorProfile.isActive = false;
      await doctorProfile.save();
    }

    // Send rejection email
    try {
      await sendMail({
        to: doctorUser.email,
        subject: "Thông báo về đơn đăng ký tài khoản bác sĩ - MedConnect",
        text: `Xin chào ${doctorUser.fullName},\n\nRất tiếc, đơn đăng ký tài khoản bác sĩ của bạn đã không được phê duyệt.\n\n${reason ? `Lý do từ chối: ${reason}\n\n` : 'Vui lòng kiểm tra lại thông tin đăng ký và liên hệ với chúng tôi nếu bạn có thắc mắc.\n\n'}Trân trọng,\nĐội ngũ MedConnect`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Thông báo về đơn đăng ký</h2>
            <p>Xin chào <strong>${doctorUser.fullName}</strong>,</p>
            
            <p>Rất tiếc, đơn đăng ký tài khoản bác sĩ của bạn đã không được phê duyệt.</p>
            
            ${reason ? `<div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin-top: 0;">Lý do từ chối:</h3>
              <p>${reason}</p>
            </div>` : ''}
            
            <p>Vui lòng kiểm tra lại thông tin đăng ký và liên hệ với chúng tôi nếu bạn có thắc mắc.</p>
            
            <p style="margin-top: 30px;">Trân trọng,<br>Đội ngũ MedConnect</p>
          </div>
        `
      });
    } catch (emailError) {
      console.warn("Failed to send rejection email:", emailError);
    }

    console.log(`[rejectDoctor] Doctor ${doctorId} rejected by admin`);

    return ok(res, {
      message: "Doctor rejected successfully",
      doctor: {
        id: doctorUser._id,
        fullName: doctorUser.fullName,
        email: doctorUser.email,
        status: doctorUser.status
      }
    });
  } catch (e) {
    console.error("❌ /api/admin/reject-doctor error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}

/**
 * Get all doctors (approved and pending)
 */
export async function getAllDoctors(req, res) {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { role: "doctor" };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const doctors = await User.find(query)
      .populate({
        path: "doctorProfile",
        model: "Doctor",
        select: "licenseNo isVerified isActive ratingAvg ratingCount"
      })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

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
    console.error("❌ /api/admin/doctors error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
}
