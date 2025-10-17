import React from "react";
import { Card, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Calendar, Video, Search } from "lucide-react";
import "./WelcomeSection.scss";

export function WelcomeSection() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Chào buổi sáng"
      : currentHour < 18
      ? "Chào buổi chiều"
      : "Chào buổi tối";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "2.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        background:
          "linear-gradient(to bottom right, #f8fafc 0%, #ffffff 100%)",
        marginTop: "-2rem",
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
            {greeting}, Nguyễn Văn A
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Hôm nay bạn có 2 lịch hẹn. Hãy chuẩn bị sẵn sàng cho buổi khám.
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 0.875rem",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
          >
            <Calendar style={{ width: "0.875rem", height: "0.875rem" }} />
            Đặt lịch ngay
          </button>

          {/* Tư vấn online button */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 0.875rem",
              backgroundColor: "#ffffff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
          >
            <Video style={{ width: "0.875rem", height: "0.875rem" }} />
            Tư vấn online
          </button>

          {/* Tìm bác sĩ button */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 0.875rem",
              backgroundColor: "#ffffff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
          >
            <Search style={{ width: "0.875rem", height: "0.875rem" }} />
            Tìm bác sĩ
          </button>
        </div>
      </div>
    </div>
  );
}
