import React, { useState, useEffect } from "react";
import { User, Bell, Lock, CreditCard, Upload } from "lucide-react";
import { useUserProfile } from "../../../../hooks/useUserProfile";
import { updateCurrentPatientProfile } from "../../../../lib/api";
import "./Settings.scss";

export function Settings() {
  const {
    userProfile,
    refreshProfile,
    loading: profileLoading,
  } = useUserProfile();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    email: "",
    birthDate: "",
    bloodType: "",
    address: "",
    allergies: "",
    // Thông tin cá nhân bổ sung
    ethnicity: "",
    nationality: "",
    occupation: "",
    citizenId: "",
    // Địa chỉ chi tiết (không có wardCode, districtCode, provinceCode)
    houseNumber: "",
    // Bảo hiểm y tế
    insuranceNumber: "",
    primaryClinic: "",
    insuranceValidFrom: "",
    insuranceValidTo: "",
    // Người đại diện
    representativeName: "",
    representativeCitizenId: "",
    representativeRelation: "",
    representativePhone: "",
    // Liên hệ khẩn cấp
    emergencyContactName: "",
    emergencyContactPhone: "",
    // Tiền sử y tế
    medicalHistory: [],
    // Ghi chú
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      // Format date for display (YYYY-MM-DD for date input)
      const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";

          // Format as YYYY-MM-DD for date input
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");

          return `${year}-${month}-${day}`;
        } catch (error) {
          return "";
        }
      };

      const newFormData = {
        fullName: userProfile.fullName || userProfile.displayName || "",
        phone: userProfile.phone || "",
        gender: userProfile.gender || "",
        email: userProfile.email || "",
        birthDate: formatDateForDisplay(userProfile.dob),
        bloodType: userProfile.bloodType || "",
        address: userProfile.address || "",
        allergies: userProfile.allergyNotes || "",
        // Thông tin cá nhân bổ sung
        ethnicity: userProfile.ethnicity || "",
        nationality: userProfile.nationality || "Vietnam",
        occupation: userProfile.occupation || "",
        citizenId: userProfile.citizenId || "",
        // Địa chỉ chi tiết
        houseNumber: userProfile.houseNumber || "",
        // Bảo hiểm y tế
        insuranceNumber: userProfile.insuranceNumber || "",
        primaryClinic: userProfile.primaryClinic || "",
        insuranceValidFrom: formatDateForDisplay(
          userProfile.insuranceValidFrom
        ),
        insuranceValidTo: formatDateForDisplay(userProfile.insuranceValidTo),
        // Người đại diện
        representativeName: userProfile.representativeName || "",
        representativeCitizenId: userProfile.representativeCitizenId || "",
        representativeRelation: userProfile.representativeRelation || "",
        representativePhone: userProfile.representativePhone || "",
        // Liên hệ khẩn cấp
        emergencyContactName: userProfile.emergencyContactName || "",
        emergencyContactPhone: userProfile.emergencyContactPhone || "",
        // Tiền sử y tế
        medicalHistory: userProfile.medicalHistory || [],
        // Ghi chú
        notes: userProfile.notes || "",
      };

      console.log("=== FORM DATA UPDATED ===");
      console.log("New form data:", newFormData);
      console.log("Blood type from profile:", userProfile.bloodType);
      console.log("Allergy notes from profile:", userProfile.allergyNotes);

      setFormData(newFormData);
    } else if (!profileLoading) {
      // If no user profile and not loading, set empty form to allow editing
      setFormData({
        fullName: "",
        phone: "",
        gender: "",
        email: "",
        birthDate: "",
        bloodType: "",
        address: "",
        allergies: "",
        // Thông tin cá nhân bổ sung
        ethnicity: "",
        nationality: "Vietnam",
        occupation: "",
        citizenId: "",
        // Địa chỉ chi tiết
        houseNumber: "",
        // Bảo hiểm y tế
        insuranceNumber: "",
        primaryClinic: "",
        insuranceValidFrom: "",
        insuranceValidTo: "",
        // Người đại diện
        representativeName: "",
        representativeCitizenId: "",
        representativeRelation: "",
        representativePhone: "",
        // Liên hệ khẩn cấp
        emergencyContactName: "",
        emergencyContactPhone: "",
        // Tiền sử y tế
        medicalHistory: [],
        // Ghi chú
        notes: "",
      });
    }
  }, [userProfile, profileLoading]);

  const tabs = [
    { id: "profile", label: "Hồ sơ", icon: User },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "security", label: "Bảo mật", icon: Lock },
    { id: "payment", label: "Thanh toán", icon: CreditCard },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("=== SAVING PROFILE ===");
      console.log("Form data:", formData);

      // Format date for API (convert YYYY-MM-DD to ISO string)
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        try {
          // Handle YYYY-MM-DD format from date input
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return null;
          return date.toISOString();
        } catch (error) {
          return null;
        }
      };

      // Prepare data for API
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        dob: formatDateForAPI(formData.birthDate),
        address: formData.address,
        bloodType: formData.bloodType,
        allergyNotes: formData.allergies,
        // Thông tin cá nhân bổ sung
        ethnicity: formData.ethnicity,
        nationality: formData.nationality,
        occupation: formData.occupation,
        citizenId: formData.citizenId,
        // Địa chỉ chi tiết
        houseNumber: formData.houseNumber,
        // Bảo hiểm y tế
        insuranceNumber: formData.insuranceNumber,
        primaryClinic: formData.primaryClinic,
        insuranceValidFrom: formatDateForAPI(formData.insuranceValidFrom),
        insuranceValidTo: formatDateForAPI(formData.insuranceValidTo),
        // Người đại diện
        representativeName: formData.representativeName,
        representativeCitizenId: formData.representativeCitizenId,
        representativeRelation: formData.representativeRelation,
        representativePhone: formData.representativePhone,
        // Liên hệ khẩn cấp
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        // Tiền sử y tế
        medicalHistory: formData.medicalHistory,
        // Ghi chú
        notes: formData.notes,
      };

      console.log("Data to send to API:", updateData);

      // Call API to update patient profile
      const response = await updateCurrentPatientProfile(updateData);
      console.log("API Response:", response);

      // Refresh the profile data
      await refreshProfile();
      console.log("Profile refreshed");

      // Show success message
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log("Cancelling changes");
    // Thêm logic hủy thay đổi ở đây
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Cài đặt</h1>
        <p className="settings-subtitle">
          Quản lý thông tin tài khoản và tùy chọn cá nhân
        </p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="settings-content">
        {activeTab === "profile" && (
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Thông tin cá nhân</h2>
              <p className="section-subtitle">
                Cập nhật thông tin hồ sơ của bạn
              </p>
            </div>

            {/* Profile Picture */}
            <div className="profile-picture-section">
              <div className="avatar-container">
                <img
                  src={
                    userProfile?.photoURL ||
                    userProfile?.avatar ||
                    "/patient-consultation.png"
                  }
                  alt="Profile"
                  className="profile-avatar"
                />
              </div>
              <div className="upload-section">
                <button className="upload-button">
                  <Upload className="upload-icon" />
                  Tải ảnh lên
                </button>
                <p className="upload-text">JPG, PNG tối đa 2MB</p>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="form-section">
              <h3 className="section-subtitle">Thông tin cơ bản</h3>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giới tính</label>
                    <select
                      className="form-input"
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dân tộc</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.ethnicity}
                      onChange={(e) =>
                        handleInputChange("ethnicity", e.target.value)
                      }
                      placeholder="Nhập dân tộc"
                    />
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quốc tịch</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nationality}
                      onChange={(e) =>
                        handleInputChange("nationality", e.target.value)
                      }
                      placeholder="Nhập quốc tịch"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nghề nghiệp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.occupation}
                      onChange={(e) =>
                        handleInputChange("occupation", e.target.value)
                      }
                      placeholder="Nhập nghề nghiệp"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="form-section">
              <h3 className="section-subtitle">Địa chỉ</h3>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-textarea"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      placeholder="Nhập địa chỉ đầy đủ"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số nhà</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.houseNumber}
                      onChange={(e) =>
                        handleInputChange("houseNumber", e.target.value)
                      }
                      placeholder="Nhập số nhà"
                    />
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">CCCD/CMND</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.citizenId}
                      onChange={(e) =>
                        handleInputChange("citizenId", e.target.value)
                      }
                      placeholder="Nhập số CCCD/CMND"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin y tế */}
            <div className="form-section">
              <h3 className="section-subtitle">Thông tin y tế</h3>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Nhóm máu</label>
                    <select
                      className="form-input"
                      value={formData.bloodType}
                      onChange={(e) =>
                        handleInputChange("bloodType", e.target.value)
                      }
                    >
                      <option value="">Chọn nhóm máu</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Unknown">Không rõ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảo hiểm y tế */}
            <div className="form-section">
              <h3 className="section-subtitle">Bảo hiểm y tế</h3>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Số thẻ BHYT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.insuranceNumber}
                      onChange={(e) =>
                        handleInputChange("insuranceNumber", e.target.value)
                      }
                      placeholder="Nhập số thẻ BHYT"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Cơ sở y tế đăng ký KCB ban đầu
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.primaryClinic}
                      onChange={(e) =>
                        handleInputChange("primaryClinic", e.target.value)
                      }
                      placeholder="Nhập tên cơ sở y tế"
                    />
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">BHYT có hiệu lực từ</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.insuranceValidFrom}
                      onChange={(e) =>
                        handleInputChange("insuranceValidFrom", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">BHYT có hiệu lực đến</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.insuranceValidTo}
                      onChange={(e) =>
                        handleInputChange("insuranceValidTo", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Người đại diện */}
            <div className="form-section">
              <h3 className="section-subtitle">Người đại diện (nếu có)</h3>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Họ tên người đại diện</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.representativeName}
                      onChange={(e) =>
                        handleInputChange("representativeName", e.target.value)
                      }
                      placeholder="Nhập họ tên người đại diện"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Số CCCD/CMND người đại diện
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.representativeCitizenId}
                      onChange={(e) =>
                        handleInputChange(
                          "representativeCitizenId",
                          e.target.value
                        )
                      }
                      placeholder="Nhập số CCCD/CMND"
                    />
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">Mối quan hệ</label>
                    <select
                      className="form-input"
                      value={formData.representativeRelation}
                      onChange={(e) =>
                        handleInputChange(
                          "representativeRelation",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Chọn mối quan hệ</option>
                      <option value="father">Cha</option>
                      <option value="mother">Mẹ</option>
                      <option value="spouse">Vợ/Chồng</option>
                      <option value="child">Con</option>
                      <option value="grandparent">Ông/Bà</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Số điện thoại người đại diện
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.representativePhone}
                      onChange={(e) =>
                        handleInputChange("representativePhone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Liên hệ khẩn cấp */}
            <div className="form-section">
              <h3 className="section-subtitle">Liên hệ khẩn cấp</h3>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">
                      Họ tên người liên hệ khẩn cấp
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      placeholder="Nhập họ tên người liên hệ khẩn cấp"
                    />
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">
                      Số điện thoại liên hệ khẩn cấp
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dị ứng và tiền sử y tế */}
            <div className="form-section">
              <h3 className="section-subtitle">Thông tin y tế bổ sung</h3>

              <div className="form-group allergies-group">
                <label className="form-label">Dị ứng (nếu có)</label>
                <textarea
                  className="form-textarea allergies-textarea"
                  placeholder="Nhập các loại thuốc hoặc thực phẩm gây dị ứng..."
                  value={formData.allergies}
                  onChange={(e) =>
                    handleInputChange("allergies", e.target.value)
                  }
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú bổ sung</label>
                <textarea
                  className="form-textarea"
                  placeholder="Nhập các ghi chú khác về sức khỏe..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="cancel-button" onClick={handleCancel}>
                Hủy
              </button>
              <button
                className="save-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="notifications-section">
            <div className="section-header">
              <h2 className="section-title">Cài đặt thông báo</h2>
              <p className="section-subtitle">
                Quản lý cách bạn nhận thông báo từ hệ thống
              </p>
            </div>

            <div className="notification-settings">
              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-title">Thông báo lịch hẹn</h3>
                  <p className="setting-description">
                    Nhận thông báo về lịch hẹn mới, thay đổi lịch hẹn
                  </p>
                </div>
                <div className="setting-toggle">
                  <input
                    type="checkbox"
                    id="appointment-notifications"
                    defaultChecked
                  />
                  <label
                    htmlFor="appointment-notifications"
                    className="toggle-label"
                  >
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-title">Thông báo tư vấn</h3>
                  <p className="setting-description">
                    Nhận thông báo khi bác sĩ trả lời tư vấn trực tuyến
                  </p>
                </div>
                <div className="setting-toggle">
                  <input
                    type="checkbox"
                    id="consultation-notifications"
                    defaultChecked
                  />
                  <label
                    htmlFor="consultation-notifications"
                    className="toggle-label"
                  >
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-title">Thông báo email</h3>
                  <p className="setting-description">
                    Nhận thông báo qua email về các hoạt động quan trọng
                  </p>
                </div>
                <div className="setting-toggle">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    defaultChecked
                  />
                  <label htmlFor="email-notifications" className="toggle-label">
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3 className="setting-title">Thông báo SMS</h3>
                  <p className="setting-description">
                    Nhận thông báo qua tin nhắn SMS
                  </p>
                </div>
                <div className="setting-toggle">
                  <input type="checkbox" id="sms-notifications" />
                  <label htmlFor="sms-notifications" className="toggle-label">
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="security-section">
            <div className="section-header">
              <h2 className="section-title">Bảo mật tài khoản</h2>
              <p className="section-subtitle">
                Quản lý mật khẩu và bảo mật tài khoản
              </p>
            </div>

            <div className="security-settings">
              <div className="security-item">
                <div className="security-info">
                  <h3 className="security-title">Đổi mật khẩu</h3>
                  <p className="security-description">
                    Thay đổi mật khẩu để bảo vệ tài khoản của bạn
                  </p>
                </div>
                <button className="security-button">Đổi mật khẩu</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h3 className="security-title">Xác thực 2 bước</h3>
                  <p className="security-description">
                    Thêm lớp bảo mật bổ sung cho tài khoản
                  </p>
                </div>
                <button className="security-button">Kích hoạt</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h3 className="security-title">Đăng nhập gần đây</h3>
                  <p className="security-description">
                    Xem lịch sử đăng nhập và thiết bị đã sử dụng
                  </p>
                </div>
                <button className="security-button">Xem lịch sử</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="payment-section">
            <div className="section-header">
              <h2 className="section-title">Thông tin thanh toán</h2>
              <p className="section-subtitle">
                Quản lý phương thức thanh toán và hóa đơn
              </p>
            </div>

            <div className="payment-settings">
              <div className="payment-item">
                <div className="payment-info">
                  <h3 className="payment-title">Phương thức thanh toán</h3>
                  <p className="payment-description">
                    Quản lý thẻ tín dụng, ví điện tử
                  </p>
                </div>
                <button className="payment-button">Quản lý</button>
              </div>

              <div className="payment-item">
                <div className="payment-info">
                  <h3 className="payment-title">Lịch sử thanh toán</h3>
                  <p className="payment-description">
                    Xem tất cả giao dịch và hóa đơn
                  </p>
                </div>
                <button className="payment-button">Xem lịch sử</button>
              </div>

              <div className="payment-item">
                <div className="payment-info">
                  <h3 className="payment-title">Hóa đơn điện tử</h3>
                  <p className="payment-description">
                    Tải xuống hóa đơn và biên lai
                  </p>
                </div>
                <button className="payment-button">Tải xuống</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
