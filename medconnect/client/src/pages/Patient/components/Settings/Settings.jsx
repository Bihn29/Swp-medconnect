import React, { useState } from "react";
import { User, Bell, Lock, CreditCard, Upload, Calendar } from "lucide-react";
import "./Settings.scss";

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn A",
    phone: "0912345678",
    gender: "Nam",
    email: "nguyenvana@email.com",
    birthDate: "01/01/1990",
    bloodType: "O+",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    allergies: "",
  });

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

  const handleSave = () => {
    console.log("Saving changes:", formData);
    // Thêm logic lưu dữ liệu ở đây
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
                  src="/patient-consultation.png"
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
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
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
                  <div className="date-input-container">
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingRight: "2.5rem" }}
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                    />
                    <Calendar className="calendar-icon" />
                  </div>
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
              <button className="save-button" onClick={handleSave}>
                Lưu thay đổi
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
