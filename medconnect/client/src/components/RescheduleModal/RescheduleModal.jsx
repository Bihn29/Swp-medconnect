import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  message,
  DatePicker,
  Spin,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { api } from "../../lib/api";
import "./RescheduleModal.scss";

const { TextArea } = Input;

export function RescheduleModal({ visible, appointment, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Reset form and date when modal opens/closes
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setAvailableTimeSlots([]);
      // Set tomorrow as default date
      const tomorrow = dayjs().add(1, "day");
      setSelectedDate(tomorrow);
      form.setFieldsValue({ selectedDate: tomorrow });
    }
  }, [visible, form]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (visible && selectedDate && appointment?.doctorId?._id) {
      fetchTimeSlots();
    }
  }, [visible, selectedDate, appointment]);

  const fetchTimeSlots = async () => {
    if (!selectedDate || !appointment?.doctorId?._id) return;

    try {
      setTimeSlotsLoading(true);
      const dateStr = selectedDate.format("YYYY-MM-DD");
      const doctorId = appointment.doctorId._id || appointment.doctorId;

      console.log("🔍 Fetching time slots for reschedule:", {
        doctorId,
        date: dateStr,
      });

      const response = await api.get(
        `/api/patients/doctors/${doctorId}/time-slots?date=${dateStr}`
      );

      if (response.success && response.data?.timeSlots) {
        // Backend already filters out booked slots, so use all returned slots
        setAvailableTimeSlots(response.data.timeSlots);
        console.log(
          "✅ Available time slots loaded:",
          response.data.timeSlots.length,
          "slots available"
        );
      } else {
        setAvailableTimeSlots([]);
        console.log("⚠️ No time slots found for this date");
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      message.error("Không thể tải khung giờ khám. Vui lòng thử lại.");
      setAvailableTimeSlots([]);
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    form.setFieldsValue({ selectedTimeSlot: null });
    form.setFieldsValue({ selectedDate: date });
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    // Convert slot time to dayjs and set to form
    if (slot.startAt) {
      const slotDateTime = dayjs(slot.startAt);
      form.setFieldsValue({ newDateTime: slotDateTime });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!selectedTimeSlot) {
        message.error("Vui lòng chọn một khung giờ khám");
        return;
      }

      // Use selectedTimeSlot.startAt as newDateTime
      const newDateTime = selectedTimeSlot.startAt
        ? new Date(selectedTimeSlot.startAt).toISOString()
        : values.newDateTime?.toISOString();

      if (!newDateTime) {
        message.error("Vui lòng chọn thời gian mới");
        return;
      }

      const response = await api.post("/api/reschedule/request", {
        appointmentId: appointment._id,
        newDateTime: newDateTime,
        reason: values.reason,
      });

      if (response.success) {
        message.success("Yêu cầu dời lịch đã được gửi thành công");
        form.resetFields();
        setSelectedDate(null);
        setSelectedTimeSlot(null);
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

  const formatTimeSlot = (slot) => {
    if (!slot.startTime && slot.startAt) {
      const start = new Date(slot.startAt);
      const end = slot.endAt
        ? new Date(slot.endAt)
        : new Date(start.getTime() + 30 * 60 * 1000);
      return `${start.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return slot.timeRange || slot.startTime || "N/A";
  };

  const disabledDate = (current) => {
    // Disable dates before tomorrow
    const tomorrow = dayjs().add(1, "day").startOf("day");
    return current && current < tomorrow;
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
          {/* Date Selection */}
          <Form.Item
            name="selectedDate"
            label="Chọn ngày"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày mới"
              disabledDate={disabledDate}
              style={{ width: "100%" }}
              value={selectedDate}
              onChange={handleDateChange}
            />
          </Form.Item>

          {/* Hidden field for newDateTime - will be set when slot is selected */}
          <Form.Item
            name="newDateTime"
            hidden
            rules={[
              { required: true, message: "Vui lòng chọn khung giờ khám" },
            ]}
          >
            <Input type="hidden" />
          </Form.Item>

          {/* Time Slots Selection */}
          {selectedDate && (
            <Form.Item
              label="Chọn khung giờ khám"
              required
              help={
                !selectedTimeSlot
                  ? "Vui lòng chọn một khung giờ từ danh sách bên dưới"
                  : `Đã chọn: ${formatTimeSlot(selectedTimeSlot)}`
              }
            >
              {timeSlotsLoading ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Spin />
                  <div style={{ marginTop: 8 }}>Đang tải khung giờ...</div>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#999",
                    border: "1px dashed #d9d9d9",
                    borderRadius: "8px",
                  }}
                >
                  <CalendarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <div>Không có khung giờ khám vào ngày này</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    Vui lòng chọn ngày khác
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot._id || slot.startTime}
                      type={
                        selectedTimeSlot?._id === slot._id ||
                        selectedTimeSlot?.startTime === slot.startTime
                          ? "primary"
                          : "default"
                      }
                      onClick={() => handleTimeSlotSelect(slot)}
                      style={{
                        height: "auto",
                        padding: "8px 12px",
                      }}
                    >
                      {formatTimeSlot(slot)}
                    </Button>
                  ))}
                </div>
              )}
            </Form.Item>
          )}

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
