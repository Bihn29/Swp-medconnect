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

            {/* Form Fields */}
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <textarea
                    className="form-textarea"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
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
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                  <label className="form-label">Nhóm máu</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.bloodType}
                    onChange={(e) =>
                      handleInputChange("bloodType", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="form-group allergies-group">
              <label className="form-label">Dị ứng (nếu có)</label>
              <textarea
                className="form-textarea allergies-textarea"
                placeholder="Nhập các loại thuốc hoặc thực phẩm gây dị ứng..."
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                rows={4}
              />
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
            <h2 className="section-title">Cài đặt thông báo</h2>
            <p className="section-subtitle">
              Quản lý cách bạn nhận thông báo từ hệ thống
            </p>
            {/* Thêm nội dung thông báo ở đây */}
          </div>
        )}

        {activeTab === "security" && (
          <div className="security-section">
            <h2 className="section-title">Bảo mật tài khoản</h2>
            <p className="section-subtitle">
              Quản lý mật khẩu và bảo mật tài khoản
            </p>
            {/* Thêm nội dung bảo mật ở đây */}
          </div>
        )}

        {activeTab === "payment" && (
          <div className="payment-section">
            <h2 className="section-title">Thông tin thanh toán</h2>
            <p className="section-subtitle">
              Quản lý phương thức thanh toán và hóa đơn
            </p>
            {/* Thêm nội dung thanh toán ở đây */}
          </div>
        )}
      </div>
    </div>
  );
}
