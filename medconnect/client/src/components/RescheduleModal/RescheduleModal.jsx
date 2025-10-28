import React, { useState } from "react";
import { Modal, Form, Input, Button, Space, message, DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { api } from "../../lib/api";
import "./RescheduleModal.scss";

const { TextArea } = Input;

export function RescheduleModal({ visible, appointment, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await api.post("/api/reschedule/request", {
        appointmentId: appointment._id,
        newDateTime: values.newDateTime.toISOString(),
        reason: values.reason,
      });

      if (response.success) {
        message.success("Yêu cầu dời lịch đã được gửi thành công");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.message || "Có lỗi xảy ra khi gửi yêu cầu");
      }
    } catch (error) {
      console.error("Error requesting reschedule:", error);
      message.error("Có lỗi xảy ra khi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const disabledDate = (current) => {
    // Disable dates before tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return current && current < tomorrow;
  };

  const disabledTime = (current) => {
    if (!current) return {};

    const hour = current.hour();

    return {
      disabledHours: () => {
        // Disable hours outside 8 AM - 5 PM
        const disabledHours = [];
        for (let i = 0; i < 24; i++) {
          if (i < 8 || i > 17) {
            disabledHours.push(i);
          }
        }
        return disabledHours;
      },
      disabledMinutes: (selectedHour) => {
        // Disable minutes before 8:30 AM and after 5:00 PM
        if (selectedHour === 8) {
          return Array.from({ length: 60 }, (_, i) => i).filter((m) => m < 30);
        }
        if (selectedHour === 17) {
          return Array.from({ length: 60 }, (_, i) => i).filter((m) => m > 0);
        }
        return [];
      },
    };
  };

  return (
    <Modal
      title={
        <div className="reschedule-modal-title">
          <CalendarOutlined className="title-icon" />
          <span>Dời lịch hẹn</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="reschedule-modal"
    >
      <div className="reschedule-modal-content">
        <div className="current-appointment-info">
          <h4>Thông tin lịch hẹn hiện tại</h4>
          <div className="appointment-details">
            <div className="detail-item">
              <span className="label">Bác sĩ:</span>
              <span className="value">
                {appointment?.doctorId?.fullName || "BS. Chưa xác định"}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Thời gian:</span>
              <span className="value">
                {appointment?.scheduledStart
                  ? formatDateTime(appointment.scheduledStart)
                  : "Chưa xác định"}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Trạng thái:</span>
              <span className={`status status-${appointment?.status}`}>
                {appointment?.status === "accepted"
                  ? "Đã xác nhận"
                  : appointment?.status === "pending_doctor"
                  ? "Chờ xác nhận"
                  : appointment?.status}
              </span>
            </div>
          </div>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="reschedule-form"
        >
          <Form.Item
            name="newDateTime"
            label="Thời gian mới"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian mới" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  const selectedTime = value.toDate();
                  const now = new Date();

                  if (selectedTime <= now) {
                    return Promise.reject(
                      new Error("Thời gian mới phải trong tương lai")
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn ngày và giờ mới"
              disabledDate={disabledDate}
              disabledTime={disabledTime}
              style={{ width: "100%" }}
              minuteStep={30}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do dời lịch"
            rules={[
              { required: true, message: "Vui lòng nhập lý do dời lịch" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự" },
              { max: 500, message: "Lý do không được quá 500 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ví dụ: Có việc đột xuất, thay đổi lịch trình công việc, sức khỏe không cho phép..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <div className="form-actions">
            <Space>
              <Button onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi yêu cầu
              </Button>
            </Space>
          </div>
        </Form>

        <div className="reschedule-notice">
          <div className="notice-icon">ℹ️</div>
          <div className="notice-content">
            <p>
              <strong>Lưu ý:</strong>
            </p>
            <ul>
              <li>Yêu cầu dời lịch sẽ được gửi đến bác sĩ để xem xét</li>
              <li>Bác sĩ có thể chấp nhận hoặc từ chối yêu cầu</li>
              <li>Bạn sẽ nhận được thông báo về kết quả</li>
              <li>Chỉ có thể dời lịch trước 24 giờ so với thời gian hẹn</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}
