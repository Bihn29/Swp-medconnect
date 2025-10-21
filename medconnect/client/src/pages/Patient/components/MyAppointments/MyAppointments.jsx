import React, { useEffect, useState } from "react";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { api, cancelAppointment } from "../../../../lib/api";
import { Spin, message, Modal } from "antd";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Video,
  X,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("upcoming");

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

  const handleCancelAppointment = async (appointmentId) => {
    Modal.confirm({
      title: "Xác nhận hủy lịch hẹn",
      content: "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      okText: "Hủy lịch hẹn",
      cancelText: "Không",
      okType: "danger",
      onOk: async () => {
        try {
          console.log("Attempting to cancel appointment:", appointmentId);

          // Gọi API endpoint mới
          const response = await api.put(
            `/api/patients/me/appointments/${appointmentId}/cancel`,
            { cancelReason: "Patient cancelled" }
          );

          console.log("Cancel response:", response);

          if (response && response.success) {
            message.success("Đã hủy lịch hẹn thành công");

            // Cập nhật lại danh sách appointments
            const updatedAppointments = appointments.map((appointment) =>
              appointment._id === appointmentId
                ? { ...appointment, status: "cancelled" }
                : appointment
            );
            setAppointments(updatedAppointments);

            console.log("Appointment cancelled successfully:", appointmentId);
          } else {
            console.error("Cancel failed:", response);
            message.error(response?.message || "Không thể hủy lịch hẹn");
          }
        } catch (error) {
          console.error("Error cancelling appointment:", error);
          console.error("Error details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          message.error(`Có lỗi xảy ra khi hủy lịch hẹn: ${error.message}`);
        }
      },
    });
  };

  // Phân chia appointments
  const upcomingAppointments = appointments.filter((appointment) =>
    ["pending_doctor", "accepted"].includes(appointment.status)
  );

  // Debug: Log appointments to see what statuses we have
  console.log(
    "All appointments:",
    appointments.map((a) => ({
      id: a._id,
      status: a.status,
      doctor: a.doctorId?.fullName,
    }))
  );
  console.log(
    "Upcoming appointments:",
    upcomingAppointments.map((a) => ({
      id: a._id,
      status: a.status,
      doctor: a.doctorId?.fullName,
    }))
  );
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "done"
  );
  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled"
  );

  const currentAppointments =
    activeTab === "upcoming"
      ? upcomingAppointments
      : activeTab === "completed"
      ? completedAppointments
      : cancelledAppointments;

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        minHeight: "100vh",
        overflow: "hidden", // Ngăn scrollbar xuất hiện/biến mất
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#ffffff",
          zIndex: 10,
          paddingBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          Lịch hẹn của tôi
        </h1>
        <p style={{ color: "#475569", marginTop: 8 }}>
          Quản lý và theo dõi các lịch hẹn khám bệnh
        </p>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            backgroundColor: "#f1f5f9",
            borderRadius: "12px",
            padding: "4px",
            width: "fit-content",
          }}
        >
          <button
            onClick={() => setActiveTab("upcoming")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border:
                activeTab === "upcoming"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              backgroundColor:
                activeTab === "upcoming" ? "#ffffff" : "transparent",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
            }}
          >
            Sắp tới ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border:
                activeTab === "completed"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              backgroundColor:
                activeTab === "completed" ? "#ffffff" : "transparent",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
            }}
          >
            Đã khám ({completedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border:
                activeTab === "cancelled"
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              backgroundColor:
                activeTab === "cancelled" ? "#ffffff" : "transparent",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
            }}
          >
            Đã hủy ({cancelledAppointments.length})
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflow: "auto", // Cho phép scroll content
          maxHeight: "calc(100vh - 200px)", // Giới hạn chiều cao
        }}
      >
        {currentAppointments.map((a) => {
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
          const feeText =
            fee > 0 ? new Intl.NumberFormat("vi-VN").format(fee) + "đ" : "";

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
                    {feeText && (
                      <span style={{ marginLeft: 8, fontWeight: 600 }}>
                        {feeText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {a.status === "done" ? (
                  // Appointments đã hoàn thành chỉ có nút nhắn tin
                  <Button variant="secondary">
                    <MessageCircle size={16} style={{ marginRight: 6 }} /> Nhắn
                    tin
                  </Button>
                ) : a.status === "cancelled" ? (
                  // Appointments đã hủy không có nút action
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>
                    Lịch hẹn đã được hủy
                  </span>
                ) : (
                  // Appointments chưa hoàn thành có đầy đủ nút
                  <>
                    {a.mode === "online" ? (
                      <Button>
                        <Video size={16} style={{ marginRight: 6 }} /> Tham gia
                      </Button>
                    ) : null}
                    <Button variant="secondary">
                      <Phone size={16} style={{ marginRight: 6 }} /> Gọi
                    </Button>
                    <Button variant="secondary">
                      <MessageCircle size={16} style={{ marginRight: 6 }} />{" "}
                      Nhắn tin
                    </Button>
                    <Button
                      variant="ghost"
                      style={{ color: "#dc2626", borderColor: "#fecaca" }}
                      onClick={() => handleCancelAppointment(a._id)}
                    >
                      <X size={16} style={{ marginRight: 6 }} /> Hủy
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
