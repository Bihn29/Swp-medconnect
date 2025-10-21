import React, { useEffect, useState } from "react";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { api } from "../../../../lib/api";
import { Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Video,
  X,
  VideoCall,
} from "lucide-react";
import AppointmentDetailModal from "../AppointmentDetailModal/AppointmentDetailModal";

const STATUS = {
  confirmed: { label: "Đã xác nhận", tone: "#1d4ed8", text: "#ffffff" },
  accepted: { label: "Đã xác nhận", tone: "#1d4ed8", text: "#ffffff" },
  pending_doctor: { label: "Chờ xác nhận", tone: "#e5e7eb", text: "#111827" },
  cancelled: { label: "Hủy", tone: "#fee2e2", text: "#dc2626" },
  done: { label: "Hoàn thành", tone: "#e5e7eb", text: "#111827" },
};

export function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/patients/me/appointments?limit=20");
        if (res.success) {
          setAppointments(res.data.appointments || []);
        } else {
          message.error("Không thể tải lịch hẹn");
        }
      } catch (e) {
        message.error("Có lỗi khi tải lịch hẹn");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      <div style={{ padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
        Lịch hẹn của tôi
      </h1>
      <p style={{ color: "#475569", marginTop: 8 }}>
        Quản lý và theo dõi các lịch hẹn khám bệnh
      </p>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <Button variant="secondary">Sắp tới ({appointments.length})</Button>
        <Button variant="ghost">Đã khám (0)</Button>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {appointments.map((a) => {
          const status = STATUS[a.status] || STATUS.confirmed;
          const doctorName = `BS. ${a.doctorId?.fullName || ""}`;
          const specialty = a.doctorId?.specializationIds?.[0]?.name || "";
          const date = new Date(a.scheduledStart);
          const dateText = date.toLocaleDateString("vi-VN");
          const timeText = date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const fee = a.feeAmount || a.consultationFee || 0;
          const feeText = new Intl.NumberFormat("vi-VN").format(fee) + "đ";

          return (
            <div
              key={a._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                  }}
                >
                  BS
                </div>
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontWeight: 700 }}>{doctorName}</span>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: status.tone,
                        color: status.text,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div style={{ color: "#334155", marginTop: 2 }}>
                    {specialty}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 6,
                      color: "#0f172a",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Calendar size={14} /> {dateText}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Clock size={14} /> {timeText}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <MapPin size={14} />{" "}
                      {a.mode === "online"
                        ? "Khám online"
                        : a.clinicId?.name || "Phòng khám"}
                    </span>
                    <span style={{ marginLeft: 8, fontWeight: 600 }}>
                      {feeText}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Video Call Button - Only show for accepted appointments */}
                {a.status === "accepted" && a.mode === "online" ? (
                  <Button
                    type="primary"
                    onClick={() => navigate(`/benh-nhan/video-call/${a._id}`)}
                    style={{ 
                      background: "#1890ff",
                      borderColor: "#1890ff",
                      color: "#fff"
                    }}
                  >
                    <VideoCall size={16} style={{ marginRight: 6 }} /> 
                    Video Call
                  </Button>
                ) : null}
                
                {/* Regular Video Button for other online appointments */}
                {a.mode === "online" && a.status !== "accepted" ? (
                  <Button variant="secondary">
                    <Video size={16} style={{ marginRight: 6 }} /> 
                    Chờ duyệt
                  </Button>
                ) : null}
                
                <Button variant="secondary">
                  <Phone size={16} style={{ marginRight: 6 }} /> Gọi
                </Button>
                <Button variant="secondary">
                  <MessageCircle size={16} style={{ marginRight: 6 }} /> Nhắn tin
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleShowDetail(a._id)}
                >
                  Chi tiết
                </Button>
                
                {/* Cancel button - only show for pending appointments */}
                {a.status === "pending_doctor" && (
                  <Button
                    variant="ghost"
                    style={{ color: "#dc2626", borderColor: "#fecaca" }}
                  >
                    <X size={16} style={{ marginRight: 6 }} /> Hủy
                  </Button>
                )}
              </div>
            </div>
          );
        })}
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
