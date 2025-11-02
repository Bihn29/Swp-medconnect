import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
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
  Checkbox,
  Modal,
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
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../components/Breadcrumb/NavigationBreadcrumb";
import { api } from "../../lib/api";
import { useUserProfile } from "../../hooks/useUserProfile";
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
  const [selectedMode, setSelectedMode] = useState(null); // No default - user must choose
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [defaultClinic, setDefaultClinic] = useState(null);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [bookingFor, setBookingFor] = useState("me"); // "me" or "family"
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [loadingFamilyMembers, setLoadingFamilyMembers] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs()); // Track current time for real-time filtering

  // Get user profile to validate required fields
  const { userProfile } = useUserProfile();

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

  useEffect(() => {
    if (bookingFor === "family") {
      fetchFamilyMembers();
    }
  }, [bookingFor]);

  // Real-time update: Refresh current time every minute to hide expired slots
  useEffect(() => {
    // Only run if a date is selected (and it's today)
    if (selectedDate && selectedDate.isSame(dayjs(), "day")) {
      // Update immediately
      setCurrentTime(dayjs());

      // Set interval to update every minute
      const interval = setInterval(() => {
        setCurrentTime(dayjs());
      }, 60000); // Update every 60 seconds (1 minute)

      // Cleanup interval on unmount or when date changes
      return () => clearInterval(interval);
    } else {
      // If not today, just set current time once
      setCurrentTime(dayjs());
    }
  }, [selectedDate]);

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

  const fetchFamilyMembers = async () => {
    try {
      setLoadingFamilyMembers(true);
      const response = await api.get("/api/patients/me/family-members");

      if (response.success && response.data.familyMembers) {
        setFamilyMembers(response.data.familyMembers);
      } else {
        message.error("Không thể tải danh sách người thân");
        setFamilyMembers([]);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
      message.error("Có lỗi xảy ra khi tải danh sách người thân");
      setFamilyMembers([]);
    } finally {
      setLoadingFamilyMembers(false);
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
    // Reset mode selection when selecting a new time slot
    setSelectedMode(null);
    form.setFieldsValue({ mode: undefined });
  };

  const handleBackToDoctors = () => {
    navigate("/dat-lich/chon-bac-si", {
      state: { specialization },
    });
  };

  // Validate profile fields when booking for "me"
  const validateProfileComplete = () => {
    const requiredFields = [
      { key: "fullName", label: "Họ và tên" },
      { key: "phone", label: "Số điện thoại" },
      { key: "gender", label: "Giới tính" },
      { key: "dob", label: "Ngày sinh" },
      { key: "address", label: "Địa chỉ" },
      // Check both citizenId and nationalId (depending on which field backend uses)
      {
        key: "citizenId",
        label: "Số CCCD/CMND",
        alternativeKey: "nationalId",
      },
    ];

    const missingFields = [];

    requiredFields.forEach(({ key, label, alternativeKey }) => {
      const value = userProfile?.[key];
      const altValue = alternativeKey ? userProfile?.[alternativeKey] : null;

      // Field is valid if it has a value (either from main key or alternative key)
      const hasValue = value || altValue;
      const isValidValue =
        hasValue && typeof hasValue === "string" && hasValue.trim() !== "";

      if (!isValidValue) {
        missingFields.push(label);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  const handleBookingSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate profile if booking for "me"
      if (bookingFor === "me") {
        const validation = validateProfileComplete();
        if (!validation.isValid) {
          Modal.confirm({
            title: "Thông tin hồ sơ chưa đầy đủ",
            icon: <ExclamationCircleOutlined />,
            content: (
              <div>
                <p>
                  Vui lòng cập nhật đầy đủ thông tin hồ sơ trước khi đặt lịch:
                </p>
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  {validation.missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            ),
            okText: "Đi đến trang cài đặt",
            cancelText: "Hủy",
            onOk: () => {
              navigate("/benh-nhan/cai-dat");
            },
          });
          setLoading(false);
          return;
        }
      }

      let patientIdForBooking = null;

      // If booking for family, create family member first
      if (bookingFor === "family") {
        try {
          const familyResponse = await api.post(
            "/api/patients/me/family-members",
            {
              fullName: values.fullName,
              dob: values.dob ? values.dob.format("YYYY-MM-DD") : undefined,
              gender: values.gender,
              ethnicity: values.ethnicity,
              occupation: values.occupation,
              bloodType: values.bloodType || "Unknown",
              relationshipToOwner: values.relationshipToOwner,
              phone: values.phone,
              citizenId: values.citizenId,
              address: values.address,
              allergyNotes: values.allergyNotes || "",
              medicalHistory: values.medicalHistory || [],
            }
          );

          if (familyResponse.success) {
            message.success("Thêm người thân thành công!");
            patientIdForBooking = familyResponse.data.patient._id;
            await fetchFamilyMembers();
          } else {
            message.error(familyResponse.message || "Thêm người thân thất bại");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error adding family member:", error);
          message.error("Có lỗi xảy ra khi thêm người thân");
          setLoading(false);
          return;
        }
      }

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

      // Add patientId for family member booking
      if (bookingFor === "family" && patientIdForBooking) {
        appointmentData.patientId = patientIdForBooking;
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
          const { createPayOSPayment } = await import(
            "../../services/payService"
          );

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
            message.error(
              "Không thể tạo link thanh toán. Đang hủy đặt lịch..."
            );

            // Try to cancel the appointment using the correct endpoint
            try {
              await api.put(
                `/api/patients/me/appointments/${appointment._id}/cancel`,
                {
                  cancelReason: "Không thể tạo link thanh toán",
                }
              );
              console.log(
                "Appointment cancelled - payment link creation failed"
              );
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
          message.error(
            "Có lỗi xảy ra khi tạo thanh toán. Đang hủy đặt lịch..."
          );

          // Rollback - cancel the appointment that was just created
          try {
            await api.put(
              `/api/patients/me/appointments/${appointment._id}/cancel`,
              {
                cancelReason: "Lỗi khi tạo thanh toán",
              }
            );
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

  const isSlotPassed = (slot) => {
    if (!selectedDate || !slot.startTime) return false;

    // Kiểm tra nếu ngày được chọn là ngày hôm nay
    const isToday = selectedDate.isSame(currentTime, "day");

    if (!isToday) return false;

    // So sánh thời gian hiện tại (from state) với thời gian bắt đầu của slot
    const [hours, minutes] = slot.startTime.split(":").map(Number);
    const slotTime = selectedDate
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);

    // Slot đã qua nếu thời gian bắt đầu đã nhỏ hơn thời gian hiện tại
    return slotTime.isBefore(currentTime);
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
                      {timeSlots.map((slot) => {
                        // Kiểm tra slot đã qua giờ
                        const isPassed = isSlotPassed(slot);
                        // Kiểm tra slot không available (đã có appointment hoặc bị blocked)
                        const isUnavailable = !slot.available;
                        // Kiểm tra slot bị blocked (bác sĩ nghỉ)
                        const isBlocked =
                          slot.isBlocked || slot.status === "blocked";
                        // Slot bị disable nếu đã qua giờ, không available, hoặc bị blocked
                        const isDisabled =
                          isPassed || isUnavailable || isBlocked;

                        // Tạo tooltip text để giải thích tại sao slot bị disable
                        let disabledReason = "";
                        if (isBlocked) {
                          disabledReason = slot.leaveReason
                            ? `Bác sĩ nghỉ: ${slot.leaveReason}`
                            : "Bác sĩ nghỉ";
                        } else if (isPassed) {
                          disabledReason = "Khung giờ này đã qua";
                        } else if (isUnavailable && slot.appointmentStatus) {
                          // Hiển thị status cụ thể của appointment
                          const statusMap = {
                            pending_doctor: "Đang chờ bác sĩ xác nhận",
                            accepted: "Đã được chấp nhận",
                            in_progress: "Đang trong quá trình khám",
                            done: "Đã hoàn thành",
                          };
                          disabledReason =
                            statusMap[slot.appointmentStatus] ||
                            "Khung giờ này đã được đặt";
                        } else if (isUnavailable) {
                          disabledReason = "Khung giờ này đã được đặt";
                        }

                        return (
                          <Button
                            key={slot._id}
                            type={
                              selectedTimeSlot?._id === slot._id
                                ? "primary"
                                : "default"
                            }
                            onClick={() => {
                              if (!isDisabled) {
                                handleTimeSlotSelect(slot);
                              }
                            }}
                            className="time-slot-button"
                            size="large"
                            disabled={isDisabled}
                            title={disabledReason}
                          >
                            {slot.timeRange}
                          </Button>
                        );
                      })}
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
                    {/* Booking For Selection */}
                    <Form.Item label="Đặt khám cho">
                      <div className="booking-for-buttons">
                        <Button
                          type={bookingFor === "me" ? "primary" : "default"}
                          onClick={() => {
                            setBookingFor("me");
                            setSelectedFamilyMember(null);
                          }}
                          className="booking-button"
                        >
                          Đặt khám cho tôi
                        </Button>
                        <Button
                          type={bookingFor === "family" ? "primary" : "default"}
                          onClick={() => {
                            setBookingFor("family");
                            setSelectedFamilyMember(null); // Clear any previous selection
                          }}
                          className="booking-button"
                        >
                          Đặt khám hộ người thân
                        </Button>
                      </div>
                    </Form.Item>

                    {/* Family Member Fields - Show inline when booking for family */}
                    {bookingFor === "family" && (
                      <div>
                        <Title level={5} style={{ marginBottom: 16 }}>
                          Thông tin người thân
                        </Title>
                        <Form.Item
                          label="Họ và tên"
                          name="fullName"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ tên!",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập họ và tên" />
                        </Form.Item>

                        <Form.Item
                          label="Số CCCD/CMND"
                          name="citizenId"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số CCCD!",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập số CCCD/CMND" />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              label="Ngày sinh"
                              name="dob"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn ngày sinh!",
                                },
                              ]}
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sinh"
                                disabledDate={(current) =>
                                  current && current > new Date()
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Giới tính"
                              name="gender"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn giới tính!",
                                },
                              ]}
                            >
                              <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Dân tộc" name="ethnicity">
                              <Input placeholder="Nhập dân tộc (nếu có)" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Nghề nghiệp" name="occupation">
                              <Input placeholder="Nhập nghề nghiệp (nếu có)" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item label="Nhóm máu" name="bloodType">
                          <Select
                            placeholder="Chọn nhóm máu (nếu có)"
                            allowClear
                          >
                            <Option value="A+">A+</Option>
                            <Option value="A-">A-</Option>
                            <Option value="B+">B+</Option>
                            <Option value="B-">B-</Option>
                            <Option value="AB+">AB+</Option>
                            <Option value="AB-">AB-</Option>
                            <Option value="O+">O+</Option>
                            <Option value="O-">O-</Option>
                            <Option value="Unknown">Không rõ</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label="Mối quan hệ"
                          name="relationshipToOwner"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn mối quan hệ!",
                            },
                          ]}
                        >
                          <Select placeholder="Chọn mối quan hệ">
                            <Option value="father">Cha</Option>
                            <Option value="mother">Mẹ</Option>
                            <Option value="spouse">Vợ/Chồng</Option>
                            <Option value="child">Con</Option>
                            <Option value="grandparent">Ông/Bà</Option>
                            <Option value="other">Khác</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại!",
                            },
                            {
                              pattern: /^[0-9]{10}$/,
                              message: "Số điện thoại không hợp lệ!",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item
                          label="Địa chỉ"
                          name="address"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập địa chỉ!",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        <Form.Item
                          label="Ghi chú dị ứng"
                          name="allergyNotes"
                          rules={[
                            {
                              max: 500,
                              message:
                                "Ghi chú dị ứng không được vượt quá 500 ký tự!",
                            },
                          ]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Nhập thông tin dị ứng, tiền sử dị ứng thuốc, thức ăn (nếu có)"
                            maxLength={500}
                            showCount
                          />
                        </Form.Item>

                        <Form.Item
                          label="Tiền sử bệnh mạn tính"
                          name="medicalHistory"
                          tooltip="Nhập các bệnh mạn tính, ví dụ: Tiểu đường, Cao huyết áp, Hen suyễn..."
                        >
                          <Select
                            mode="tags"
                            placeholder="Nhập bệnh mạn tính (có thể nhập nhiều, nhấn Enter sau mỗi bệnh)"
                            style={{ width: "100%" }}
                            tokenSeparators={[","]}
                            allowClear
                          />
                        </Form.Item>

                        <Form.Item
                          name="agreement"
                          valuePropName="checked"
                          rules={[
                            {
                              required: true,
                              message:
                                "Vui lòng xác nhận chịu trách nhiệm về thông tin cung cấp!",
                            },
                          ]}
                        >
                          <Checkbox>
                            Người đặt hộ chịu trách nhiệm về thông tin cung cấp
                          </Checkbox>
                        </Form.Item>
                      </div>
                    )}

                    {/* Mode Selection */}
                    <Form.Item
                      name="mode"
                      label="Hình thức khám"
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
