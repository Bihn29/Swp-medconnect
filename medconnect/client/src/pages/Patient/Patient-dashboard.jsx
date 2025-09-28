import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import "./PatientDashboard.css";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>MedConnect</h1>
            <span className="patient-badge">Bệnh nhân</span>
          </div>
          <div className="user-section">
            <div className="user-info">
              <i className="bi bi-person-circle"></i>
              <span>{user?.displayName || user?.email || "Bệnh nhân"}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <i className="bi bi-box-arrow-right"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <div className="welcome-card">
            <h2>Chào mừng trở lại, {user?.displayName || "Bệnh nhân"}!</h2>
            <p>Chúc bạn một ngày khỏe mạnh. Đây là trang chủ của bạn.</p>
          </div>

          <div className="quick-actions">
            <h3>Thao tác nhanh</h3>
            <div className="actions-grid">
              <div className="action-card">
                <i className="bi bi-calendar-check"></i>
                <h4>Đặt lịch hẹn</h4>
                <p>Đặt lịch khám với bác sĩ</p>
              </div>
              <div className="action-card">
                <i className="bi bi-file-medical"></i>
                <h4>Hồ sơ bệnh án</h4>
                <p>Xem lịch sử khám bệnh</p>
              </div>
              <div className="action-card">
                <i className="bi bi-capsule"></i>
                <h4>Đơn thuốc</h4>
                <p>Xem đơn thuốc điện tử</p>
              </div>
              <div className="action-card">
                <i className="bi bi-credit-card"></i>
                <h4>Thanh toán</h4>
                <p>Xem lịch sử thanh toán</p>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h3>Hoạt động gần đây</h3>
            <div className="activity-list">
              <div className="activity-item">
                <i className="bi bi-calendar-check"></i>
                <div className="activity-content">
                  <h4>Lịch hẹn với BS. Nguyễn Văn A</h4>
                  <p>15/01/2024 - 09:00</p>
                </div>
                <span className="status-badge confirmed">Đã xác nhận</span>
              </div>
              <div className="activity-item">
                <i className="bi bi-file-medical"></i>
                <div className="activity-content">
                  <h4>Hồ sơ bệnh án mới</h4>
                  <p>10/01/2024</p>
                </div>
                <span className="status-badge completed">Hoàn thành</span>
              </div>
              <div className="activity-item">
                <i className="bi bi-capsule"></i>
                <div className="activity-content">
                  <h4>Đơn thuốc mới</h4>
                  <p>10/01/2024</p>
                </div>
                <span className="status-badge active">Đang sử dụng</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
