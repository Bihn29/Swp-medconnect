import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Modal,
  Alert,
  Form,
  DatePicker,
  TimePicker,
  Checkbox,
  Avatar,
  Badge,
} from "antd";
import {
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  StarOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  HistoryOutlined,
  BankOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./HospitalVisit.css";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const HospitalVisit = () => {
  const [selectedService, setSelectedService] = useState("consultation");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookingForm] = Form.useForm();

  // Các gói dịch vụ khám tại viện
  const services = [
    {
      id: "consultation",
      title: "Khám chuyên khoa",
      price: "400.000đ",
      duration: "30 phút",
      description: "Khám & tư vấn tại khoa chuyên môn trong bệnh viện",
      icon: <MedicineBoxOutlined style={{ fontSize: 24, color: "#45c3d2" }} />,
    },
    {
      id: "checkup",
      title: "Khám sức khỏe tổng quát",
      price: "900.000đ",
      duration: "60 phút",
      description: "Gói khám tổng quát tại viện bao gồm xét nghiệm cơ bản",
      icon: <HistoryOutlined style={{ fontSize: 24, color: "#45c3d2" }} />,
    },
    {
      id: "vip",
      title: "Khám VIP",
      price: "2.000.000đ",
      duration: "90 phút",
      description: "Phòng khám riêng, ưu tiên xếp lịch, hỗ trợ nhanh",
      icon: <BankOutlined style={{ fontSize: 24, color: "#faad14" }} />,
    },
  ];

  // Danh sách bác sĩ trong viện
  const doctors = [
    {
      id: 1,
      name: "BS. Nguyễn Văn A",
      specialty: "Nội tổng quát",
      experience: "20 năm",
      rating: 4.9,
      reviews: 210,
      avatar:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop&crop=face",
      price: "400.000đ",
      available: true,
      hospital: "Bệnh viện Bạch Mai",
    },
    {
      id: 2,
      name: "BS. Lê Thị B",
      specialty: "Tim mạch",
      experience: "12 năm",
      rating: 4.8,
      reviews: 180,
      avatar:
        "https://images.unsplash.com/photo-1594824476967-48c8b9642738?w=100&h=100&fit=crop&crop=face",
      price: "500.000đ",
      available: false,
      hospital: "Bệnh viện Việt Đức",
    },
  ];

  const handleServiceSelect = (serviceId) => setSelectedService(serviceId);
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalVisible(true);
  };

  const handleBooking = (values) => {
    console.log("Booking at hospital:", values);
    Modal.success({
      title: "Đặt lịch thành công!",
      content: "Thông tin đặt khám tại viện đã được tiếp nhận.",
    });
    setIsModalVisible(false);
    bookingForm.resetFields();
  };

  return (
    <div className="hospital-visit">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <Row justify="center" align="middle" style={{ minHeight: "400px" }}>
            <Col xs={24} lg={16} style={{ textAlign: "center" }}>
              <Title level={1} style={{ color: "white", fontSize: "2.5rem" }}>
                Đăng ký khám tại viện
              </Title>
              <Paragraph style={{ color: "white", fontSize: "1.2rem" }}>
                Đặt lịch khám trực tiếp tại bệnh viện nhanh chóng và tiện lợi
              </Paragraph>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<CalendarOutlined />}
                  style={{
                    background: "#ffbf00",
                    borderColor: "#ffbf00",
                    color: "#333",
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    document.getElementById("booking-section").scrollIntoView()
                  }
                >
                  Đặt lịch ngay
                </Button>
                <Button
                  size="large"
                  icon={<PhoneOutlined />}
                  style={{ borderColor: "white", color: "white" }}
                >
                  Hotline: 1900 2115
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: "80px 0", background: "white" }}>
        <div className="container">
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            Các gói dịch vụ tại viện
          </Title>
          <Row gutter={[24, 24]}>
            {services.map((service) => (
              <Col xs={24} sm={12} lg={8} key={service.id}>
                <Card
                  hoverable
                  onClick={() => handleServiceSelect(service.id)}
                  style={{
                    border:
                      selectedService === service.id
                        ? "2px solid #45c3d2"
                        : "1px solid #f0f0f0",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ marginBottom: 12 }}>{service.icon}</div>
                  <Title level={4}>{service.title}</Title>
                  <Text strong style={{ color: "#45c3d2", fontSize: 16 }}>
                    {service.price}
                  </Text>
                  <Paragraph>{service.description}</Paragraph>
                  {selectedService === service.id && (
                    <div>
                      <CheckCircleOutlined style={{ color: "#45c3d2" }} />{" "}
                      <Text style={{ color: "#45c3d2" }}>Đã chọn</Text>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Doctors Section */}
      <section
        id="booking-section"
        style={{ padding: "80px 0", background: "#f8f9fa" }}
      >
        <div className="container">
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            Đội ngũ bác sĩ tại viện
          </Title>
          <Row gutter={[24, 24]}>
            {doctors.map((doctor) => (
              <Col xs={24} sm={12} lg={8} key={doctor.id}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      type="primary"
                      block
                      disabled={!doctor.available}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      {doctor.available ? "Đặt lịch" : "Hết lịch"}
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Badge
                        dot
                        status={doctor.available ? "success" : "default"}
                      >
                        <Avatar size={64} src={doctor.avatar} />
                      </Badge>
                    }
                    title={doctor.name}
                    description={
                      <div>
                        <div>Chuyên khoa: {doctor.specialty}</div>
                        <div>Kinh nghiệm: {doctor.experience}</div>
                        <div>Bệnh viện: {doctor.hospital}</div>
                        <div>
                          <StarOutlined style={{ color: "#faad14" }} />{" "}
                          {doctor.rating} ({doctor.reviews} đánh giá)
                        </div>
                        <Text strong style={{ color: "#45c3d2" }}>
                          {doctor.price}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Booking Modal */}
      <Modal
        title="Đặt lịch khám tại viện"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedDoctor && (
          <Form form={bookingForm} layout="vertical" onFinish={handleBooking}>
            <Alert
              message={`Bạn đang đặt lịch với ${selectedDoctor.name}`}
              type="info"
              style={{ marginBottom: 20 }}
            />
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              name="date"
              label="Ngày khám"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="time"
              label="Giờ khám"
              rules={[{ required: true }]}
            >
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="symptoms" label="Triệu chứng">
              <TextArea
                rows={3}
                placeholder="Mô tả ngắn gọn tình trạng (không bắt buộc)"
              />
            </Form.Item>
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[{ required: true }]}
            >
              <Checkbox>Tôi đồng ý với điều khoản sử dụng</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác nhận đặt lịch
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default HospitalVisit;
