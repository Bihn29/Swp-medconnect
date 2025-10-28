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

  const handleOnlineConsultation = () => {
    navigate("/tu-van-truc-tuyen");
  };

  const handleFindDoctor = () => {
    navigate("/search-doctors");
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "1rem",
        padding: "2.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        background:
          "linear-gradient(to bottom right, #f8fafc 0%, #ffffff 100%)",
        marginTop: "1rem",
        width: "100%",
        minHeight: "200px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          textAlign: "center",
        }}
      >
        {/* Left side - Text content */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {greeting}, {userName}
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {loading
              ? "Đang tải thông tin lịch hẹn..."
              : todayAppointments > 0
              ? `Hôm nay bạn có ${todayAppointments} lịch hẹn. Hãy chuẩn bị sẵn sàng cho buổi khám.`
              : "Hôm nay bạn chưa có lịch hẹn nào. Hãy đặt lịch khám để được chăm sóc tốt nhất."}
          </p>
        </div>

        {/* Right side - Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
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

          {/* Tư vấn online button */}
          <button
            onClick={handleOnlineConsultation}
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
              e.target.style.borderColor = "#3b82f6";
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
            <Video
              style={{
                width: "0.875rem",
                height: "0.875rem",
                transition: "transform 0.3s ease",
              }}
            />
            Tư vấn online
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
