"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { User, Mail, Phone, MapPin, Award, Calendar, Lock } from "lucide-react"
import { getDoctorProfileWithFallback, updateDoctorProfile } from "../../../lib/api"
import "./ProfileSettings.scss"

const ProfileSettings = () => {
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordErrors, setPasswordErrors] = useState({})
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

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validatePassword = () => {
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại"
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới"
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại"
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return
    }
    
    try {
      // Call API to change password
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      })
      
      if (response.ok) {
        alert("Mật khẩu đã được thay đổi thành công")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        setPasswordErrors({})
      } else {
        if (response.status === 400) {
          setPasswordErrors({ currentPassword: "Mật khẩu hiện tại không đúng" })
        } else {
          alert("Có lỗi xảy ra khi thay đổi mật khẩu")
        }
      }
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Có lỗi xảy ra khi thay đổi mật khẩu")
    }
  }


  if (loading) {
    return (
      <div className="profileSettings">
        <div className="container">
          <div className="header">
            <h1>Đang tải thông tin...</h1>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="profileSettings">
      <div className="container">
        {/* Main Content */}
        <div className="main">
            {/* Basic Information */}
            <div className="card">
              <div className="cardHeader">
                <div className="icon cyan">
                  <User size={20} />
                </div>
                <h2>Thông tin cơ bản</h2>
              </div>

              <div className="formGrid">
                <div className="formGroup">
                  <FormField
                    label="Họ và tên"
                    icon={User}
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <FormField
                    label="Chuyên khoa"
                    icon={Award}
                    value={formData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <FormField
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <FormField
                    label="Số điện thoại"
                    icon={Phone}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="formGroup fullWidth">
                  <FormField
                    label="Địa chỉ"
                    icon={MapPin}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
                <div className="formGroup fullWidth">
                  <label>Giới thiệu</label>
                  <textarea
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Nhập thông tin giới thiệu về bạn..."
                    className="textarea"
                  />
                </div>
              </div>

              <div className="formActions">
                <button onClick={handleSave}>
                  Lưu thay đổi
                </button>
              </div>
            </div>

            {/* Professional Information and Security - Side by Side */}
            <div className="twoColumnGrid">
              {/* Professional Information */}
              <div className="card">
                <div className="cardHeader">
                  <div className="icon blue">
                    <Award size={20} />
                  </div>
                  <h2>Thông tin chuyên môn</h2>
                </div>

                <div className="infoCards">
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
              <div className="card">
                <div className="cardHeader">
                  <div className="icon red">
                    <Lock size={20} />
                  </div>
                  <h2>Bảo mật</h2>
                </div>

                <div className="securitySection">
                <PasswordField
                  label="Mật khẩu hiện tại"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  error={passwordErrors.currentPassword}
                />
                <PasswordField
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  error={passwordErrors.newPassword}
                />
                <PasswordField
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  showPassword={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  error={passwordErrors.confirmPassword}
                />

                <button className="securityButton" onClick={handleChangePassword}>
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
const FormField = ({ label, icon: Icon, type = "text", value, onChange }) => (
  <div className="formGroup">
    <label>{label}</label>
    <div className="inputWrapper">
      <Icon size={18} className="icon" />
      <input
        type={type}
        value={value}
        onChange={onChange}
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
}

const InfoCard = ({ icon: Icon, title, content }) => (
  <div className="infoCard">
    <Icon className="icon" size={20} />
    <div className="content">
      <div className="title">{title}</div>
      <div className="value">{content}</div>
    </div>
  </div>
)

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
}

const PasswordField = ({ label, placeholder, value, onChange, showPassword, onToggle, error }) => (
  <div className="passwordField">
    <label>{label}</label>
    <div className={`inputWrapper ${error ? 'error' : ''}`}>
      <Lock size={18} className="icon" />
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
      />
      <i
        className={`bi ${
          showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"
        } password-toggle`}
        onClick={onToggle}
      />
    </div>
    {error && <div className="error-text">{error}</div>}
  </div>
)

PasswordField.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  error: PropTypes.string,
}

export default ProfileSettings
