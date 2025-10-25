import React, { useState, useEffect } from "react";
import { User, Lock, CreditCard, Upload, Eye, EyeOff } from "lucide-react";
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
    // Lịch sử tiêm chủng
    vaccinationHistory: [],
    // Ghi chú
    notes: "",
    // Password change fields
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      // Format date for display (DD/MM/YYYY for date input)
      const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";

          // Format as DD/MM/YYYY for date input
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();

          return `${day}/${month}/${year}`;
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
        // Lịch sử tiêm chủng
        vaccinationHistory: userProfile.vaccinationHistory || [],
        // Ghi chú
        notes: userProfile.notes || "",
      };

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
        // Lịch sử tiêm chủng
        vaccinationHistory: [],
        // Ghi chú
        notes: "",
      });
    }
  }, [userProfile, profileLoading]);

  const tabs = [
    { id: "profile", label: "Hồ sơ", icon: User },
    { id: "security", label: "Bảo mật", icon: Lock },
    { id: "payment", label: "Thanh toán", icon: CreditCard },
  ];

  const validateField = (field, value) => {
    const errors = {};

    switch (field) {
      case "fullName":
        if (!value?.trim()) {
          errors.fullName = "Họ và tên là bắt buộc";
        } else if (value.trim().length < 2) {
          errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Email không đúng định dạng";
        }
        break;

      case "phone":
        if (
          value &&
          !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(value.replace(/\s/g, ""))
        ) {
          errors.phone = "Số điện thoại không đúng định dạng";
        }
        break;

      case "birthDate":
        if (value) {
          // Validate DD/MM/YYYY format
          const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          if (!dateRegex.test(value)) {
            errors.birthDate = "Ngày sinh phải có định dạng DD/MM/YYYY";
          } else {
            const [, day, month, year] = value.match(dateRegex);
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (birthDate > today) {
              errors.birthDate = "Ngày sinh không thể là tương lai";
            } else if (age > 120) {
              errors.birthDate = "Tuổi không hợp lệ";
            } else if (isNaN(birthDate.getTime())) {
              errors.birthDate = "Ngày sinh không hợp lệ";
            }
          }
        }
        break;

      case "citizenId":
        if (value && !/^[0-9]{9,12}$/.test(value)) {
          errors.citizenId = "CCCD/CMND phải có 9-12 chữ số";
        }
        break;

      case "representativeCitizenId":
        if (value && !/^[0-9]{9,12}$/.test(value)) {
          errors.representativeCitizenId =
            "CCCD/CMND người đại diện phải có 9-12 chữ số";
        }
        break;

      case "representativePhone":
        if (
          value &&
          !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(value.replace(/\s/g, ""))
        ) {
          errors.representativePhone =
            "Số điện thoại người đại diện không đúng định dạng";
        }
        break;

      case "emergencyContactPhone":
        if (
          value &&
          !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(value.replace(/\s/g, ""))
        ) {
          errors.emergencyContactPhone =
            "Số điện thoại liên hệ khẩn cấp không đúng định dạng";
        }
        break;

      case "allergies":
        if (value && value.length > 500) {
          errors.allergies = "Ghi chú dị ứng không được quá 500 ký tự";
        }
        break;

      case "notes":
        if (value && value.length > 1000) {
          errors.notes = "Ghi chú không được quá 1000 ký tự";
        }
        break;

      case "insuranceNumber":
        if (value && !/^[0-9]{10,15}$/.test(value.replace(/\s/g, ""))) {
          errors.insuranceNumber = "Số thẻ BHYT phải có 10-15 chữ số";
        }
        break;

      case "primaryClinic":
        if (value && value.trim().length < 3) {
          errors.primaryClinic = "Tên cơ sở y tế phải có ít nhất 3 ký tự";
        } else if (value && value.length > 200) {
          errors.primaryClinic = "Tên cơ sở y tế không được quá 200 ký tự";
        } else if (value && !/^[a-zA-ZÀ-ỹ\s\d\-.,()]+$/.test(value)) {
          errors.primaryClinic =
            "Tên cơ sở y tế chỉ được chứa chữ cái, số và ký tự đặc biệt cơ bản";
        }
        break;

      case "representativeName":
        if (value && value.trim().length < 2) {
          errors.representativeName =
            "Họ tên người đại diện phải có ít nhất 2 ký tự";
        } else if (value && value.length > 100) {
          errors.representativeName =
            "Họ tên người đại diện không được quá 100 ký tự";
        } else if (value && !/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          errors.representativeName =
            "Họ tên chỉ được chứa chữ cái và khoảng trắng";
        }
        break;

      case "emergencyContactName":
        if (value && value.trim().length < 2) {
          errors.emergencyContactName =
            "Họ tên người liên hệ khẩn cấp phải có ít nhất 2 ký tự";
        } else if (value && value.length > 100) {
          errors.emergencyContactName =
            "Họ tên người liên hệ khẩn cấp không được quá 100 ký tự";
        } else if (value && !/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          errors.emergencyContactName =
            "Họ tên chỉ được chứa chữ cái và khoảng trắng";
        }
        break;

      case "currentPassword":
        if (value && value.length < 6) {
          errors.currentPassword = "Mật khẩu hiện tại phải có ít nhất 6 ký tự";
        }
        break;

      case "newPassword":
        if (value && value.length < 6) {
          errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
        } else if (value && value.length > 50) {
          errors.newPassword = "Mật khẩu mới không được quá 50 ký tự";
        }
        break;

      case "confirmPassword":
        if (value && value !== formData.newPassword) {
          errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }
        break;
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Real-time validation
    const fieldValidation = validateField(field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: fieldValidation[field] || null,
    }));

    // If new password changes, re-validate confirm password
    if (field === "newPassword") {
      const confirmPasswordValidation = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordValidation.confirmPassword || null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields
    if (!formData.fullName?.trim()) {
      errors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không đúng định dạng";
    }

    // Validate phone format (Vietnamese phone numbers)
    if (
      formData.phone &&
      !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      errors.phone = "Số điện thoại không đúng định dạng";
    }

    // Validate date of birth
    if (formData.birthDate) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!dateRegex.test(formData.birthDate)) {
        errors.birthDate = "Ngày sinh phải có định dạng DD/MM/YYYY";
      } else {
        const [, day, month, year] = formData.birthDate.match(dateRegex);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (birthDate > today) {
          errors.birthDate = "Ngày sinh không thể là tương lai";
        } else if (age > 120) {
          errors.birthDate = "Tuổi không hợp lệ";
        } else if (isNaN(birthDate.getTime())) {
          errors.birthDate = "Ngày sinh không hợp lệ";
        }
      }
    }

    // Validate insurance dates
    if (formData.insuranceValidFrom && formData.insuranceValidTo) {
      const fromDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const toDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

      if (
        fromDateRegex.test(formData.insuranceValidFrom) &&
        toDateRegex.test(formData.insuranceValidTo)
      ) {
        const [, fromDay, fromMonth, fromYear] =
          formData.insuranceValidFrom.match(fromDateRegex);
        const [, toDay, toMonth, toYear] =
          formData.insuranceValidTo.match(toDateRegex);

        const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
        const toDate = new Date(toYear, toMonth - 1, toDay);

        if (fromDate >= toDate) {
          errors.insuranceValidTo = "Ngày hết hạn phải sau ngày có hiệu lực";
        }
      }
    }

    // Validate representative phone
    if (
      formData.representativePhone &&
      !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(
        formData.representativePhone.replace(/\s/g, "")
      )
    ) {
      errors.representativePhone =
        "Số điện thoại người đại diện không đúng định dạng";
    }

    // Validate emergency contact phone
    if (
      formData.emergencyContactPhone &&
      !/^(\+84|84|0)[1-9][0-9]{8,9}$/.test(
        formData.emergencyContactPhone.replace(/\s/g, "")
      )
    ) {
      errors.emergencyContactPhone =
        "Số điện thoại liên hệ khẩn cấp không đúng định dạng";
    }

    // Validate citizen ID format (Vietnamese CCCD/CMND)
    if (formData.citizenId && !/^[0-9]{9,12}$/.test(formData.citizenId)) {
      errors.citizenId = "CCCD/CMND phải có 9-12 chữ số";
    }

    // Validate representative citizen ID
    if (
      formData.representativeCitizenId &&
      !/^[0-9]{9,12}$/.test(formData.representativeCitizenId)
    ) {
      errors.representativeCitizenId =
        "CCCD/CMND người đại diện phải có 9-12 chữ số";
    }

    // Validate allergy notes length
    if (formData.allergies && formData.allergies.length > 500) {
      errors.allergies = "Ghi chú dị ứng không được quá 500 ký tự";
    }

    // Validate notes length
    if (formData.notes && formData.notes.length > 1000) {
      errors.notes = "Ghi chú không được quá 1000 ký tự";
    }

    // Validate insurance number format
    if (
      formData.insuranceNumber &&
      !/^[0-9]{10,15}$/.test(formData.insuranceNumber.replace(/\s/g, ""))
    ) {
      errors.insuranceNumber = "Số thẻ BHYT phải có 10-15 chữ số";
    }

    // Validate primary clinic name
    if (formData.primaryClinic) {
      if (formData.primaryClinic.trim().length < 3) {
        errors.primaryClinic = "Tên cơ sở y tế phải có ít nhất 3 ký tự";
      } else if (formData.primaryClinic.length > 200) {
        errors.primaryClinic = "Tên cơ sở y tế không được quá 200 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s\d\-.,()]+$/.test(formData.primaryClinic)) {
        errors.primaryClinic =
          "Tên cơ sở y tế chỉ được chứa chữ cái, số và ký tự đặc biệt cơ bản";
      }
    }

    // Validate representative name
    if (formData.representativeName) {
      if (formData.representativeName.trim().length < 2) {
        errors.representativeName =
          "Họ tên người đại diện phải có ít nhất 2 ký tự";
      } else if (formData.representativeName.length > 100) {
        errors.representativeName =
          "Họ tên người đại diện không được quá 100 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.representativeName)) {
        errors.representativeName =
          "Họ tên chỉ được chứa chữ cái và khoảng trắng";
      }
    }

    // Validate emergency contact name
    if (formData.emergencyContactName) {
      if (formData.emergencyContactName.trim().length < 2) {
        errors.emergencyContactName =
          "Họ tên người liên hệ khẩn cấp phải có ít nhất 2 ký tự";
      } else if (formData.emergencyContactName.length > 100) {
        errors.emergencyContactName =
          "Họ tên người liên hệ khẩn cấp không được quá 100 ký tự";
      } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.emergencyContactName)) {
        errors.emergencyContactName =
          "Họ tên chỉ được chứa chữ cái và khoảng trắng";
      }
    }

    return errors;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate form data
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        alert(
          "Vui lòng kiểm tra lại thông tin:\n" +
            Object.values(validationErrors).join("\n")
        );
        return;
      }

      // Format date for API (convert DD/MM/YYYY to ISO string)
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        try {
          // Handle DD/MM/YYYY format from text input
          const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          if (dateRegex.test(dateString)) {
            const [, day, month, year] = dateString.match(dateRegex);
            const date = new Date(year, month - 1, day);
            if (isNaN(date.getTime())) return null;
            return date.toISOString();
          }
          return null;
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
        // Lịch sử tiêm chủng
        vaccinationHistory: formData.vaccinationHistory,
        // Ghi chú
        notes: formData.notes,
      };

      // Call API to update patient profile
      const response = await updateCurrentPatientProfile(updateData);

      // Refresh the profile data
      await refreshProfile();

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
    // Thêm logic hủy thay đổi ở đây
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);

      // Validate password fields
      const passwordErrors = {};

      if (!formData.currentPassword?.trim()) {
        passwordErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
      }

      if (!formData.newPassword?.trim()) {
        passwordErrors.newPassword = "Mật khẩu mới là bắt buộc";
      } else if (formData.newPassword.length < 6) {
        passwordErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      }

      if (!formData.confirmPassword?.trim()) {
        passwordErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      } else if (formData.confirmPassword !== formData.newPassword) {
        passwordErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      if (Object.keys(passwordErrors).length > 0) {
        setFieldErrors(passwordErrors);
        alert("Vui lòng kiểm tra lại thông tin mật khẩu");
        return;
      }

      // TODO: Implement password change API call
      // const response = await changePassword({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      alert("Đổi mật khẩu thành công!");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsChangingPassword(false);
    }
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
                      className={`form-input ${
                        fieldErrors.fullName ? "error" : ""
                      }`}
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      placeholder="Nhập họ và tên"
                      required
                    />
                    {fieldErrors.fullName && (
                      <div className="error-text">{fieldErrors.fullName}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className={`form-input ${
                        fieldErrors.phone ? "error" : ""
                      }`}
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                    />
                    {fieldErrors.phone && (
                      <div className="error-text">{fieldErrors.phone}</div>
                    )}
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
                      className={`form-input ${
                        fieldErrors.email ? "error" : ""
                      }`}
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Nhập email"
                    />
                    {fieldErrors.email && (
                      <div className="error-text">{fieldErrors.email}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.birthDate ? "error" : ""
                      }`}
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                    />
                    {fieldErrors.birthDate && (
                      <div className="error-text">{fieldErrors.birthDate}</div>
                    )}
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
                      className={`form-input ${
                        fieldErrors.citizenId ? "error" : ""
                      }`}
                      value={formData.citizenId}
                      onChange={(e) =>
                        handleInputChange("citizenId", e.target.value)
                      }
                      placeholder="Nhập số CCCD/CMND"
                    />
                    {fieldErrors.citizenId && (
                      <div className="error-text">{fieldErrors.citizenId}</div>
                    )}
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
                      className={`form-input ${
                        fieldErrors.insuranceNumber ? "error" : ""
                      }`}
                      value={formData.insuranceNumber}
                      onChange={(e) =>
                        handleInputChange("insuranceNumber", e.target.value)
                      }
                      placeholder="Nhập số thẻ BHYT"
                    />
                    {fieldErrors.insuranceNumber && (
                      <div className="error-text">
                        {fieldErrors.insuranceNumber}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Cơ sở y tế đăng ký KCB ban đầu
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.primaryClinic ? "error" : ""
                      }`}
                      value={formData.primaryClinic}
                      onChange={(e) =>
                        handleInputChange("primaryClinic", e.target.value)
                      }
                      placeholder="Nhập tên cơ sở y tế"
                    />
                    {fieldErrors.primaryClinic && (
                      <div className="error-text">
                        {fieldErrors.primaryClinic}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">BHYT có hiệu lực từ</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.insuranceValidFrom}
                      onChange={(e) =>
                        handleInputChange("insuranceValidFrom", e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">BHYT có hiệu lực đến</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.insuranceValidTo}
                      onChange={(e) =>
                        handleInputChange("insuranceValidTo", e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
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
                      className={`form-input ${
                        fieldErrors.representativeName ? "error" : ""
                      }`}
                      value={formData.representativeName}
                      onChange={(e) =>
                        handleInputChange("representativeName", e.target.value)
                      }
                      placeholder="Nhập họ tên người đại diện"
                    />
                    {fieldErrors.representativeName && (
                      <div className="error-text">
                        {fieldErrors.representativeName}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Số CCCD/CMND người đại diện
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.representativeCitizenId ? "error" : ""
                      }`}
                      value={formData.representativeCitizenId}
                      onChange={(e) =>
                        handleInputChange(
                          "representativeCitizenId",
                          e.target.value
                        )
                      }
                      placeholder="Nhập số CCCD/CMND"
                    />
                    {fieldErrors.representativeCitizenId && (
                      <div className="error-text">
                        {fieldErrors.representativeCitizenId}
                      </div>
                    )}
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
                      className={`form-input ${
                        fieldErrors.representativePhone ? "error" : ""
                      }`}
                      value={formData.representativePhone}
                      onChange={(e) =>
                        handleInputChange("representativePhone", e.target.value)
                      }
                      placeholder="Nhập số điện thoại"
                    />
                    {fieldErrors.representativePhone && (
                      <div className="error-text">
                        {fieldErrors.representativePhone}
                      </div>
                    )}
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
                      className={`form-input ${
                        fieldErrors.emergencyContactName ? "error" : ""
                      }`}
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      placeholder="Nhập họ tên người liên hệ khẩn cấp"
                    />
                    {fieldErrors.emergencyContactName && (
                      <div className="error-text">
                        {fieldErrors.emergencyContactName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">
                      Số điện thoại liên hệ khẩn cấp
                    </label>
                    <input
                      type="tel"
                      className={`form-input ${
                        fieldErrors.emergencyContactPhone ? "error" : ""
                      }`}
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      placeholder="Nhập số điện thoại"
                    />
                    {fieldErrors.emergencyContactPhone && (
                      <div className="error-text">
                        {fieldErrors.emergencyContactPhone}
                      </div>
                    )}
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
                  className={`form-textarea allergies-textarea ${
                    fieldErrors.allergies ? "error" : ""
                  }`}
                  placeholder="Nhập các loại thuốc hoặc thực phẩm gây dị ứng..."
                  value={formData.allergies}
                  onChange={(e) =>
                    handleInputChange("allergies", e.target.value)
                  }
                  rows={4}
                />
                {fieldErrors.allergies && (
                  <div className="error-text">{fieldErrors.allergies}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Tiền sử bệnh lý</label>
                <textarea
                  className="form-textarea"
                  placeholder="Nhập các bệnh lý đã mắc phải (mỗi bệnh một dòng)..."
                  value={
                    formData.medicalHistory
                      ? formData.medicalHistory.join("\n")
                      : ""
                  }
                  onChange={(e) => {
                    const medicalHistory = e.target.value
                      .split("\n")
                      .filter((item) => item.trim());
                    handleInputChange("medicalHistory", medicalHistory);
                  }}
                  rows={4}
                />
                <div className="form-help-text">
                  Mỗi bệnh lý một dòng, ví dụ: Tiểu đường, Cao huyết áp, Hen
                  suyễn
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lịch sử tiêm chủng</label>
                <textarea
                  className="form-textarea"
                  placeholder="Nhập thông tin tiêm chủng (mỗi mũi tiêm một dòng)..."
                  value={
                    formData.vaccinationHistory
                      ? formData.vaccinationHistory
                          .map(
                            (v) =>
                              `${v.vaccineName || ""} - ${
                                v.date
                                  ? new Date(v.date).toLocaleDateString("vi-VN")
                                  : ""
                              } - ${v.place || ""}`
                          )
                          .join("\n")
                      : ""
                  }
                  onChange={(e) => {
                    const lines = e.target.value
                      .split("\n")
                      .filter((line) => line.trim());
                    const vaccinationHistory = lines.map((line) => {
                      const parts = line.split(" - ");
                      return {
                        vaccineName: parts[0] || "",
                        date: parts[1] ? new Date(parts[1]) : null,
                        place: parts[2] || "",
                      };
                    });
                    handleInputChange("vaccinationHistory", vaccinationHistory);
                  }}
                  rows={4}
                />
                <div className="form-help-text">
                  Định dạng: Tên vaccine - Ngày tiêm - Nơi tiêm (mỗi mũi tiêm
                  một dòng)
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú bổ sung</label>
                <textarea
                  className={`form-textarea ${
                    fieldErrors.notes ? "error" : ""
                  }`}
                  placeholder="Nhập các ghi chú khác về sức khỏe..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
                {fieldErrors.notes && (
                  <div className="error-text">{fieldErrors.notes}</div>
                )}
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

        {activeTab === "security" && (
          <div className="security-section">
            <div className="section-header">
              <h2 className="section-title">Bảo mật</h2>
            </div>

            <div className="change-password-form">
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <div className="password-input-container">
                  <Lock className="password-icon" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className={`form-input password-input ${
                      fieldErrors.currentPassword ? "error" : ""
                    }`}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={formData.currentPassword || ""}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {fieldErrors.currentPassword && (
                  <div className="error-text">
                    {fieldErrors.currentPassword}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <div className="password-input-container">
                  <Lock className="password-icon" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className={`form-input password-input ${
                      fieldErrors.newPassword ? "error" : ""
                    }`}
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword || ""}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <div className="error-text">{fieldErrors.newPassword}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <div className="password-input-container">
                  <Lock className="password-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`form-input password-input ${
                      fieldErrors.confirmPassword ? "error" : ""
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword || ""}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <div className="error-text">
                    {fieldErrors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                className="change-password-button"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
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
