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
import "./TimeSlotSelection.css";

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
  const [selectedMode, setSelectedMode] = useState("offline");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [defaultClinic, setDefaultClinic] = useState(null);
  const [clinicLoading, setClinicLoading] = useState(false);

  useEffect(() => {
    if (location.state?.doctor) {
      setDoctor(location.state.doctor);
      // Use specialization from state or from doctor's first specialization
      const spec =
        location.state?.specialization ||
        location.state?.doctor?.specializationIds?.[0];
      setSpecialization(spec);
    } else {
      navigate("/dat-lich/chon-chuyen-khoa");
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedDate && doctor) {
      fetchTimeSlots();
    }
  }, [selectedDate, doctor]);

  useEffect(() => {
    if (doctor) {
      fetchDefaultClinic();
    }
  }, [doctor]);

  const fetchTimeSlots = async () => {
    try {
      setTimeSlotsLoading(true);
      const dateStr = selectedDate.format("YYYY-MM-DD");
      console.log("Doctor object:", doctor);
      console.log("Doctor ID:", doctor?._id);
      const response = await api.get(
        `/api/patients/doctors/${doctor._id}/time-slots?date=${dateStr}`
      );

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

  const fetchDefaultClinic = async () => {
    try {
      setClinicLoading(true);
      const response = await api.get(`/api/doctors/${doctor._id}/clinics`);

      if (
        response.success &&
        response.data.clinics &&
        response.data.clinics.length > 0
      ) {
        // Lấy phòng khám đầu tiên làm phòng khám mặc định
        setDefaultClinic(response.data.clinics[0]);
      } else {
        console.error("Error fetching clinics:", response.message);
        setDefaultClinic(null);
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      setDefaultClinic(null);
    } finally {
      setClinicLoading(false);
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
      state: { specialization },
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
        scheduledStart: selectedDate
          .clone()
          .hour(parseInt(selectedTimeSlot.startTime.split(":")[0]))
          .minute(parseInt(selectedTimeSlot.startTime.split(":")[1]))
          .toISOString(),
        scheduledEnd: selectedDate
          .clone()
          .hour(parseInt(selectedTimeSlot.endTime.split(":")[0]))
          .minute(parseInt(selectedTimeSlot.endTime.split(":")[1]))
          .toISOString(),
      };

      // Add clinicId for offline appointments
      if (selectedMode === "offline" && defaultClinic) {
        appointmentData.clinicId = defaultClinic._id;
      }

      // Step 1: Create appointment
      const response = await api.post(
        "/api/patients/appointments",
        appointmentData
      );

      if (response.success) {
        const appointment = response.data.appointment;
        
        // Step 2: Create payment link
        try {
          // Import payment service
          const { createPayOSPayment } = await import("../../services/payService");
          
          const consultationFee = 10000; //  (có thể thay đổi số tiền ở đây)
          
          const paymentResponse = await createPayOSPayment({
            appointmentId: appointment._id,
            amount: consultationFee,
            description: `Kham benh MedConnect`, // Max 25 ký tự
          });

          if (paymentResponse.success && paymentResponse.data.payUrl) {
            message.success("Đang chuyển đến trang thanh toán...");
            
            // Redirect to PayOS payment page
            window.location.href = paymentResponse.data.payUrl;
          } else {
            // Payment link creation failed - need to cancel appointment
            message.error("Không thể tạo link thanh toán. Đang hủy đặt lịch...");
            
            // Try to cancel the appointment using the correct endpoint
            try {
              await api.put(`/api/patients/me/appointments/${appointment._id}/cancel`, {
                cancelReason: "Không thể tạo link thanh toán"
              });
              console.log("Appointment cancelled - payment link creation failed");
            } catch (cancelError) {
              console.error("Error canceling appointment:", cancelError);
            }
            
            setTimeout(() => {
              navigate("/dat-lich/chon-thoi-gian", {
                state: { doctor, specialization },
              });
            }, 2000);
          }
        } catch (paymentError) {
          console.error("Error creating payment:", paymentError);
          message.error("Có lỗi xảy ra khi tạo thanh toán. Đang hủy đặt lịch...");
          
          // Rollback - cancel the appointment that was just created
          try {
            await api.put(`/api/patients/me/appointments/${appointment._id}/cancel`, {
              cancelReason: "Lỗi khi tạo thanh toán"
            });
            console.log("Appointment cancelled due to payment error");
          } catch (cancelError) {
            console.error("Error canceling appointment:", cancelError);
          }
          
          // Navigate back to time selection after 2 seconds
          setTimeout(() => {
            navigate("/dat-lich/chon-thoi-gian", {
              state: { doctor, specialization },
            });
          }, 2000);
        }
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
    return specializationIds.map((spec) => spec.name).join(", ");
  };

  if (!doctor || !specialization) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
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
              label:
                (() => {
                  const fullName = doctor?.userId?.fullName || doctor?.fullName;
                  return fullName?.startsWith("BS.")
                    ? fullName
                    : `BS. ${fullName}`;
                })() || "Bác sĩ",
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
                  <div>
                    <img
                      src={doctor.avatarUrl || "/default-avatar.png"}
                      alt={doctor.userId?.fullName || doctor.fullName}
                      className="avatar-image"
                    />
                  </div>
                  <div className="doctor-info">
                    <Title level={3}>
                      {(() => {
                        const fullName =
                          doctor.userId?.fullName || doctor.fullName;
                        return fullName?.startsWith("BS.")
                          ? fullName
                          : `BS. ${fullName}`;
                      })()}
                    </Title>
                    <div className="doctor-specializations">
                      <Tag color="blue">
                        {getSpecializationNames(doctor.specializationIds)}
                      </Tag>
                    </div>
                    {doctor.yearsExperience && (
                      <div className="doctor-experience">
                        <Text type="secondary">
                          <UserOutlined style={{ marginRight: 4 }} />
                          {doctor.yearsExperience} năm kinh nghiệm
                        </Text>
                      </div>
                    )}
                    {doctor.bio && (
                      <Paragraph className="doctor-bio">{doctor.bio}</Paragraph>
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
                      <Text style={{ marginLeft: 16 }}>
                        Đang tải khung giờ...
                      </Text>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text type="secondary">
                        Không có khung giờ khám vào ngày này
                      </Text>
                    </div>
                  ) : (
                    <div className="time-slots-grid">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot._id}
                          type={
                            selectedTimeSlot?._id === slot._id
                              ? "primary"
                              : "default"
                          }
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
                    <Button
                      type="link"
                      onClick={() => setShowBookingForm(false)}
                    >
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
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn hình thức khám!",
                        },
                      ]}
                    >
                      <Radio.Group
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                      >
                        <Radio value="online">Khám online</Radio>
                        <Radio value="offline">Khám tại phòng khám</Radio>
                      </Radio.Group>
                    </Form.Item>

                    {selectedMode === "offline" && (
                      <Form.Item label="Phòng khám">
                        {clinicLoading ? (
                          <div style={{ padding: "8px 0" }}>
                            <Spin size="small" /> Đang tải thông tin phòng
                            khám...
                          </div>
                        ) : defaultClinic ? (
                          <div className="clinic-info-display">
                            <div className="clinic-name">
                              <EnvironmentOutlined style={{ marginRight: 8 }} />
                              <strong>{defaultClinic.name}</strong>
                            </div>
                            <div className="clinic-address">
                              {defaultClinic.address}
                            </div>
                            {defaultClinic.phone && (
                              <div className="clinic-phone">
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                {defaultClinic.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Text type="secondary">
                            Không có thông tin phòng khám
                          </Text>
                        )}
                      </Form.Item>
                    )}

                    {/* Reason */}
                    <Form.Item name="reason" label="Lý do khám">
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
                      <Button
                        size="large"
                        onClick={() => setShowBookingForm(false)}
                      >
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
                  <Text>
                    {(() => {
                      const fullName =
                        doctor.userId?.fullName || doctor.fullName;
                      return fullName?.startsWith("BS.")
                        ? fullName
                        : `BS. ${fullName}`;
                    })()}
                  </Text>
                </div>

                <div className="summary-item">
                  <Text strong>Chuyên khoa:</Text>
                  <Text>
                    {getSpecializationNames(doctor.specializationIds)}
                  </Text>
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
                    <Text>
                      {selectedMode === "online"
                        ? "Khám online"
                        : "Khám tại phòng khám"}
                    </Text>
                  </div>
                )}

                {selectedMode === "offline" && defaultClinic && (
                  <div className="summary-item">
                    <Text strong>Phòng khám:</Text>
                    <div>
                      <div>{defaultClinic.name}</div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {defaultClinic.address}
                      </Text>
                    </div>
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
                  <li>Lịch hẹn sẽ được đặt với trạng thái "Chờ xác nhận"</li>
                  <li>Bác sĩ sẽ xác nhận lịch hẹn trong vòng 12 giờ</li>
                  <li>Bạn sẽ nhận được thông báo khi bác sĩ xác nhận</li>
                  <li>Có thể hủy lịch hẹn trước khi bác sĩ xác nhận</li>
                </ul>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TimeSlotSelection;
