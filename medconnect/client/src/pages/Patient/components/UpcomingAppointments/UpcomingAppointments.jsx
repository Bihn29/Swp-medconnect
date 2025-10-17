import React from "react";
import { Clock, MapPin, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import "./UpcomingAppointments.scss";

const appointments = [
  {
    id: 1,
    doctor: "BS. Trần Thị B",
    specialty: "Tim mạch",
    date: "16/10/2025",
    time: "09:00",
    location: "Phòng khám 201",
    status: "confirmed",
  },
  {
    id: 2,
    doctor: "BS. Lê Văn C",
    specialty: "Nội khoa",
    date: "20/10/2025",
    time: "14:30",
    location: "Phòng khám 105",
    status: "pending",
  },
  {
    id: 3,
    doctor: "BS. Phạm Thị D",
    specialty: "Da liễu",
    date: "25/10/2025",
    time: "10:15",
    location: "Phòng khám 308",
    status: "confirmed",
  },
];

const statusConfig = {
  confirmed: { label: "Đã xác nhận", variant: "default" },
  pending: { label: "Chờ xác nhận", variant: "secondary" },
};

export function UpcomingAppointments() {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#1e293b",
            margin: 0,
          }}
        >
          Lịch hẹn sắp tới
        </h3>
        <button
          style={{
            color: "#1e293b",
            fontSize: "0.875rem",
            fontWeight: "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#f1f5f9";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.color = "#3b82f6";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.transform = "translateY(0)";
            e.target.style.color = "#1e293b";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "translateY(0) scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.target.style.transform = "translateY(-1px) scale(1)";
          }}
        >
          Xem tất cả
        </button>
      </div>

      {/* Appointments List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Left side - Appointment info */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              {/* Doctor avatar */}
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#6b7280",
                  }}
                />
              </div>

              {/* Doctor details */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    {appointment.doctor}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color:
                        appointment.status === "confirmed"
                          ? "#ffffff"
                          : "#1e293b",
                      backgroundColor:
                        appointment.status === "confirmed"
                          ? "#3b82f6"
                          : "#f3f4f6",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                    }}
                  >
                    {statusConfig[appointment.status].label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#1e293b",
                  }}
                >
                  {appointment.specialty}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Clock
                      style={{
                        width: "0.875rem",
                        height: "0.875rem",
                        color: "#6b7280",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#1e293b",
                      }}
                    >
                      {appointment.date} - {appointment.time}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <MapPin
                      style={{
                        width: "0.875rem",
                        height: "0.875rem",
                        color: "#6b7280",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#1e293b",
                      }}
                    >
                      {appointment.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <button
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#2563eb";
                  e.target.style.transform = "translateY(-1px) scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(59, 130, 246, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#3b82f6";
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow =
                    "0 2px 4px rgba(59, 130, 246, 0.2)";
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = "translateY(0) scale(0.98)";
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = "translateY(-1px) scale(1.02)";
                }}
              >
                Chi tiết
              </button>
              <button
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#fef2f2";
                  e.target.style.transform = "translateY(-1px) scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(239, 68, 68, 0.2)";
                  e.target.style.borderColor = "#ef4444";
                  e.target.style.color = "#ef4444";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.color = "#374151";
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = "translateY(0) scale(0.98)";
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = "translateY(-1px) scale(1.02)";
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
