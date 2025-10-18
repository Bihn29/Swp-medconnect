import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Avatar,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Radio,
  Divider,
  Steps,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  ShareAltOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../components/Breadcrumb/NavigationBreadcrumb";
import "./AppointmentBooking.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [showPatientForm, setShowPatientForm] = useState(false);

  // Mock doctor data - in real app, this would come from props or API
  const doctorData = {
    id: 1,
    name: "Thạc sĩ, Bác sĩ Nội trú Nguyễn Hữu Thảo",
    specialty: "Nam học",
    subSpecialty: "Tiết niệu",
    hospital: "Trung tâm Nam học, Bệnh viện Hữu nghị Việt Đức",
    location: "Hà Nội",
    experience: "10 năm",
    rating: 4.8,
    reviewCount: 125,
    price: "350.000đ",
    image: "https://via.placeholder.com/120x120",
    description:
      "Bác sĩ có gần 10 năm kinh nghiệm trong lĩnh vực Nam học, Tiết niệu. Bác sĩ có thế mạnh điều trị các bệnh như hẹp bao quy đầu, rối loạn xuất tinh, dị tật cơ quan sinh dục nam,...",
    address:
      "Tầng 2 trung tâm thương mại Mandarin Garden 2, 99 Tân Mai, phường Hoàng Mai, TP Hà Nội",
    // Time slots for different days
    timeSlots: {
      // Monday (Thứ 2)
      1: [
        { time: "08:00 - 08:30", available: true },
        { time: "08:30 - 09:00", available: true },
        { time: "09:00 - 09:30", available: false },
        { time: "09:30 - 10:00", available: true },
        { time: "14:00 - 14:30", available: true },
        { time: "14:30 - 15:00", available: true },
        { time: "15:00 - 15:30", available: false },
        { time: "15:30 - 16:00", available: true },
      ],
      // Tuesday (Thứ 3)
      2: [
        { time: "08:00 - 08:30", available: true },
        { time: "08:30 - 09:00", available: false },
        { time: "09:00 - 09:30", available: true },
        { time: "09:30 - 10:00", available: true },
        { time: "14:00 - 14:30", available: true },
        { time: "14:30 - 15:00", available: true },
        { time: "15:00 - 15:30", available: true },
        { time: "15:30 - 16:00", available: false },
      ],
      // Wednesday (Thứ 4)
      3: [
        { time: "08:00 - 08:30", available: true },
        { time: "08:30 - 09:00", available: true },
        { time: "09:00 - 09:30", available: true },
        { time: "09:30 - 10:00", available: false },
        { time: "14:00 - 14:30", available: false },
        { time: "14:30 - 15:00", available: true },
        { time: "15:00 - 15:30", available: true },
        { time: "15:30 - 16:00", available: true },
      ],
      // Thursday (Thứ 5)
      4: [
        { time: "08:00 - 08:30", available: false },
        { time: "08:30 - 09:00", available: true },
        { time: "09:00 - 09:30", available: true },
        { time: "09:30 - 10:00", available: true },
        { time: "14:00 - 14:30", available: true },
        { time: "14:30 - 15:00", available: false },
        { time: "15:00 - 15:30", available: true },
        { time: "15:30 - 16:00", available: true },
      ],
      // Friday (Thứ 6)
      5: [
        { time: "17:30 - 18:00", available: true },
        { time: "18:00 - 18:30", available: true },
        { time: "18:30 - 19:00", available: true },
        { time: "19:00 - 19:30", available: true },
        { time: "19:30 - 20:00", available: false },
        { time: "20:00 - 20:30", available: true },
        { time: "20:30 - 21:00", available: true },
        { time: "21:00 - 21:30", available: false },
      ],
      // Saturday (Thứ 7)
      6: [
        { time: "08:00 - 08:30", available: true },
        { time: "08:30 - 09:00", available: true },
        { time: "09:00 - 09:30", available: true },
        { time: "09:30 - 10:00", available: true },
        { time: "10:00 - 10:30", available: false },
        { time: "10:30 - 11:00", available: true },
        { time: "11:00 - 11:30", available: true },
        { time: "11:30 - 12:00", available: true },
      ],
      // Sunday (Chủ nhật)
      0: [
        { time: "14:00 - 14:30", available: true },
        { time: "14:30 - 15:00", available: true },
        { time: "15:00 - 15:30", available: false },
        { time: "15:30 - 16:00", available: true },
        { time: "16:00 - 16:30", available: true },
        { time: "16:30 - 17:00", available: true },
        { time: "17:00 - 17:30", available: false },
        { time: "17:30 - 18:00", available: true },
      ],
    },
  };

  // Generate 7 days of current week
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1); // Start from Monday

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date: day,
        label:
          i === 0
            ? "Hôm nay"
            : day.toLocaleDateString("vi-VN", { weekday: "long" }),
        shortLabel: day.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        fullLabel: `${
          i === 0
            ? "Hôm nay"
            : day.toLocaleDateString("vi-VN", { weekday: "long" })
        } - ${day.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        })}`,
      });
    }
    return weekDays;
  };

  const weekDays = getWeekDays();

  // Get available time slots for selected date
  const getAvailableTimeSlots = (date) => {
    if (!selectedDoctor || !date) return [];
    const dayOfWeek = date.getDay();

    // If doctor has timeSlots, use them
    if (selectedDoctor.timeSlots) {
      return selectedDoctor.timeSlots[dayOfWeek] || [];
    }

    // Fallback to default time slots if doctor doesn't have timeSlots
    return doctorData.timeSlots[dayOfWeek] || [];
  };

  useEffect(() => {
    // Get doctor data from location state or props
    if (location.state?.doctor) {
      setSelectedDoctor(location.state.doctor);
    } else {
      setSelectedDoctor(doctorData);
    }
    // Set default selected date to today
    setSelectedDate(weekDays[0]);
  }, [location.state]);

  const handleDateSelect = (day) => {
    setSelectedDate(day);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTime(timeSlot);
    setShowPatientForm(true);
  };

  const handleBackToTimeSelection = () => {
    setShowPatientForm(false);
    setSelectedTime(null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // TODO: Comment out payment validation for now
      // Simulate API call - in real implementation, this would call the booking API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success("Đặt lịch khám thành công! Đang chờ bác sĩ xác nhận.");
      navigate("/benh-nhan", {
        state: {
          message: "Đặt lịch khám thành công!",
          appointment: {
            doctor: selectedDoctor,
            date: selectedDate,
            time: selectedTime,
            patientInfo: values,
            status: "pending_doctor", // Waiting for doctor approval
          },
        },
      });
    } catch (error) {
      message.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const renderPatientForm = () => (
    <div className="patient-form-section">
      <div className="form-header">
        <Title level={4}>Thông tin bệnh nhân</Title>
        <Button type="link" onClick={handleBackToTimeSelection}>
          ← Chọn lại thời gian
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="patient-form"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Email không hợp lệ!" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="age"
              label="Tuổi"
              rules={[{ required: true, message: "Vui lòng nhập tuổi!" }]}
            >
              <Input type="number" placeholder="Nhập tuổi" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Radio.Group>
            <Radio value="male">Nam</Radio>
            <Radio value="female">Nữ</Radio>
            <Radio value="other">Khác</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <TextArea rows={3} placeholder="Nhập địa chỉ chi tiết" />
        </Form.Item>

        <Form.Item name="symptoms" label="Triệu chứng hiện tại">
          <TextArea rows={4} placeholder="Mô tả triệu chứng (không bắt buộc)" />
        </Form.Item>

        <Form.Item name="insurance" label="Bảo hiểm y tế">
          <Radio.Group>
            <Radio value="yes">Có</Radio>
            <Radio value="no">Không</Radio>
          </Radio.Group>
        </Form.Item>

        <div className="form-actions">
          <Button size="large" onClick={handleBackToTimeSelection}>
            Quay lại
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            Xác nhận đặt lịch
          </Button>
        </div>
      </Form>
    </div>
  );

  if (!selectedDoctor) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  return (
    <div className="appointment-booking-page">
      <div className="container">
        {/* Breadcrumb */}
        <NavigationBreadcrumb
          items={[
            {
              label: "Trang chủ",
              path: "/",
              icon: <HomeOutlined />,
            },
            {
              label: "Khám chuyên khoa",
              path: "/chuyen-khoa",
            },
            {
              label: selectedDoctor?.specialty || "Chuyên khoa",
              path: `/chuyen-khoa?specialty=${selectedDoctor?.specialty}`,
            },
            {
              label: selectedDoctor?.name || "Bác sĩ",
            },
          ]}
        />

        <Row gutter={24}>
          {/* Left Column - Doctor Info & Booking */}
          <Col xs={24} lg={16}>
            <div className="doctor-booking-section">
              {/* Doctor Profile */}
              <Card className="doctor-profile-card">
                <div className="doctor-profile-content">
                  <Avatar
                    size={120}
                    src={selectedDoctor?.image}
                    icon={<UserOutlined />}
                  />
                  <div className="doctor-info">
                    <Title level={3}>{selectedDoctor?.name}</Title>
                    <Paragraph className="doctor-description">
                      {selectedDoctor?.description}
                    </Paragraph>
                    <div className="doctor-location">
                      <EnvironmentOutlined /> {selectedDoctor?.location}
                    </div>
                    <Button
                      type="primary"
                      icon={<ShareAltOutlined />}
                      className="share-btn"
                    >
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Date Selection */}
              <Card className="date-selection-card">
                <div className="date-selector">
                  <Select
                    value={selectedDate?.fullLabel}
                    style={{ width: "100%", fontSize: "16px" }}
                    size="large"
                    suffixIcon={<CalendarOutlined />}
                    onChange={(value) => {
                      const selectedDay = weekDays.find(
                        (day) => day.fullLabel === value
                      );
                      if (selectedDay) {
                        handleDateSelect(selectedDay);
                      }
                    }}
                  >
                    {weekDays.map((day, index) => (
                      <Option key={index} value={day.fullLabel}>
                        {day.fullLabel}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Card>

              {/* Time Slots */}
              <Card className="time-slots-card">
                <div className="time-slots-header">
                  <CalendarOutlined />
                  <Title level={4}>LỊCH KHÁM</Title>
                </div>

                {!showPatientForm ? (
                  <div className="time-slots-grid">
                    {getAvailableTimeSlots(selectedDate?.date)?.map(
                      (slot, index) => (
                        <Button
                          key={index}
                          type={
                            selectedTime === slot.time ? "primary" : "default"
                          }
                          disabled={!slot.available}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                          className="time-slot-button"
                          size="large"
                        >
                          {slot.time}
                        </Button>
                      )
                    )}
                  </div>
                ) : (
                  renderPatientForm()
                )}

                {!showPatientForm && (
                  <div className="booking-instruction">
                    <Text type="secondary">Chọn và đặt lịch (Miễn phí đặt lịch)</Text>
                    {/* TODO: Comment out payment info for now */}
                    {/* <Text type="secondary">Phí đặt lịch: 0đ</Text> */}
                  </div>
                )}
              </Card>
            </div>
          </Col>

          {/* Right Column - Clinic Info */}
          <Col xs={24} lg={8}>
            <div className="clinic-info-section">
              {/* Clinic Address */}
              <Card className="clinic-address-card">
                <Title level={4}>ĐỊA CHỈ KHÁM</Title>
                <div className="clinic-name">Tổ hợp Y tế Mediplus</div>
                <div className="clinic-address">{selectedDoctor?.address}</div>

                <div className="promotion-info">
                  <ThunderboltOutlined className="promotion-icon" />
                  <span>Chương trình khuyến mại</span>
                  <Button type="link" size="small">
                    Xem chi tiết
                  </Button>
                </div>
              </Card>

              {/* Consultation Fee */}
              <Card className="consultation-fee-card">
                <Title level={4}>GIÁ KHÁM</Title>
                <div className="fee-amount">{selectedDoctor?.price}</div>
                <Button type="link" size="small">
                  Xem chi tiết
                </Button>
              </Card>

              {/* Doctor Details */}
              <Card className="doctor-details-card">
                <Title level={4}>{selectedDoctor?.name}</Title>
                <div className="doctor-experience">
                  <Text strong>Kinh nghiệm:</Text> {selectedDoctor?.experience}
                </div>
                <div className="doctor-rating">
                  <StarOutlined style={{ color: "#fadb14" }} />
                  <Text strong>Đánh giá:</Text> {selectedDoctor?.rating} (
                  {selectedDoctor?.reviewCount} đánh giá)
                </div>
                <div className="doctor-specialties">
                  <Text strong>Chuyên khoa:</Text> {selectedDoctor?.specialty} -{" "}
                  {selectedDoctor?.subSpecialty}
                </div>
                <div className="doctor-hospital">
                  <Text strong>Bệnh viện:</Text> {selectedDoctor?.hospital}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AppointmentBooking;
