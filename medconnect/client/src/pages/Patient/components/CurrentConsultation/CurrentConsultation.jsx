import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, User, Phone, Video } from "lucide-react";
import { message, Spin } from "antd";
import { api } from "../../../../lib/api";
import "./CurrentConsultation.scss";

export function CurrentConsultation() {
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentAppointment();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchCurrentAppointment, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/patients/me/appointments?limit=50");

      if (response.success) {
        // Filter for in_progress ONLINE appointments only
        const inProgressOnlineAppointments = response.data.appointments.filter(
          (appointment) =>
            appointment.status === "in_progress" &&
            appointment.mode === "online"
        );

        if (inProgressOnlineAppointments.length > 0) {
          const appointment = inProgressOnlineAppointments[0];
          console.log(
            "🔍 Current Consultation - Appointment data:",
            appointment
          );
          console.log(
            "🔍 Current Consultation - Doctor data:",
            appointment.doctorId
          );
          console.log(
            "🔍 Current Consultation - Specialization:",
            appointment.doctorId?.specializationIds
          );

          setCurrentAppointment({
            id: appointment._id,
            doctor: `BS. ${
              appointment.doctorId?.fullName ||
              appointment.doctorId?.name ||
              "Chưa xác định"
            }`,
            specialty:
              appointment.doctorId?.specializationIds?.[0]?.name ||
              appointment.specialty ||
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
            location: "Khám online",
            mode: appointment.mode,
          });
        } else {
          setCurrentAppointment(null);
        }
      }
    } catch (error) {
      console.error("Error fetching current appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = () => {
    if (currentAppointment?.id) {
      console.log(
        "🎥 Patient joining video call for appointment:",
        currentAppointment.id
      );
      // Open in same window, not new tab
      window.location.href = `/benh-nhan/video-call/${currentAppointment.id}`;
    }
  };

  if (loading) {
    return null;
  }

  if (!currentAppointment) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "2px solid #3b82f6",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "0 4px 12px 0 rgba(59, 130, 246, 0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#3b82f6",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Video size={20} style={{ color: "#3b82f6" }} />
          Đang khám online
        </h3>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              animation: "pulse 2s infinite",
            }}
          ></div>
          <span
            style={{
              fontSize: "0.875rem",
              color: "#10b981",
              fontWeight: "600",
            }}
          >
            Đang diễn ra
          </span>
        </div>
      </div>

      {/* Appointment Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          border: "2px solid #cbd5e1",
          borderRadius: "0.75rem",
          backgroundColor: "#f9fafb",
        }}
      >
        {/* Left side - Appointment info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flex: 1,
          }}
        >
          {/* Doctor avatar */}
          <div
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "1.25rem",
              fontWeight: "600",
            }}
          >
            BS
          </div>

          {/* Doctor details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              flex: 1,
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
                {currentAppointment.doctor}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                color: "#1e293b",
              }}
            >
              {currentAppointment.specialty}
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
                  {currentAppointment.date} - {currentAppointment.time}
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
                  {currentAppointment.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Call button */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {currentAppointment.mode === "online" && (
            <button
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#10b981",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#059669";
                e.target.style.transform = "translateY(-2px) scale(1.02)";
                e.target.style.boxShadow = "0 4px 16px rgba(16, 185, 129, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#10b981";
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
              }}
              onClick={handleJoinCall}
            >
              <Video size={16} />
              Tham gia Video Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
