import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Divider,
  Spin,
  message,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { api } from "../../../../lib/api";

const { Title, Text, Paragraph } = Typography;

const AppointmentDetailModal = ({ visible, onClose, appointmentId }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [visible, appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching appointment details for ID:", appointmentId);
      const response = await api.get(
        `/api/patients/me/appointments/${appointmentId}`
      );
      console.log("API Response:", response);

      if (response.success) {
        setAppointment(response.data);
        console.log("Appointment data set:", response.data);
      } else {
        console.error("API returned success: false", response);
        message.error("Không thể tải thông tin lịch hẹn");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      message.error("Có lỗi xảy ra khi tải thông tin");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending_doctor: { color: "orange", text: "Chờ xác nhận" },
      accepted: { color: "green", text: "Đã chấp nhận" },
      rejected: { color: "red", text: "Bị từ chối" },
      in_progress: { color: "blue", text: "Đang khám" },
      done: { color: "gray", text: "Hoàn thành" },
      cancelled: { color: "red", text: "Đã hủy" },
      no_show: { color: "red", text: "Không đến" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (loading) {
    return (
      <Modal
        title="Chi tiết lịch hẹn"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
        </div>
      </Modal>
    );
  }

  if (!appointment) {
    return (
      <Modal
        title="Chi tiết lịch hẹn"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Không tìm thấy thông tin lịch hẹn</Text>
        </div>
      </Modal>
    );
  }

  const { date, time } = formatDateTime(appointment.scheduledStart);

  return (
    <Modal
      title="Chi tiết lịch hẹn"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Status */}
        <div>
          <Text strong>Trạng thái: </Text>
          {getStatusTag(appointment.status)}
        </div>

        {/* Date & Time */}
        <Card size="small">
          <Space direction="vertical" size="small">
            <div>
              <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              <Text strong>{date}</Text>
            </div>
            <div>
              <ClockCircleOutlined
                style={{ marginRight: 8, color: "#1890ff" }}
              />
              <Text>{time}</Text>
            </div>
          </Space>
        </Card>

        {/* Doctor Info */}
        <Card size="small" title="Thông tin bác sĩ">
          <Space direction="vertical" size="small">
            <div>
              <UserOutlined style={{ marginRight: 8, color: "#52c41a" }} />
              <Text strong>
                {appointment.doctorId?.fullName || "Chưa xác định"}
              </Text>
            </div>
            <div>
              <Text type="secondary">
                Chuyên khoa:{" "}
                {appointment.doctorId?.specializationIds?.[0]?.name ||
                  "Chưa xác định"}
              </Text>
            </div>
            <div>
              <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
              <Text>
                {appointment.doctorId?.phone ||
                  appointment.doctorId?.userId?.phone ||
                  "Chưa cập nhật"}
              </Text>
            </div>
          </Space>
        </Card>

        {/* Location */}
        <Card size="small" title="Thông tin khám">
          <Space direction="vertical" size="small">
            <div>
              <EnvironmentOutlined
                style={{ marginRight: 8, color: "#fa8c16" }}
              />
              <Text strong>
                {appointment.mode === "online"
                  ? "Khám online"
                  : "Khám tại phòng khám"}
              </Text>
            </div>
            {appointment.mode === "offline" && appointment.clinicId && (
              <div>
                <Text type="secondary">
                  Phòng khám: {appointment.clinicId.name}
                </Text>
              </div>
            )}
            {appointment.reason && (
              <div>
                <Text type="secondary">
                  <Text strong>Lý do khám: </Text>
                  {appointment.reason}
                </Text>
              </div>
            )}
          </Space>
        </Card>

        {/* Additional Info */}
        {(appointment.consultationSummary || appointment.prescription) && (
          <Card size="small" title="Tài liệu">
            <Space direction="vertical" size="small">
              {appointment.consultationSummary && (
                <Button type="link" icon={<FileTextOutlined />}>
                  Xem tóm tắt khám
                </Button>
              )}
              {appointment.prescription && (
                <Button type="link" icon={<MedicineBoxOutlined />}>
                  Xem đơn thuốc
                </Button>
              )}
            </Space>
          </Card>
        )}

        {/* Notes */}
        {appointment.notes && (
          <Card size="small" title="Ghi chú">
            <Paragraph>{appointment.notes}</Paragraph>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default AppointmentDetailModal;
