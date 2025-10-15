import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./DoctorRegister.scss";

export default function DoctorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    licenseNumber: "",
    licenseImage: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const specialties = [
    "Nội khoa",
    "Ngoại khoa", 
    "Sản phụ khoa",
    "Nhi khoa",
    "Tim mạch",
    "Thần kinh",
    "Da liễu",
    "Mắt",
    "Tai mũi họng",
    "Răng hàm mặt",
    "Chấn thương chỉnh hình",
    "Ung bướu",
    "Tâm thần",
    "Phục hồi chức năng",
    "Gây mê hồi sức",
    "Xét nghiệm",
    "Chẩn đoán hình ảnh",
    "Dược",
    "Khác"
  ];

  const toE164 = (raw, country = "+84") => {
    const num = String(raw || "").replace(/\D/g, "");
    if (!num) return "";
    if (country === "+84" && num.startsWith("0")) return country + num.slice(1);
    if (num.startsWith("+")) return num;
    return country + num;
  };

  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(v || "").trim());
  const isValidVNPhone = (raw) => /^\+84\d{9}$/.test(toE164(raw));
  const isValidPassword = (v) => String(v || "").length >= 8;
  const isValidName = (v) => String(v || "").trim().length >= 2;

  const validateForm = () => {
    const newErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (!isValidName(formData.fullName)) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự.";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!isValidVNPhone(formData.phone)) {
      newErrors.phone =
        "Số điện thoại không đúng định dạng (VD: 0xxxxxxxxx hoặc +84xxxxxxxxx).";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email không đúng định dạng.";
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = "Mật khẩu phải tối thiểu 8 ký tự.";
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    // Validate specialty
    if (!formData.specialty.trim()) {
      newErrors.specialty = "Vui lòng chọn chuyên khoa.";
    }

    // Validate license number
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "Vui lòng nhập số chứng chỉ hành nghề.";
    }

    // Validate license image
    if (!formData.licenseImage) {
      newErrors.licenseImage = "Vui lòng upload ảnh chứng chỉ hành nghề.";
    } else {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.licenseImage.size > maxSize) {
        newErrors.licenseImage = "Kích thước ảnh không được vượt quá 5MB.";
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(formData.licenseImage.type)) {
        newErrors.licenseImage = "Chỉ chấp nhận file ảnh (JPG, PNG, WebP).";
      }
    }

    // Validate consents
    if (!acceptedTerms) {
      newErrors.acceptedTerms = "Bạn cần đồng ý Điều khoản sử dụng.";
    }
    if (!acceptedPrivacy) {
      newErrors.acceptedPrivacy = "Bạn cần đồng ý Chính sách bảo mật.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setSuccessMessage(
        "Tài khoản của bạn đang được admin phê duyệt. Vui lòng đợi thông báo từ email bạn đã đăng ký."
      );

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
          specialty: "",
          licenseNumber: "",
          licenseImage: null,
        });
        setSuccessMessage("");
      }, 5000);

    } catch (err) {
      console.error("Registration error:", err);
      setErrors({
        general: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="doctor-register-wrap">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Đăng ký thành công!</h2>
          <p className="success-message">{successMessage}</p>
          <Link to="/dang-nhap" className="btn btn-primary">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-register-wrap">
      <div aria-hidden className="doctor-register-bg" />
      <div aria-hidden className="doctor-register-overlay" />

      <div className="doctor-register-card doctor-register-center-fixed">
        <h1 className="doctor-register-title">ĐĂNG KÝ TÀI KHOẢN BÁC SĨ</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              className="doctor-register-input"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              autoComplete="name"
            />
            {errors.fullName && (
              <div className="error-text">{errors.fullName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              className="doctor-register-input"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              className="doctor-register-input"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ email"
              autoComplete="email"
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="form-group password-field">
            <label htmlFor="password" className="form-label">
              Mật khẩu <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                className="doctor-register-input"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
              />
              <i
                className={`bi ${
                  showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"
                } password-toggle`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            {errors.password && (
              <div className="error-text">{errors.password}</div>
            )}
          </div>

          <div className="form-group password-field">
            <label htmlFor="confirmPassword" className="form-label">
              Xác nhận mật khẩu <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                className="doctor-register-input"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Xác nhận mật khẩu"
                autoComplete="new-password"
              />
              <i
                className={`bi ${
                  showConfirmPassword ? "bi-eye-fill" : "bi-eye-slash-fill"
                } password-toggle`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            {errors.confirmPassword && (
              <div className="error-text">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="specialty" className="form-label">
              Chuyên khoa <span className="required">*</span>
            </label>
            <select
              className="doctor-register-input"
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
            >
              <option value="">Chọn chuyên khoa</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            {errors.specialty && (
              <div className="error-text">{errors.specialty}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber" className="form-label">
              Số chứng chỉ hành nghề <span className="required">*</span>
            </label>
            <input
              className="doctor-register-input"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="Nhập số chứng chỉ hành nghề bác sĩ của bạn"
            />
            {errors.licenseNumber && (
              <div className="error-text">{errors.licenseNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="licenseImage" className="form-label">
              Ảnh chứng chỉ hành nghề <span className="required">*</span>
            </label>
            <div className="file-upload-group">
              <input
                type="file"
                id="licenseImage"
                name="licenseImage"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleInputChange}
                className="file-input"
              />
              <label htmlFor="licenseImage" className="file-upload-label">
                <i className="bi bi-cloud-upload"></i>
                <span>
                  {formData.licenseImage 
                    ? formData.licenseImage.name 
                    : "Chọn ảnh chứng chỉ hành nghề (JPG, PNG, WebP - Tối đa 5MB)"
                  }
                </span>
              </label>
            </div>
            {errors.licenseImage && (
              <div className="error-text">{errors.licenseImage}</div>
            )}
          </div>

          <div className="consent">
            <label className="consent-row">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                Tôi đã đọc và đồng ý với {""}
                <Link to="/dieu-khoan-su-dung" target="_blank" rel="noopener noreferrer">
                  Điều khoản sử dụng
                </Link>
              </span>
            </label>
            {errors.acceptedTerms && (
              <div className="error-text">{errors.acceptedTerms}</div>
            )}

            <label className="consent-row">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              />
              <span>
                Tôi đồng ý với {""}
                <Link to="/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer">
                  Chính sách bảo mật
                </Link>
              </span>
            </label>
            {errors.acceptedPrivacy && (
              <div className="error-text">{errors.acceptedPrivacy}</div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
          </button>
        </form>

        {errors.general && <div className="error-text">{errors.general}</div>}

        <div className="doctor-register-links">
          <Link to="/dang-nhap">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

