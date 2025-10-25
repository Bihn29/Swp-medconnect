import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { api } from "../../../../lib/api";
import { message, Spin } from "antd";
import AppointmentDetailModal from "../AppointmentDetailModal/AppointmentDetailModal";
import "./UpcomingAppointments.scss";

const statusConfig = {
  confirmed: { label: "Đã xác nhận", variant: "default" },
  accepted: { label: "Đã chấp nhận", variant: "default" },
  accept: { label: "Đã xác nhận", variant: "default" }, // Thêm mapping cho status "accept"
  accecpt: { label: "Đã xác nhận", variant: "default" }, // Thêm mapping cho status "accecpt" (lỗi chính tả)
  pending_doctor: { label: "Chờ xác nhận", variant: "secondary" },
  in_progress: { label: "Đang khám", variant: "default" },
  done: { label: "Hoàn thành", variant: "default" },
  cancelled: { label: "Đã hủy", variant: "secondary" },
  rejected: { label: "Bị từ chối", variant: "secondary" },
};

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/patients/me/appointments?limit=50");

      if (response.success) {
        // Filter only upcoming appointments with accepted and pending status
        const upcomingAppointments = response.data.appointments.filter(
          (appointment) =>
            ["pending_doctor", "accepted"].includes(appointment.status)
        );

        // Transform API data to match component format
        const transformedAppointments = upcomingAppointments.map(
          (appointment) => ({
            id: appointment._id,
            doctor: `BS. ${appointment.doctorId.fullName}`,
            specialty:
              appointment.doctorId.specializationIds?.[0]?.name ||
              "Chưa xác định",
            date: new Date(appointment.scheduledStart).toLocaleDateString(
              "vi-VN"
            ),
            time: new Date(appointment.scheduledStart).toLocaleTimeString(
              "vi-VN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            location:
              appointment.mode === "online"
                ? "Khám online"
                : appointment.clinicId?.name || "Phòng khám",
            status: appointment.status,
            mode: appointment.mode,
            reason: appointment.reason,
            scheduledStart: appointment.scheduledStart,
            scheduledEnd: appointment.scheduledEnd,
          })
        );

        setAppointments(transformedAppointments);
      } else {
        message.error("Không thể tải danh sách lịch hẹn");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Có lỗi xảy ra khi tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedAppointmentId(null);
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <div className="flex items-center justify-center">
          <Spin size="large" />
          <span className="ml-2">Đang tải lịch hẹn...</span>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate("/my-appointments")}
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
        {appointments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#6b7280",
            }}
          >
            <p style={{ margin: 0, fontSize: "1rem" }}>
              Bạn chưa có lịch hẹn nào. Hãy đặt lịch khám để bắt đầu!
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
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
                          appointment.status === "confirmed" ||
                          appointment.status === "accepted" ||
                          appointment.status === "accept" ||
                          appointment.status === "accecpt"
                            ? "#ffffff"
                            : "#1e293b",
                        backgroundColor:
                          appointment.status === "confirmed" ||
                          appointment.status === "accepted" ||
                          appointment.status === "accept" ||
                          appointment.status === "accecpt"
                            ? "#3b82f6"
                            : "#f3f4f6",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                      }}
                    >
                      {statusConfig[appointment.status]?.label ||
                        appointment.status}
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
                {/* Video Call Button - Only show for accepted online appointments */}
                {appointment.status === "accepted" && appointment.mode === "online" ? (
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#059669";
                      e.target.style.transform = "translateY(-1px) scale(1.02)";
                      e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#10b981";
                      e.target.style.transform = "translateY(0) scale(1)";
                      e.target.style.boxShadow = "0 2px 4px rgba(16, 185, 129, 0.2)";
                    }}
                    onClick={() => window.open(`/benh-nhan/video-call/${appointment.id}`, '_blank')}
                  >
                    📹 Video Call
                  </button>
                ) : null}
                
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
                  onClick={() => handleShowDetail(appointment.id)}
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
          ))
        )}
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        visible={showDetailModal}
        onClose={handleCloseDetail}
        appointmentId={selectedAppointmentId}
      />
    </div>
  );
}
