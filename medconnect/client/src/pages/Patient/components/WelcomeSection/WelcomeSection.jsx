import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { useUserProfile } from "../../../../hooks/useUserProfile";
import { api } from "../../../../lib/api";
import { Calendar, Video, Search } from "lucide-react";
import "./WelcomeSection.scss";

function WelcomeSection() {
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

      // Fetch appointments for today
      const response = await api.get(
        `/api/patients/me/appointments?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      );

      if (response.success) {
        const appointments = response.data.appointments || [];
        setTodayAppointments(appointments.length);
      }
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      setTodayAppointments(0);
    } finally {
      setLoading(false);
    }
  };

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Chào buổi sáng"
      : currentHour < 18
      ? "Chào buổi chiều"
      : "Chào buổi tối";

  const userName =
    userProfile?.fullName || userProfile?.displayName || "Người dùng";

  const handleBookAppointment = () => {
    navigate("/dat-lich");
  };

  const handleFindDoctor = () => {
    navigate("/benh-nhan/tim-bac-si");
  };

  return (
    <div className="welcome-section-container">
      {/* Header with Gradient Background */}
      <div className="welcome-header">
        <div className="welcome-header-content">
          <div className="welcome-header-text">
            <h1 className="welcome-page-title">
              {greeting}, {userName}
            </h1>
            <p className="welcome-page-subtitle">
              {loading
                ? "Đang tải thông tin lịch hẹn..."
                : todayAppointments > 0
                ? "Hãy chuẩn bị sẵn sàng cho buổi khám."
                : "Hôm nay bạn chưa có lịch hẹn nào. Hãy đặt lịch khám để được chăm sóc tốt nhất."}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="welcome-actions-wrapper">
          {/* Đặt lịch ngay button */}
          <button
            onClick={handleBookAppointment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 0.875rem",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#2563eb";
              e.target.style.transform = "translateY(-2px) scale(1.02)";
              e.target.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#3b82f6";
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 2px 4px rgba(59, 130, 246, 0.2)";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "translateY(0) scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "translateY(-2px) scale(1.02)";
            }}
          >
            <Calendar
              style={{
                width: "0.875rem",
                height: "0.875rem",
                transition: "transform 0.3s ease",
              }}
            />
            Đặt lịch ngay
          </button>

          {/* Tìm bác sĩ button */}
          <button
            onClick={handleFindDoctor}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 0.875rem",
              backgroundColor: "#ffffff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.transform = "translateY(-2px) scale(1.02)";
              e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
              e.target.style.borderColor = "#10b981";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              e.target.style.borderColor = "#d1d5db";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "translateY(0) scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "translateY(-2px) scale(1.02)";
            }}
          >
            <Search
              style={{
                width: "0.875rem",
                height: "0.875rem",
                transition: "transform 0.3s ease",
              }}
            />
            Tìm bác sĩ
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
export { WelcomeSection };
