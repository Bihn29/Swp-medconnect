"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { User, Mail, Phone, MapPin, Award, Calendar, Lock, Eye, EyeOff } from "lucide-react"
import { getDoctorProfileWithFallback, updateDoctorProfile } from "../../../lib/api"

const ProfileSettings = () => {
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    address: "",
    bio: "",
    licenseNo: "",
    graduationYear: "",
    yearsExperience: 0,
    ratingAvg: 0,
    ratingCount: 0,
  })

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const doctor = await getDoctorProfileWithFallback()
        if (doctor) {
          setDoctorInfo(doctor)
          setFormData({
            fullName: doctor.userId?.fullName || doctor.fullName || "",
            email: doctor.userId?.email || "",
            phone: doctor.userId?.phone || "",
            specialization: doctor.specializationIds?.[0]?.name || "",
            address: doctor.clinicDefaultId?.address || "",
            bio: doctor.bio || "",
            licenseNo: doctor.licenseNo || "",
            graduationYear: doctor.education?.[0]?.year || "",
            yearsExperience: doctor.yearsExperience || 0,
            ratingAvg: doctor.ratingAvg || 0,
            ratingCount: doctor.ratingCount || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching doctor info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorInfo()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      const response = await updateDoctorProfile(formData)
      if (response) {
        alert("Thông tin đã được cập nhật thành công")
      } else {
        alert("Có lỗi xảy ra khi cập nhật thông tin")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Có lỗi xảy ra khi cập nhật thông tin")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-slate-600">Đang tải thông tin...</div>
        </div>
      </div>
    )
  }

  const fullName = formData.fullName || ""
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "BS"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-slate-600">Quản lý hồ sơ và cài đặt bảo mật của bạn</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sticky top-8">
              {/* Avatar Section */}
              <div className="text-center mb-8 pb-8 border-b border-slate-200">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                  {initials}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{formData.fullName}</h3>
                <p className="text-sm text-slate-600 mb-4">{formData.specialization}</p>
                <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-colors text-sm">
                  Thay đổi ảnh
                </button>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-xl border border-cyan-100">
                  <div className="text-2xl font-bold text-cyan-600 mb-1">{formData.ratingCount}</div>
                  <div className="text-xs font-medium text-slate-600">Bệnh nhân</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{formData.yearsExperience}</div>
                  <div className="text-xs font-medium text-slate-600">Năm kinh nghiệm</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{formData.ratingAvg.toFixed(1)}</div>
                  <div className="text-xs font-medium text-slate-600">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <User size={20} className="text-cyan-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Thông tin cơ bản</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Họ và tên"
                    icon={User}
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                  <FormField
                    label="Chuyên khoa"
                    icon={Award}
                    value={formData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  <FormField
                    label="Số điện thoại"
                    icon={Phone}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <FormField
                  label="Địa chỉ"
                  icon={MapPin}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  fullWidth
                />

                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-slate-900 text-sm">Giới thiệu</label>
                  <textarea
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Nhập thông tin giới thiệu về bạn..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm resize-none transition-all focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Award size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Thông tin chuyên môn</h2>
              </div>

              <div className="space-y-4">
                <InfoCard
                  icon={Award}
                  title="Bằng cấp"
                  content={`${doctorInfo?.education?.[0]?.degree || "Bác sĩ Đa khoa"} - ${doctorInfo?.education?.[0]?.school || "ĐH Y Dược"}`}
                />
                <InfoCard icon={Calendar} title="Năm tốt nghiệp" content={formData.graduationYear || "N/A"} />
                <InfoCard icon={Award} title="Chứng chỉ hành nghề" content={`Số ${formData.licenseNo || "N/A"}`} />
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Lock size={20} className="text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Bảo mật</h2>
              </div>

              <div className="space-y-6">
                <PasswordField
                  label="Mật khẩu hiện tại"
                  placeholder="Nhập mật khẩu hiện tại"
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <PasswordField
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
                <PasswordField
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />

                <button className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg">
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
const FormField = ({ label, icon: Icon, type = "text", value, onChange, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <label className="block font-semibold text-slate-900 text-sm mb-2">{label}</label>
    <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
      <Icon size={18} className="text-slate-400 flex-shrink-0" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="flex-1 border-none outline-none bg-transparent text-slate-900 placeholder-slate-400"
      />
    </div>
  </div>
)

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool,
}

const InfoCard = ({ icon: Icon, title, content }) => (
  <div className="flex gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
    <Icon className="text-cyan-600 flex-shrink-0" size={20} />
    <div className="flex-1">
      <div className="text-xs font-medium text-slate-600 mb-1">{title}</div>
      <div className="font-semibold text-slate-900">{content}</div>
    </div>
  </div>
)

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
}

const PasswordField = ({ label, placeholder, showPassword, onToggle }) => (
  <div>
    <label className="block font-semibold text-slate-900 text-sm mb-2">{label}</label>
    <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
      <Lock size={18} className="text-slate-400 flex-shrink-0" />
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="flex-1 border-none outline-none bg-transparent text-slate-900 placeholder-slate-400"
      />
      <button type="button" onClick={onToggle} className="text-slate-400 hover:text-slate-600 transition-colors">
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
)

PasswordField.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  showPassword: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
}

export default ProfileSettings
