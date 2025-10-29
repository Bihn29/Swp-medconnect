import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Specialization from '../models/specialization.model.js';
import Appointment from '../models/appointment.model.js';
import Patient from '../models/patient.model.js';
import Clinic from '../models/clinic.model.js';
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
    
    // Revenue calculation based on appointments - get actual revenue from database
    const revenueAppointments = await Appointment.find({
      createdAt: { $gte: currentMonth },
      status: 'done' // Only count completed appointments
    });
    
    // Calculate actual revenue from completed appointments
    const revenue = revenueAppointments.reduce((total, appointment) => {
      return total + (appointment.fee || 0); // Use actual fee from appointment
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

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.fullName || doctor.userId?.fullName || 'Chưa có tên',
      email: doctor.userId?.email || 'Chưa có email',
      specialty: doctor.specializationIds?.map(s => s.name).join(', ') || 'Chưa chọn chuyên khoa',
      education: doctor.education?.map(edu => `${edu.degree} - ${edu.school}`).join(', ') || 'Chưa cập nhật',
      experience: `${doctor.yearsExperience || 0} năm kinh nghiệm`,
      license: doctor.licenseNo || 'Chưa có giấy phép',
      status: doctor.isVerified ? 'verified' : 'pending',
      submittedDate: formatDate(doctor.createdAt),
      avatar: doctor.avatarUrl || null
    }));
    
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
      .populate('userId', 'fullName email')
      .populate('specializationIds', 'name')
      .select('userId fullName licenseNo yearsExperience bio avatarUrl specializationIds education certifications createdAt')
      .sort({ createdAt: -1 });

    const formattedDoctors = pendingDoctors.map(doctor => ({
      id: doctor._id,
      name: doctor.fullName || doctor.userId?.fullName || 'Chưa có tên',
      specialty: doctor.specializationIds?.map(s => s.name).join(', ') || 'Chưa chọn chuyên khoa',
      education: doctor.education?.map(edu => `${edu.degree} - ${edu.school}`).join(', ') || 'Chưa cập nhật',
      experience: `${doctor.yearsExperience || 0} năm kinh nghiệm`,
      hospital: 'Chưa cập nhật', // Would need clinic integration
      license: doctor.licenseNo || 'Chưa có giấy phép',
      documents: [], // Would need document integration
      submittedDate: formatDate(doctor.createdAt),
      avatar: doctor.avatarUrl || null
    }));
    
    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách bác sĩ chờ xác minh'
    });
  }
};

// Get verified doctors
export const getVerifiedDoctors = async (req, res) => {
  try {
    const verifiedDoctors = await Doctor.find({ isVerified: true })
      .populate('userId', 'fullName email')
      .populate('specializationIds', 'name')
      .select('userId fullName licenseNo yearsExperience bio avatarUrl specializationIds education certifications updatedAt')
      .sort({ updatedAt: -1 });

    const formattedDoctors = verifiedDoctors.map(doctor => ({
      id: doctor._id,
      name: doctor.fullName || doctor.userId?.fullName || 'Chưa có tên',
      specialty: doctor.specializationIds?.map(s => s.name).join(', ') || 'Chưa chọn chuyên khoa',
      education: doctor.education?.map(edu => `${edu.degree} - ${edu.school}`).join(', ') || 'Chưa cập nhật',
      experience: `${doctor.yearsExperience || 0} năm kinh nghiệm`,
      hospital: 'Chưa cập nhật', // Would need clinic integration
      license: doctor.licenseNo || 'Chưa có giấy phép',
      verifiedDate: formatDate(doctor.updatedAt),
      verifiedBy: 'Admin', // Would need to track who verified
      avatar: doctor.avatarUrl || null
    }));
    
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

// Approve doctor
export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update doctor verification status in database
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã phê duyệt bác sĩ thành công'
    });
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phê duyệt bác sĩ'
    });
  }
};

// Reject doctor
export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, we'll just deactivate the doctor
    // In a real system, you'd have proper rejection tracking
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bác sĩ'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã từ chối bác sĩ'
    });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối bác sĩ'
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
