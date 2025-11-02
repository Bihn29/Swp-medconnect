import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Specialization from '../models/specialization.model.js';
import Appointment from '../models/appointment.model.js';
import Patient from '../models/patient.model.js';
import Clinic from '../models/clinic.model.js';
import Payment from '../models/payment.model.js';
import { runCleanupNow } from '../services/appointmentCleanupService.js';

// ================== HELPER FUNCTIONS ==================

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} ngày trước`;
  }
}

// Helper function to format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN');
}

// Helper function to format time
function formatTime(date) {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to get color for specialization
function getColorForSpecialization(name) {
  const colorMap = {
    'Tim mạch': '#ff4d4f',
    'Nội khoa': '#722ed1',
    'Da liễu': '#fa8c16',
    'Nha khoa': '#8c8c8c',
    'Tai mũi họng': '#faad14',
    'Mắt': '#52c41a',
    'Thần kinh': '#1890ff',
    'Nhi khoa': '#faad14'
  };
  return colorMap[name] || '#1890ff';
}

// ================== DASHBOARD CONTROLLERS ==================

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get real data from database
    const totalUsers = await User.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false });
    
    // Get current month appointments
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyAppointments = await Appointment.countDocuments({
      createdAt: { $gte: currentMonth }
    });
    
    // Revenue calculation based on successful payments - get actual revenue from Payment collection
    // Calculate total revenue from all successful payments (captured or authorized status)
    const successfulPayments = await Payment.find({
      status: { $in: ['captured', 'authorized'] }
    });
    
    // Calculate total revenue: sum of all successful payments minus refunds
    const revenue = successfulPayments.reduce((total, payment) => {
      // Total revenue = payment.total - refundAmount (if any)
      const netRevenue = payment.total - (payment.refundAmount || 0);
      return total + netRevenue;
    }, 0);
    
    const stats = {
      totalUsers,
      verifiedDoctors,
      pendingDoctors,
      monthlyAppointments,
      revenue
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thống kê dashboard'
    });
  }
};

// Dashboard activities
export const getDashboardActivities = async (req, res) => {
  try {
    // Get recent activities from database
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('fullName role createdAt');
    
    const recentDoctors = await Doctor.find()
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(2)
      .select('userId isVerified createdAt');
    
    const activities = [];
    
    // Add user registrations
    recentUsers.forEach(user => {
      const roleText = user.role === 'doctor' ? 'bác sĩ' : 'bệnh nhân';
      activities.push({
        title: `${user.fullName || 'Người dùng'} đã đăng ký tài khoản ${roleText}`,
        time: getTimeAgo(user.createdAt)
      });
    });
    
    // Add doctor verifications
    recentDoctors.forEach(doctor => {
      if (doctor.isVerified) {
        activities.push({
          title: `BS. ${doctor.userId.fullName} đã được xác minh`,
          time: getTimeAgo(doctor.createdAt)
        });
      }
    });
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    res.json({
      success: true,
      data: activities.slice(0, 4) // Return top 4 activities
    });
  } catch (error) {
    console.error('Error fetching dashboard activities:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải hoạt động gần đây'
    });
  }
};

// Dashboard system status
export const getSystemStatus = async (req, res) => {
  try {
    // Get real system metrics - use same logic as dashboard stats
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const pendingDoctors = await Doctor.countDocuments({ isVerified: false }); // Use same logic as dashboard stats
    
    const systemStatus = [
      { label: 'Người dùng hoạt động', value: activeUsers.toString(), status: 'success' },
      { label: 'Bác sĩ đang hoạt động', value: totalDoctors.toString(), status: 'success' },
      { label: 'Chờ xác minh', value: pendingDoctors.toString(), status: 'success' },
      { label: 'Uptime', value: '99.9%', status: 'success' }
    ];
    
    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải tình trạng hệ thống'
    });
  }
};

// ================== DOCTORS CONTROLLERS ==================

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const { search, status, specialization } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { licenseNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'pending') {
      query.isVerified = false;
    }
    
    // Add specialization filter
    if (specialization) {
      query.specializationIds = { $in: [specialization] };
    }
    
    const doctors = await Doctor.find(query)
      .populate('userId', 'fullName email')
      .populate('specializationIds', 'name')
      .select('userId fullName licenseNo yearsExperience bio avatarUrl specializationIds education certifications isVerified createdAt updatedAt')
      .sort({ createdAt: -1 });

    const formattedDoctors = doctors.map(doctor => {
      // Format specialty - handle null, undefined, or empty array
      let specialty = 'Chưa chọn chuyên khoa';
      if (doctor.specializationIds && Array.isArray(doctor.specializationIds) && doctor.specializationIds.length > 0) {
        const specialtyNames = doctor.specializationIds
          .filter(s => s && s.name) // Filter out null/undefined
          .map(s => s.name);
        if (specialtyNames.length > 0) {
          specialty = specialtyNames.join(', ');
        }
      }
      
      // Filter out picsum.photos URLs - replace with null to use default avatar
      let avatarUrl = doctor.avatarUrl || null;
      if (avatarUrl && avatarUrl.includes('picsum.photos')) {
        avatarUrl = null;
      }
      
      return {
        id: doctor._id,
        name: doctor.fullName || doctor.userId?.fullName || 'Chưa có tên',
        email: doctor.userId?.email || 'Chưa có email',
        specialty: specialty,
        education: doctor.education?.map(edu => `${edu.degree} - ${edu.school}`).join(', ') || 'Chưa cập nhật',
        experience: `${doctor.yearsExperience || 0} năm kinh nghiệm`,
        license: doctor.licenseNo || 'Chưa có giấy phép',
        status: doctor.isVerified ? 'verified' : 'pending',
        submittedDate: formatDate(doctor.createdAt),
        avatar: avatarUrl
      };
    });
    
    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách bác sĩ'
    });
  }
};

// Get pending doctors
export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isVerified: false })
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name')
      .populate('clinicDefaultId', 'name address')
      .select('userId fullName licenseNo yearsExperience bio avatarUrl specializationIds education certifications clinicDefaultId createdAt')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() to convert to plain objects

    // Debug: log first doctor to check populate
    if (pendingDoctors.length > 0) {
      console.log('📋 Sample doctor specializationIds:', JSON.stringify(pendingDoctors[0].specializationIds));
      console.log('📋 Sample doctor userId:', pendingDoctors[0].userId ? 'exists' : 'null');
    }

    // Format doctors data - license image comes from licenseNo field
    const formattedDoctors = pendingDoctors.map((doctor) => {
      try {
        // Build license image URL - if licenseNo exists, it's a filename in uploads/doctors/
        const licenseImageUrl = doctor.licenseNo 
          ? `/server-uploads/doctors/${doctor.licenseNo}`
          : null;

        // Format specialty - handle null, undefined, or empty array
        let specialty = 'Chưa chọn chuyên khoa';
        if (doctor.specializationIds && Array.isArray(doctor.specializationIds) && doctor.specializationIds.length > 0) {
          const specialtyNames = doctor.specializationIds
            .filter(s => s && s && s.name) // Filter out null/undefined
            .map(s => s.name)
            .filter(name => name); // Filter out empty names
          if (specialtyNames.length > 0) {
            specialty = specialtyNames.join(', ');
          }
        }

        // Filter out picsum.photos URLs - replace with null to use default avatar
        let avatarUrl = doctor.avatarUrl || null;
        if (avatarUrl && avatarUrl.includes('picsum.photos')) {
          avatarUrl = null;
        }

        // Safe access to userId
        const userId = doctor.userId || {};
        const clinicDefaultId = doctor.clinicDefaultId || {};

        return {
          id: doctor._id?.toString() || null,
          name: doctor.fullName || userId.fullName || 'Chưa có tên',
          email: userId.email || 'Chưa có email',
          phone: userId.phone || 'Chưa có số điện thoại',
          specialty: specialty,
          education: doctor.education && Array.isArray(doctor.education) && doctor.education.length > 0 
            ? doctor.education.map(edu => `${edu?.degree || 'N/A'} - ${edu?.school || 'N/A'}`).join(', ')
            : 'Chưa cập nhật',
          experience: `${doctor.yearsExperience || 0} năm kinh nghiệm`,
          hospital: clinicDefaultId.name || 'Chưa cập nhật',
          license: doctor.licenseNo || 'Chưa có giấy phép',
          licenseImageUrl: licenseImageUrl,
          bio: doctor.bio || 'Chưa có mô tả',
          certifications: doctor.certifications && Array.isArray(doctor.certifications) && doctor.certifications.length > 0
            ? doctor.certifications.map(cert => `${cert?.name || 'N/A'} - ${cert?.issuer || 'N/A'}`)
            : [],
          submittedDate: doctor.createdAt ? formatDate(doctor.createdAt) : 'Chưa có ngày',
          avatar: avatarUrl
        };
      } catch (formatError) {
        console.error('Error formatting doctor:', doctor._id, formatError);
        // Return a minimal safe object
        return {
          id: doctor._id?.toString() || 'unknown',
          name: 'Lỗi khi tải thông tin',
          email: 'N/A',
          phone: 'N/A',
          specialty: 'N/A',
          education: 'N/A',
          experience: 'N/A',
          hospital: 'N/A',
          license: 'N/A',
          licenseImageUrl: null,
          bio: 'N/A',
          certifications: [],
          submittedDate: 'N/A',
          avatar: null
        };
      }
    });
    
    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách bác sĩ chờ xác minh: ' + (error.message || String(error))
    });
  }
};

// Get verified doctors
export const getVerifiedDoctors = async (req, res) => {
  try {
    const verifiedDoctors = await Doctor.find({ isVerified: true })
      .populate('userId', 'fullName email phone')
      .populate('specializationIds', 'name')
      .populate('clinicDefaultId', 'name address')
      .select('userId fullName licenseNo yearsExperience bio avatarUrl specializationIds education certifications clinicDefaultId updatedAt')
      .sort({ updatedAt: -1 });

    // Debug: log first doctor to check populate
    if (verifiedDoctors.length > 0) {
      console.log('📋 Sample verified doctor specializationIds:', JSON.stringify(verifiedDoctors[0].specializationIds));
    }

    const formattedDoctors = verifiedDoctors.map(doctor => {
      // Build license image URL - if licenseNo exists, it's a filename in uploads/doctors/
      const licenseImageUrl = doctor.licenseNo 
        ? `/server-uploads/doctors/${doctor.licenseNo}`
        : null;
      
      // Format specialty - handle null, undefined, or empty array
      let specialty = 'Chưa chọn chuyên khoa';
      if (doctor.specializationIds && Array.isArray(doctor.specializationIds) && doctor.specializationIds.length > 0) {
        const specialtyNames = doctor.specializationIds
          .filter(s => s && s.name) // Filter out null/undefined
          .map(s => s.name);
        if (specialtyNames.length > 0) {
          specialty = specialtyNames.join(', ');
        }
      }
      
      // Filter out picsum.photos URLs - replace with null to use default avatar
      let avatarUrl = doctor.avatarUrl || null;
      if (avatarUrl && avatarUrl.includes('picsum.photos')) {
        avatarUrl = null;
      }
      
      return {
        id: doctor._id,
        name: doctor.fullName || doctor.userId?.fullName || 'Chưa có tên',
        email: doctor.userId?.email || 'Chưa có email',
        phone: doctor.userId?.phone || 'Chưa có số điện thoại',
        specialty: specialty,
        education: doctor.education?.length > 0
          ? doctor.education.map(edu => `${edu.degree || 'N/A'} - ${edu.school || 'N/A'}`).join(', ')
          : 'Chưa cập nhật',
        experience: `${doctor.yearsExperience || 0} năm kinh nghiệm`,
        hospital: doctor.clinicDefaultId?.name || 'Chưa cập nhật',
        license: doctor.licenseNo || 'Chưa có giấy phép',
        licenseImageUrl: licenseImageUrl,
        bio: doctor.bio || 'Chưa có mô tả',
        certifications: doctor.certifications?.length > 0
          ? doctor.certifications.map(cert => `${cert.name || 'N/A'} - ${cert.issuer || 'N/A'}`)
          : [],
        verifiedDate: formatDate(doctor.updatedAt),
        verifiedBy: 'Admin', // Would need to track who verified
        avatar: avatarUrl
      };
    });
    
    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching verified doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách bác sĩ đã xác minh'
    });
  }
};

// Get rejected doctors
export const getRejectedDoctors = async (req, res) => {
  try {
    // For now, return empty array since we don't have rejection tracking
    // In a real system, you'd have a status field or separate collection for rejected doctors
    const rejectedDoctors = [];
    
    res.json({
      success: true,
      data: rejectedDoctors
    });
  } catch (error) {
    console.error('Error fetching rejected doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách bác sĩ bị từ chối'
    });
  }
};

// Helper function: Send approval email to doctor
async function sendDoctorApprovalEmail(doctor, user) {
  try {
    if (!user || !user.email) {
      console.warn("⚠️ Doctor email not found, skipping approval email");
      return;
    }

    const doctorName = doctor.fullName || user.fullName || "Bác sĩ";
    const approvalDate = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
          Tài khoản bác sĩ của bạn đã được phê duyệt
        </h2>
        <p>Xin chào <strong>${doctorName}</strong>,</p>
        <p>Chúng tôi vui mừng thông báo rằng <strong style="color: #059669;">tài khoản bác sĩ của bạn đã được phê duyệt</strong> thành công bởi ban quản trị.</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #047857;">Thông tin tài khoản:</h3>
          <p style="margin: 8px 0;"><strong>Họ và tên:</strong> ${doctorName}</p>
          <p style="margin: 8px 0;"><strong>Email đăng nhập:</strong> ${user.email}</p>
          <p style="margin: 8px 0;"><strong>Ngày phê duyệt:</strong> ${approvalDate}</p>
        </div>

        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0284c7;">Hướng dẫn đăng nhập:</h3>
          <p>Bạn có thể đăng nhập vào hệ thống MedConnect bằng:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Mật khẩu:</strong> Mật khẩu bạn đã đăng ký</li>
          </ul>
          <p style="margin-top: 15px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Đăng nhập ngay
            </a>
          </p>
        </div>

        <p style="margin-top: 30px;"><strong>Lưu ý:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Đảm bảo bạn sử dụng đúng email và mật khẩu đã đăng ký</li>
          <li>Nếu quên mật khẩu, bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập</li>
          <li>Vui lòng cập nhật đầy đủ thông tin hồ sơ sau khi đăng nhập</li>
        </ul>
        
        <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        
        <p style="margin-top: 30px;">Trân trọng,<br><strong>MedConnect - Đội ngũ quản trị</strong></p>
      </div>
    `;

    const textContent = `
Tài khoản bác sĩ của bạn đã được phê duyệt

Xin chào ${doctorName},

Chúng tôi vui mừng thông báo rằng tài khoản bác sĩ của bạn đã được phê duyệt thành công bởi ban quản trị.

Thông tin tài khoản:
- Họ và tên: ${doctorName}
- Email đăng nhập: ${user.email}
- Ngày phê duyệt: ${approvalDate}

Hướng dẫn đăng nhập:
Bạn có thể đăng nhập vào hệ thống MedConnect bằng:
- Email: ${user.email}
- Mật khẩu: Mật khẩu bạn đã đăng ký

Link đăng nhập: ${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login

Lưu ý:
- Đảm bảo bạn sử dụng đúng email và mật khẩu đã đăng ký
- Nếu quên mật khẩu, bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập
- Vui lòng cập nhật đầy đủ thông tin hồ sơ sau khi đăng nhập

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
MedConnect - Đội ngũ quản trị
    `;

    const { sendMail } = await import("../utils/email.js");
    const emailResult = await sendMail({
      to: user.email,
      subject: "Tài khoản bác sĩ của bạn đã được phê duyệt - MedConnect",
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Approval email sent successfully to ${user.email}`);
    console.log(`📧 Email result:`, { messageId: emailResult?.messageId });
  } catch (error) {
    console.error("❌ Error sending doctor approval email:", error);
    // Không throw error để không ảnh hưởng đến flow chính
  }
}

// Helper function: Send rejection email to doctor
async function sendDoctorRejectionEmail(doctor, user, reason, rejectedBy) {
  try {
    if (!user || !user.email) {
      console.warn("⚠️ Doctor email not found, skipping rejection email");
      return;
    }

    const doctorName = doctor.fullName || user.fullName || "Bác sĩ";
    const rejectionDate = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const adminName = rejectedBy?.fullName || "Ban quản trị";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          Thông báo về đơn đăng ký tài khoản bác sĩ
        </h2>
        <p>Xin chào <strong>${doctorName}</strong>,</p>
        <p>Chúng tôi rất tiếc phải thông báo rằng <strong style="color: #dc2626;">đơn đăng ký tài khoản bác sĩ của bạn đã không được phê duyệt</strong>.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #b91c1c;">Thông tin đơn đăng ký:</h3>
          <p style="margin: 8px 0;"><strong>Họ và tên:</strong> ${doctorName}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 8px 0;"><strong>Ngày xử lý:</strong> ${rejectionDate}</p>
          <p style="margin: 8px 0;"><strong>Người xử lý:</strong> ${adminName}</p>
        </div>

        <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d97706;">Lý do từ chối:</h3>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border: 1px solid #fcd34d;">
            <p style="margin: 0; white-space: pre-wrap;">${reason || "Không có lý do cụ thể"}</p>
          </div>
        </div>

        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0284c7;">Bước tiếp theo:</h3>
          <p>Bạn có thể:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Đăng ký lại với thông tin đã được cập nhật và tuân thủ các yêu cầu</li>
            <li>Liên hệ với chúng tôi nếu bạn có thắc mắc về quyết định này</li>
            <li>Kiểm tra lại các tài liệu đã gửi và đảm bảo chúng đáp ứng đầy đủ yêu cầu</li>
          </ul>
          <p style="margin-top: 15px;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/auth/doctor-register" 
               style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Đăng ký lại
            </a>
          </p>
        </div>
        
        <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.</p>
        
        <p style="margin-top: 30px;">Trân trọng,<br><strong>MedConnect - Đội ngũ quản trị</strong></p>
      </div>
    `;

    const textContent = `
Thông báo về đơn đăng ký tài khoản bác sĩ

Xin chào ${doctorName},

Chúng tôi rất tiếc phải thông báo rằng đơn đăng ký tài khoản bác sĩ của bạn đã không được phê duyệt.

Thông tin đơn đăng ký:
- Họ và tên: ${doctorName}
- Email: ${user.email}
- Ngày xử lý: ${rejectionDate}
- Người xử lý: ${adminName}

Lý do từ chối:
${reason || "Không có lý do cụ thể"}

Bước tiếp theo:
Bạn có thể:
- Đăng ký lại với thông tin đã được cập nhật và tuân thủ các yêu cầu
- Liên hệ với chúng tôi nếu bạn có thắc mắc về quyết định này
- Kiểm tra lại các tài liệu đã gửi và đảm bảo chúng đáp ứng đầy đủ yêu cầu

Link đăng ký lại: ${process.env.CLIENT_URL || "http://localhost:5173"}/auth/doctor-register

Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.

Trân trọng,
MedConnect - Đội ngũ quản trị
    `;

    const { sendMail } = await import("../utils/email.js");
    const emailResult = await sendMail({
      to: user.email,
      subject: "Thông báo về đơn đăng ký tài khoản bác sĩ - MedConnect",
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Rejection email sent successfully to ${user.email}`);
    console.log(`📧 Email result:`, { messageId: emailResult?.messageId });
  } catch (error) {
    console.error("❌ Error sending doctor rejection email:", error);
    // Không throw error để không ảnh hưởng đến flow chính
  }
}

// Approve doctor
export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    // Find the doctor first and populate userId
    const doctor = await Doctor.findById(id).populate('userId', 'fullName email');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      });
    }
    
    // Get reviewer User if available
    let reviewer = null;
    if (req.user?.email) {
      reviewer = await User.findOne({ email: req.user.email });
    }
    
    // Update doctor verification status with approval info
    doctor.isVerified = true;
    doctor.isActive = true;
    doctor.approvedBy = reviewer ? reviewer._id : null;
    doctor.approvedAt = new Date();
    // Clear rejection info if exists
    doctor.rejectedBy = null;
    doctor.rejectedAt = null;
    doctor.rejectionReason = null;
    await doctor.save();
    
    // Verify the update was successful
    const updatedDoctor = await Doctor.findById(id);
    if (!updatedDoctor || !updatedDoctor.isVerified) {
      console.error('⚠️ Warning: Doctor verification update may not have persisted');
      await Doctor.updateOne(
        { _id: id },
        {
          isVerified: true,
          isActive: true,
          approvedBy: reviewer ? reviewer._id : null,
          approvedAt: new Date(),
          $unset: { rejectedBy: "", rejectedAt: "", rejectionReason: "" }
        }
      );
    }
    
    // Update User status to 'active' so doctor can login
    if (doctor.userId) {
      const user = await User.findByIdAndUpdate(
        doctor.userId,
        { status: 'active' },
        { new: true }
      );
      console.log(`✅ Updated User ${doctor.userId} status to 'active'`);
      
      // Send approval email (don't block on error)
      try {
        console.log(`📧 Attempting to send approval email to: ${user.email || doctor.userId?.email}`);
        await sendDoctorApprovalEmail(doctor, user || doctor.userId);
        console.log(`✅ Approval email sent successfully to ${user.email || doctor.userId?.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send approval email:", emailError);
        console.error("❌ Error details:", {
          message: emailError?.message,
          cause: emailError?.cause?.message,
          stack: emailError?.stack
        });
        // Continue even if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Đã phê duyệt bác sĩ thành công',
      data: {
        doctorId: id,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt bác sĩ: ' + error.message
    });
  }
};

// Reject doctor
export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Validate reason is required
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do từ chối'
      });
    }
    
    // Find the doctor first and populate userId
    const doctor = await Doctor.findById(id).populate('userId', 'fullName email');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      });
    }
    
    // Get reviewer User if available
    let reviewer = null;
    if (req.user?.email) {
      reviewer = await User.findOne({ email: req.user.email });
    }
    
    // Update doctor with rejection info
    doctor.isVerified = false;
    doctor.isActive = false;
    doctor.rejectedBy = reviewer ? reviewer._id : null;
    doctor.rejectedAt = new Date();
    doctor.rejectionReason = reason.trim();
    // Clear approval info if exists
    doctor.approvedBy = null;
    doctor.approvedAt = null;
    await doctor.save();
    
    // Update User status to 'rejected' (allows re-registration)
    if (doctor.userId) {
      const user = await User.findByIdAndUpdate(
        doctor.userId,
        { status: 'rejected' },
        { new: true }
      );
      console.log(`✅ Updated User ${doctor.userId} status to 'rejected'`);
      
      // Send rejection email (don't block on error)
      try {
        await sendDoctorRejectionEmail(doctor, user || doctor.userId, reason, reviewer);
      } catch (emailError) {
        console.error("⚠️ Failed to send rejection email:", emailError);
        // Continue even if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Đã từ chối bác sĩ thành công'
    });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối bác sĩ: ' + error.message
    });
  }
};

// ================== USERS CONTROLLERS ==================

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    
    // Build query
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('fullName email role status createdAt updatedAt')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.fullName || 'Chưa có tên',
      email: user.email,
      role: user.role,
      status: user.status === 'active' ? 'active' : 'inactive',
      joinDate: formatDate(user.createdAt),
      lastActive: formatDate(user.updatedAt),
      avatar: null
    }));
    
    res.json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách người dùng'
    });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { status: 'blocked' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã tạm khóa người dùng'
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạm khóa người dùng'
    });
  }
};

// Activate user
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã kích hoạt người dùng'
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kích hoạt người dùng'
    });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    let roleSpecificData = null;
    
    // Fetch role-specific data based on user role
    if (user.role === 'patient') {
      try {
        roleSpecificData = await Patient.findOne({ userId: id })
          .populate('userId', 'fullName email phone')
          .select('-__v');
      } catch (error) {
        console.error('Error fetching patient data:', error);
        // Continue without role-specific data
      }
    } else if (user.role === 'doctor') {
      try {
        roleSpecificData = await Doctor.findOne({ userId: id })
          .populate('userId', 'fullName email phone')
          .populate('specializationIds', 'name description avatar')
          .populate('clinicDefaultId', 'name address')
          .select('-__v');
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        // Continue without role-specific data
      }
    }
    
    // Combine user data with role-specific data
    const userDetails = {
      ...user.toObject(),
      roleSpecificData: roleSpecificData
    };
    
    res.json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thông tin người dùng'
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data if present
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin người dùng'
    });
  }
};

// Change user password
export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu không được để trống'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Hash the new password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(password, 10);
    
    user.password = hashedPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đổi mật khẩu'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã xóa người dùng'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng'
    });
  }
};

// ================== SPECIALIZATIONS CONTROLLERS ==================

// Get all specializations
export const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find()
      .select('name description avatar createdAt')
      .sort({ name: 1 });

    // Get doctor count for each specialization
    const specializationsWithCount = await Promise.all(
      specializations.map(async (spec) => {
        // Don't filter by isActive since all doctors have isActive: false in the database
        const doctorsWithSpec = await Doctor.find({
          specializationIds: { $in: [spec._id.toString()] }
        }).select('fullName specializationIds');
        
        const doctorCount = doctorsWithSpec.length;
        
        return {
          id: spec._id,
          name: spec.name,
          description: spec.description,
          doctorCount,
          color: getColorForSpecialization(spec.name),
          avatar: spec.avatar || null
        };
      })
    );
    
    res.json({
      success: true,
      data: specializationsWithCount
    });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách chuyên khoa'
    });
  }
};

// Add specialization
export const addSpecialization = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    
    // Check if specialization already exists
    const existingSpec = await Specialization.findOne({ name });
    if (existingSpec) {
      return res.status(400).json({
        success: false,
        message: 'Chuyên khoa đã tồn tại'
      });
    }
    
    const specialization = new Specialization({
      name,
      description: description || `Chuyên khoa ${name}`,
      avatar: avatar || null
    });
    
    await specialization.save();
    
    res.json({
      success: true,
      message: 'Đã thêm chuyên khoa thành công',
      data: {
        id: specialization._id,
        name: specialization.name,
        description: specialization.description,
        color: getColorForSpecialization(name),
        doctorCount: 0,
        avatar: specialization.avatar
      }
    });
  } catch (error) {
    console.error('Error adding specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm chuyên khoa'
    });
  }
};

// Update specialization
export const updateSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, avatar } = req.body;
    
    const specialization = await Specialization.findByIdAndUpdate(
      id,
      { 
        name,
        description: description || `Chuyên khoa ${name}`,
        avatar: avatar || null
      },
      { new: true }
    );
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chuyên khoa'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã cập nhật chuyên khoa thành công',
      data: {
        id: specialization._id,
        name: specialization.name,
        description: specialization.description,
        color: getColorForSpecialization(name),
        avatar: specialization.avatar
      }
    });
  } catch (error) {
    console.error('Error updating specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật chuyên khoa'
    });
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't filter by isActive since all doctors have isActive: false in the database
    const doctors = await Doctor.find({
      specializationIds: { $in: [id] }
    })
    .populate('userId', 'fullName email')
    .select('userId fullName licenseNo bio avatarUrl yearsExperience ratingAvg')
    .sort({ fullName: 1 });

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      fullName: doctor.fullName || doctor.userId?.fullName || 'Chưa có tên',
      email: doctor.userId?.email || 'Chưa có email',
      licenseNo: doctor.licenseNo || null,
      bio: doctor.bio || null,
      avatarUrl: doctor.avatarUrl || null,
      yearsExperience: doctor.yearsExperience || 0,
      ratingAvg: doctor.ratingAvg || 0
    }));

    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching doctors by specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách bác sĩ'
    });
  }
};

// Delete specialization
export const deleteSpecialization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any doctors are using this specialization
    const doctorCount = await Doctor.countDocuments({ specializationIds: id });
    if (doctorCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa chuyên khoa này vì có ${doctorCount} bác sĩ đang sử dụng`
      });
    }
    
    const specialization = await Specialization.findByIdAndDelete(id);
    
    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chuyên khoa'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã xóa chuyên khoa thành công'
    });
  } catch (error) {
    console.error('Error deleting specialization:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa chuyên khoa'
    });
  }
};

// ================== APPOINTMENTS CONTROLLERS ==================

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      
      query.scheduledStart = {
        $gte: start,
        $lte: end
      };
    }
    
    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        select: 'fullName phone address userId',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      })
      .populate({
        path: 'doctorId',
        select: 'fullName licenseNo yearsExperience ratingAvg bio userId specializationIds',
        populate: [
          {
            path: 'userId',
            select: 'fullName email'
          },
          {
            path: 'specializationIds',
            select: 'name'
          }
        ]
      })
      .populate('clinicId', 'name')
      .select('patientId doctorId clinicId scheduledStart scheduledEnd status mode reason createdAt cancelledAt cancelledBy cancelReason')
      .sort({ scheduledStart: -1 });

    const formattedAppointments = appointments.map((appointment, index) => {
      const patient = appointment.patientId;
      const doctor = appointment.doctorId;
      const specializations = appointment.doctorId?.specializationIds;
      const clinic = appointment.clinicId;
      
      return {
        id: appointment._id,
        sequentialId: index + 1, // ID bắt đầu từ 1
        
        // Thông tin bệnh nhân
        patientName: patient?.fullName || 'Chưa có tên',
        patientEmail: patient?.userId?.email || 'Chưa có email',
        patientPhone: patient?.phone || null,
        patientAddress: patient?.address || null,
        
        // Thông tin bác sĩ
        doctorName: doctor?.fullName || doctor?.userId?.fullName || 'Chưa có tên',
        doctorEmail: doctor?.userId?.email || 'Chưa có email',
        doctorSpecialty: specializations?.map(s => s.name).join(', ') || 'Chưa chọn chuyên khoa',
        doctorLicense: doctor?.licenseNo || null,
        doctorBio: doctor?.bio || null,
        
        // Thông tin phòng khám
        clinicName: clinic?.name || null,
        
        // Thông tin lịch hẹn
        appointmentDate: formatDate(appointment.scheduledStart),
        appointmentTime: formatTime(appointment.scheduledStart),
        scheduledStart: appointment.scheduledStart,
        scheduledEnd: appointment.scheduledEnd,
        status: appointment.status,
        mode: appointment.mode,
        reason: appointment.reason || 'Không có lý do',
        
        // Thông tin hủy lịch
        cancelledAt: appointment.cancelledAt,
        cancelledBy: appointment.cancelledBy,
        cancelReason: appointment.cancelReason,
        
        // Thông tin hệ thống
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      };
    });
    
    res.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách lịch hẹn'
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái lịch hẹn'
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái lịch hẹn'
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã xóa lịch hẹn'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch hẹn'
    });
  }
};

// ================== CLEANUP CONTROLLER ==================

/**
 * Chạy cleanup appointments chưa thanh toán ngay lập tức
 * GET /api/admin/cleanup/unpaid-appointments
 */
export const cleanupUnpaidAppointments = async (req, res) => {
  try {
    console.log('🔄 Manual cleanup triggered by admin');
    const result = await runCleanupNow();
    
    res.json({
      success: true,
      data: result,
      message: `Đã hủy ${result.cancelled} lịch hẹn và giải phóng ${result.slotsReleased} slot`
    });
  } catch (error) {
    console.error('Error running cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi chạy cleanup: ' + error.message
    });
  }
};

// ================== PAYMENT REVENUE CONTROLLER ==================

/**
 * Helper function to get date range based on period
 */
function getDateRange(period, req = null) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(today);
      endDate = new Date(now);
      break;
    case 'thisWeek':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(now);
      break;
    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(now);
      break;
    case 'threeMonths':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      endDate = new Date(now);
      break;
    case 'thisYear':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(now);
      break;
    case '24hours':
      startDate = new Date(now);
      startDate.setHours(startDate.getHours() - 24);
      endDate = new Date(now);
      break;
    case '7days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date(now);
      break;
    case '30days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date(now);
      break;
    case '1year':
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate = new Date(now);
      break;
    case 'all':
      startDate = new Date(0); // Beginning of time
      endDate = new Date(now);
      break;
    case 'custom':
      // Custom date range will be passed via query params
      if (req && req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(today);
        endDate = new Date(now);
      }
      break;
    default:
      startDate = new Date(today);
      endDate = new Date(now);
  }
  
  return { startDate, endDate };
}

/**
 * Get payment revenue statistics
 * GET /api/admin/payment/revenue-stats?period=yesterday
 */
export const getPaymentRevenueStats = async (req, res) => {
  try {
    const { period = 'today', startDate: startDateParam, endDate: endDateParam } = req.query;
    let startDate, endDate;
    
    if (period === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const range = getDateRange(period, req);
      startDate = range.startDate;
      endDate = range.endDate;
    }
    
    // Get current period payments
    const currentPayments = await Payment.find({
      status: { $in: ['captured', 'authorized'] },
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('appointmentId');
    
    // Calculate previous period for comparison
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    const periodDiff = endDate - startDate;
    
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDiff - 1);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodDiff - 1);
    
    const previousPayments = await Payment.find({
      status: { $in: ['captured', 'authorized'] },
      createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
    });
    
    // Calculate total revenue
    const totalRevenue = currentPayments.reduce((sum, payment) => {
      return sum + (payment.total - (payment.refundAmount || 0));
    }, 0);
    
    const previousRevenue = previousPayments.reduce((sum, payment) => {
      return sum + (payment.total - (payment.refundAmount || 0));
    }, 0);
    
    // Calculate revenue change percentage
    const revenueChange = previousRevenue > 0 
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
      : (totalRevenue > 0 ? 100 : 0);
    
    // Count completed orders (payments)
    const totalCompletedOrders = currentPayments.length;
    const previousCompletedOrders = previousPayments.length;
    
    const ordersChange = previousCompletedOrders > 0
      ? Math.round(((totalCompletedOrders - previousCompletedOrders) / previousCompletedOrders) * 100)
      : (totalCompletedOrders > 0 ? 100 : 0);
    
    // Revenue by payment channel
    const revenueByChannel = {};
    currentPayments.forEach(payment => {
      const channelName = payment.gateway || 'MedConnect';
      if (!revenueByChannel[channelName]) {
        revenueByChannel[channelName] = 0;
      }
      revenueByChannel[channelName] += payment.total - (payment.refundAmount || 0);
    });
    
    const revenueByChannelArray = Object.entries(revenueByChannel).map(([name, amount]) => ({
      name,
      amount
    }));
    
    // Order status statistics
    const allPayments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const paidCount = allPayments.filter(p => ['captured', 'authorized'].includes(p.status)).length;
    const cancelledCount = allPayments.filter(p => ['cancelled', 'voided', 'failed'].includes(p.status)).length;
    
    // Revenue trend (hourly for today/yesterday, monthly for 3 months, daily for others)
    let revenueTrend = [];
    if (period === 'today' || period === 'yesterday' || period === '24hours') {
      // Hourly trend
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(startDate);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(startDate);
        hourEnd.setHours(hour, 59, 59, 999);
        
        const hourPayments = currentPayments.filter(p => {
          const paymentDate = new Date(p.createdAt);
          return paymentDate >= hourStart && paymentDate <= hourEnd;
        });
        
        const hourRevenue = hourPayments.reduce((sum, p) => sum + (p.total - (p.refundAmount || 0)), 0);
        const hourTransactionCount = hourPayments.length;
        
        const dateStr = `${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
        revenueTrend.push({
          label: `Th${dateStr} ${hour.toString().padStart(2, '0')}`,
          amount: hourRevenue,
          transactionCount: hourTransactionCount
        });
      }
    } else if (period === 'threeMonths') {
      // Monthly trend for 3-month period
      const monthlyRevenue = {};
      currentPayments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        const monthKey = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            amount: 0,
            transactionCount: 0
          };
        }
        
        monthlyRevenue[monthKey].amount += payment.total - (payment.refundAmount || 0);
        monthlyRevenue[monthKey].transactionCount += 1;
      });
      
      // Generate all months in the range, even if no revenue
      const currentMonth = new Date(startDate);
      while (currentMonth <= endDate) {
        const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthData = monthlyRevenue[monthKey] || { amount: 0, transactionCount: 0 };
        
        revenueTrend.push({
          label: `Th${currentMonth.getMonth() + 1}`,
          amount: monthData.amount,
          transactionCount: monthData.transactionCount
        });
        
        // Move to next month
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    } else {
      // Daily trend for weekly/monthly periods
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayPayments = currentPayments.filter(p => {
          const paymentDate = new Date(p.createdAt);
          return paymentDate >= dayStart && paymentDate <= dayEnd;
        });
        
        const dayRevenue = dayPayments.reduce((sum, p) => sum + (p.total - (p.refundAmount || 0)), 0);
        const dayTransactionCount = dayPayments.length;
        
        const dateStr = `${(dayStart.getMonth() + 1).toString().padStart(2, '0')}-${dayStart.getDate().toString().padStart(2, '0')}`;
        // Format: Th10-30 (without day of week here, will be added in frontend)
        revenueTrend.push({
          label: `Th${dateStr}`,
          amount: dayRevenue,
          transactionCount: dayTransactionCount
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalCompletedOrders,
        revenueChange,
        ordersChange,
        revenueByChannel: revenueByChannelArray,
        orderStatus: {
          paid: paidCount,
          cancelled: cancelledCount,
          total: allPayments.length
        },
        revenueTrend,
        totalTransactions: currentPayments.length
      }
    });
  } catch (error) {
    console.error('Error fetching payment revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thống kê doanh thu'
    });
  }
};

/**
 * Get invoices/payments list
 * GET /api/admin/payment/invoices?period=yesterday
 */
export const getAdminInvoices = async (req, res) => {
  try {
    const { period = 'today', startDate: startDateParam, endDate: endDateParam } = req.query;
    let startDate, endDate;
    
    if (period === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const range = getDateRange(period, req);
      startDate = range.startDate;
      endDate = range.endDate;
    }
    
    // Get payments for the selected period, sorted by latest first
    const payments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate('appointmentId', 'scheduledStart status')
      .populate('billTo.patientId', 'fullName')
      .populate('billFrom.doctorId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to latest 100 invoices
    
    const formattedInvoices = payments.map(payment => ({
      _id: payment._id,
      invoiceNumber: payment.invoiceNumber,
      orderCode: payment.orderCode,
      appointmentId: payment.appointmentId?._id,
      patientName: payment.billTo?.name,
      doctorName: payment.billFrom?.doctorName,
      gateway: payment.gateway,
      method: payment.method,
      status: payment.status,
      subtotal: payment.subtotal,
      discount: payment.discount || 0,
      total: payment.total,
      refundAmount: payment.refundAmount || 0,
      paidAt: payment.paidAt || payment.capturedAt || payment.createdAt,
      createdAt: payment.createdAt,
      currency: payment.currency || 'VND'
    }));
    
    res.json({
      success: true,
      data: formattedInvoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách hóa đơn'
    });
  }
};
