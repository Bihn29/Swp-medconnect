import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
  message,
  DatePicker,
  Radio,
  Form,
  Input,
  Select,
  Space,
  Divider,
  Tag,
  Rate,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../components/Breadcrumb/NavigationBreadcrumb";
import { api } from "../../lib/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TimeSlotSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [specialization, setSpecialization] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedMode, setSelectedMode] = useState("online");
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (location.state?.doctor && location.state?.specialization) {
      setDoctor(location.state.doctor);
      setSpecialization(location.state.specialization);
    } else {
      navigate("/dat-lich/chon-chuyen-khoa");
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedDate && doctor) {
      fetchTimeSlots();
    }
  }, [selectedDate, doctor]);

  const fetchTimeSlots = async () => {
    try {
      setTimeSlotsLoading(true);
      const dateStr = selectedDate.format("YYYY-MM-DD");
      console.log("Doctor object:", doctor);
      console.log("Doctor ID:", doctor?._id);
      const response = await api.get(`/api/doctors/${doctor._id}/time-slots?date=${dateStr}`);
      
      if (response.success) {
        setTimeSlots(response.data.timeSlots);
      } else {
        message.error("Không thể tải khung giờ khám");
        setTimeSlots([]);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      message.error("Có lỗi xảy ra khi tải khung giờ khám");
      setTimeSlots([]);
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setShowBookingForm(false);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowBookingForm(true);
  };

  const handleBackToDoctors = () => {
    navigate("/dat-lich/chon-bac-si", {
      state: { specialization }
    });
  };

  const handleBookingSubmit = async (values) => {
    try {
      setLoading(true);

      // Prepare appointment data
      const appointmentData = {
        doctorId: doctor._id,
        slotId: selectedTimeSlot._id,
        mode: selectedMode,
        reason: values.reason || "",
        scheduledStart: selectedDate.clone().hour(parseInt(selectedTimeSlot.startTime.split(':')[0])).minute(parseInt(selectedTimeSlot.startTime.split(':')[1])).toISOString(),
        scheduledEnd: selectedDate.clone().hour(parseInt(selectedTimeSlot.endTime.split(':')[0])).minute(parseInt(selectedTimeSlot.endTime.split(':')[1])).toISOString(),
      };

      // TODO: Comment out payment-related fields for now
      // if (selectedMode === "offline") {
      //   appointmentData.clinicId = values.clinicId;
      // }

      const response = await api.post("/api/patients/appointments", appointmentData);

      if (response.success) {
        message.success("Đặt lịch khám thành công! Đang chờ bác sĩ xác nhận.");
        navigate("/benh-nhan", {
          state: {
            message: "Đặt lịch khám thành công!",
            appointment: response.data.appointment
          }
        });
      } else {
        message.error(response.message || "Có lỗi xảy ra khi đặt lịch");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      message.error("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    // Disable dates before today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    return current && current < today;
  };

  const getSpecializationNames = (specializationIds) => {
    if (!specializationIds || specializationIds.length === 0) return [];
    return specializationIds.map(spec => spec.name).join(", ");
  };

  if (!doctor || !specialization) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
      }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 16 }}>Đang tải thông tin...</Text>
      </div>
    );
  }

  return (
    <div className="time-slot-selection-page">
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
              label: "Đặt lịch khám",
              path: "/dat-lich",
            },
            {
              label: "Chọn chuyên khoa",
              path: "/dat-lich/chon-chuyen-khoa",
            },
            {
              label: specialization?.name || "Chuyên khoa",
              path: "/dat-lich/chon-bac-si",
            },
            {
              label: doctor?.fullName || "Bác sĩ",
            },
          ]}
        />

        <Row gutter={24}>
          {/* Left Column - Doctor Info & Time Selection */}
          <Col xs={24} lg={16}>
            <div className="booking-section">
              {/* Doctor Profile */}
              <Card className="doctor-profile-card">
                <div className="doctor-profile-content">
                  <div className="doctor-avatar">
                    <img
                      src={doctor.avatarUrl || "/default-avatar.png"}
                      alt={doctor.fullName}
                      className="avatar-image"
                    />
                  </div>
                  <div className="doctor-info">
                    <Title level={3}>{doctor.fullName}</Title>
                    <div className="doctor-specializations">
                      <Tag color="blue">
                        {getSpecializationNames(doctor.specializationIds)}
                      </Tag>
                    </div>
                    {doctor.bio && (
                      <Paragraph className="doctor-bio">
                        {doctor.bio}
                      </Paragraph>
                    )}
                    <div className="doctor-rating">
                      <Rate disabled value={doctor.ratingAvg || 0} />
                      <Text type="secondary">
                        ({doctor.ratingCount || 0} đánh giá)
                      </Text>
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
                <Title level={4}>
                  <CalendarOutlined /> Chọn ngày khám
                </Title>
                <DatePicker
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày khám"
                  disabledDate={disabledDate}
                  onChange={handleDateChange}
                  value={selectedDate}
                />
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <Card className="time-slots-card">
                  <Title level={4}>
                    <ClockCircleOutlined /> Chọn giờ khám
                  </Title>
                  
                  {timeSlotsLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Spin />
                      <Text style={{ marginLeft: 16 }}>Đang tải khung giờ...</Text>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">Không có khung giờ khám vào ngày này</Text>
                    </div>
                  ) : (
                    <div className="time-slots-grid">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot._id}
                          type={selectedTimeSlot?._id === slot._id ? "primary" : "default"}
                          disabled={!slot.available}
                          onClick={() => handleTimeSlotSelect(slot)}
                          className="time-slot-button"
                          size="large"
                        >
                          {slot.timeRange}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Booking Form */}
              {showBookingForm && selectedTimeSlot && (
                <Card className="booking-form-card">
                  <div className="form-header">
                    <Title level={4}>Thông tin đặt lịch</Title>
                    <Button type="link" onClick={() => setShowBookingForm(false)}>
                      ← Chọn lại thời gian
                    </Button>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleBookingSubmit}
                    className="booking-form"
                  >
                    {/* Mode Selection */}
                    <Form.Item
                      name="mode"
                      label="Hình thức khám"
                      initialValue="online"
                      rules={[{ required: true, message: "Vui lòng chọn hình thức khám!" }]}
                    >
                      <Radio.Group 
                        value={selectedMode} 
                        onChange={(e) => setSelectedMode(e.target.value)}
                      >
                        <Radio value="online">Khám online</Radio>
                        <Radio value="offline">Khám tại phòng khám</Radio>
                      </Radio.Group>
                    </Form.Item>

                    {/* TODO: Comment out clinic selection for now */}
                    {/* {selectedMode === "offline" && (
                      <Form.Item
                        name="clinicId"
                        label="Chọn phòng khám"
                        rules={[{ required: true, message: "Vui lòng chọn phòng khám!" }]}
                      >
                        <Select placeholder="Chọn phòng khám">
                          <Option value="clinic1">Phòng khám 1</Option>
                          <Option value="clinic2">Phòng khám 2</Option>
                        </Select>
                      </Form.Item>
                    )} */}

                    {/* Reason */}
                    <Form.Item
                      name="reason"
                      label="Lý do khám"
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Mô tả triệu chứng hoặc lý do khám (không bắt buộc)" 
                      />
                    </Form.Item>

                    {/* TODO: Comment out payment section for now */}
                    {/* <Divider />
                    <div className="payment-section">
                      <Title level={5}>Thanh toán</Title>
                      <Text>Phí khám: 350.000đ</Text>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Thanh toán và đặt lịch
                      </Button>
                    </div> */}

                    <div className="form-actions">
                      <Button size="large" onClick={() => setShowBookingForm(false)}>
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
                </Card>
              )}
            </div>
          </Col>

          {/* Right Column - Booking Summary */}
          <Col xs={24} lg={8}>
            <div className="booking-summary-section">
              {/* Booking Summary */}
              <Card className="booking-summary-card">
                <Title level={4}>Tóm tắt đặt lịch</Title>
                
                <div className="summary-item">
                  <Text strong>Bác sĩ:</Text>
                  <Text>{doctor.fullName}</Text>
                </div>
                
                <div className="summary-item">
                  <Text strong>Chuyên khoa:</Text>
                  <Text>{getSpecializationNames(doctor.specializationIds)}</Text>
                </div>
                
                {selectedDate && (
                  <div className="summary-item">
                    <Text strong>Ngày khám:</Text>
                    <Text>{selectedDate.format("DD/MM/YYYY")}</Text>
                  </div>
                )}
                
                {selectedTimeSlot && (
                  <div className="summary-item">
                    <Text strong>Giờ khám:</Text>
                    <Text>{selectedTimeSlot.timeRange}</Text>
                  </div>
                )}
                
                {selectedMode && (
                  <div className="summary-item">
                    <Text strong>Hình thức:</Text>
                    <Text>{selectedMode === "online" ? "Khám online" : "Khám tại phòng khám"}</Text>
                  </div>
                )}

                {/* TODO: Comment out payment info for now */}
                {/* <Divider />
                <div className="payment-info">
                  <div className="summary-item">
                    <Text strong>Phí khám:</Text>
                    <Text>350.000đ</Text>
                  </div>
                  <div className="summary-item">
                    <Text strong>Phí đặt lịch:</Text>
                    <Text>0đ</Text>
                  </div>
                  <Divider />
                  <div className="summary-item">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong>350.000đ</Text>
                  </div>
                </div> */}
              </Card>

              {/* Help Text */}
              <Card className="help-card">
                <Title level={4}>Lưu ý</Title>
                <ul>
                  <li>Lịch hẹn sẽ được đặt với trạng thái "Chờ bác sĩ xác nhận"</li>
                  <li>Bác sĩ sẽ xác nhận lịch hẹn trong vòng 12 giờ</li>
                  <li>Bạn sẽ nhận được thông báo khi bác sĩ xác nhận</li>
                  <li>Có thể hủy lịch hẹn trước khi bác sĩ xác nhận</li>
                </ul>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      <style jsx>{`
        .time-slot-selection-page {
          padding: 24px 0;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .booking-section {
          margin-bottom: 24px;
        }

        .doctor-profile-card {
          margin-bottom: 24px;
        }

        .doctor-profile-content {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .doctor-avatar {
          flex-shrink: 0;
        }

        .avatar-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
        }

        .doctor-info {
          flex: 1;
        }

        .doctor-specializations {
          margin: 8px 0;
        }

        .doctor-bio {
          margin: 12px 0 !important;
          color: #8c8c8c;
        }

        .doctor-rating {
          margin: 12px 0;
        }

        .share-btn {
          margin-top: 12px;
        }

        .date-selection-card,
        .time-slots-card,
        .booking-form-card {
          margin-bottom: 24px;
        }

        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .time-slot-button {
          height: 50px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .booking-summary-section {
          position: sticky;
          top: 24px;
        }

        .booking-summary-card,
        .help-card {
          margin-bottom: 24px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .payment-info {
          margin-top: 16px;
        }

        .help-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .help-card li {
          margin-bottom: 8px;
          color: #595959;
        }
      `}</style>
    </div>
  );
};

export default TimeSlotSelection;
