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
  Tag,
  Steps,
  Divider,
} from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  CalendarOutlined,
  SafetyOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  VideoCameraOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "./Homepage.css";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Homepage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for ${searchType}: ${searchTerm}`);
  };

  const specializations = [
    "Tim mạch",
    "Da liễu",
    "Nhi khoa",
    "Sản phụ khoa",
    "Thần kinh",
    "Tiêu hóa",
    "Hô hấp",
    "Xương khớp",
  ];

  const features = [
    {
      icon: <HeartOutlined style={{ fontSize: "48px", color: "#45c3d2" }} />,
      title: "Tìm bác sĩ uy tín",
      description:
        "Tìm kiếm bác sĩ theo chuyên khoa, tên hoặc địa điểm gần bạn",
      link: "/doctors",
    },
    {
      icon: <HomeOutlined style={{ fontSize: "48px", color: "#45c3d2" }} />,
      title: "Khám tại nhà",
      description: "Dịch vụ y tế chuyên nghiệp đến tận nhà - An toàn, tiện lợi",
      link: "/kham-tai-nha",
    },
    {
      icon: <CalendarOutlined style={{ fontSize: "48px", color: "#45c3d2" }} />,
      title: "Đặt lịch trực tuyến",
      description:
        "Đặt lịch khám trực tiếp hoặc tư vấn video call một cách dễ dàng",
      link: "/booking",
    },
    {
      icon: <SafetyOutlined style={{ fontSize: "48px", color: "#45c3d2" }} />,
      title: "Thanh toán an toàn",
      description:
        "Thanh toán trực tuyến qua VietQR, VNPAY, MoMo với bảo mật cao",
      link: "/payment",
    },
  ];

  const steps = [
    {
      title: "Tìm kiếm bác sĩ",
      description:
        "Sử dụng thanh tìm kiếm để tìm bác sĩ phù hợp với nhu cầu của bạn",
      icon: <UserOutlined />,
    },
    {
      title: "Đặt lịch hẹn",
      description: "Chọn thời gian phù hợp và xác nhận đặt lịch khám",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "Thanh toán",
      description: "Thanh toán phí tư vấn để xác nhận lịch hẹn",
      icon: <CreditCardOutlined />,
    },
    {
      title: "Tham gia tư vấn",
      description: "Tham gia buổi tư vấn trực tiếp hoặc qua video call",
      icon: <VideoCameraOutlined />,
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <Row justify="center" align="middle" style={{ minHeight: "500px" }}>
            <Col xs={24} lg={16} style={{ textAlign: "center" }}>
              <Title
                level={1}
                style={{
                  color: "white",
                  fontSize: "2.5rem",
                  marginBottom: "24px",
                  fontWeight: 700,
                }}
              >
                MedConnect: Nền tảng{" "}
                <span style={{ color: "#ffbf00" }}>Tư vấn Y tế</span> &{" "}
                <span style={{ color: "#ffbf00" }}>Đặt lịch khám</span> trực
                tuyến
              </Title>

              <Paragraph
                style={{
                  color: "white",
                  fontSize: "1.1rem",
                  marginBottom: "40px",
                  opacity: 0.95,
                }}
              >
                Kết nối bạn với các bác sĩ uy tín, đặt lịch khám dễ dàng và nhận
                tư vấn chất lượng ngay tại nhà thông qua video call bảo mật.
              </Paragraph>

              {/* Search Section */}
              <Card
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Space.Compact className="search-box" style={{ width: "100%" }}>
                  <Select
                    value={searchType}
                    onChange={setSearchType}
                    style={{ width: 160 }}
                    size="large"
                  >
                    <Option value="name">Tên bác sĩ</Option>
                    <Option value="specialization">Chuyên khoa</Option>
                    <Option value="location">Địa điểm</Option>
                  </Select>

                  <Input
                    placeholder={`Tìm kiếm theo ${
                      searchType === "name"
                        ? "tên bác sĩ"
                        : searchType === "specialization"
                        ? "chuyên khoa"
                        : "địa điểm"
                    }...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="large"
                  />

                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    size="large"
                    onClick={handleSearch}
                  >
                    Tìm kiếm
                  </Button>
                </Space.Compact>

                {/* Quick Specializations */}
                <div style={{ marginTop: "20px", textAlign: "left" }}>
                  <Paragraph style={{ marginBottom: "12px", color: "#666" }}>
                    Chuyên khoa phổ biến:
                  </Paragraph>
                  <Space wrap>
                    {specializations.map((spec, i) => (
                      <Tag
                        key={i}
                        style={{
                          cursor: "pointer",
                          borderRadius: "20px",
                          padding: "4px 12px",
                          border: "1px solid #45c3d2",
                          color: "#45c3d2",
                        }}
                        onClick={() => setSearchTerm(spec)}
                      >
                        {spec}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 0", background: "#f8f9fa" }}>
        <div className="container">
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            Tại sao chọn MedConnect?
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Link to={feature.link} style={{ textDecoration: "none" }}>
                  <Card
                    hoverable
                    style={{
                      textAlign: "center",
                      height: "100%",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    }}
                    bodyStyle={{ padding: "40px 20px" }}
                  >
                    <div style={{ marginBottom: "20px" }}>{feature.icon}</div>
                    <Title
                      level={4}
                      style={{ marginBottom: "16px", color: "#333" }}
                    >
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: "#666", margin: 0 }}>
                      {feature.description}
                    </Paragraph>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* How it works Section */}
      <section style={{ padding: "80px 0", background: "white" }}>
        <div className="container">
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            Cách thức hoạt động
          </Title>
          <Row justify="center">
            <Col xs={24} lg={20}>
              <Steps
                direction="horizontal"
                current={-1}
                items={steps}
                responsive={false}
                style={{ marginBottom: "40px" }}
              />
              <Row gutter={[24, 24]} style={{ marginTop: "40px" }}>
                {steps.map((step, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card
                      style={{
                        textAlign: "center",
                        background: "#f8f9fa",
                        border: "none",
                      }}
                    >
                      <Title level={4} style={{ color: "#45c3d2" }}>
                        {step.title}
                      </Title>
                      <Paragraph style={{ color: "#666", margin: 0 }}>
                        {step.description}
                      </Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <Row justify="center" align="middle" style={{ minHeight: "300px" }}>
            <Col xs={24} lg={16} style={{ textAlign: "center" }}>
              <Title level={2} style={{ color: "white", marginBottom: "16px" }}>
                Bắt đầu chăm sóc sức khỏe của bạn ngay hôm nay!
              </Title>
              <Paragraph
                style={{
                  color: "white",
                  fontSize: "1.1rem",
                  marginBottom: "32px",
                  opacity: 0.9,
                }}
              >
                Đăng ký tài khoản miễn phí để trải nghiệm dịch vụ tư vấn y tế
                chất lượng cao.
              </Paragraph>
              <Button
                type="primary"
                size="large"
                style={{
                  background: "white",
                  borderColor: "white",
                  color: "#45c3d2",
                  fontWeight: 600,
                  height: "50px",
                  padding: "0 40px",
                  fontSize: "16px",
                }}
              >
                <Link to="/doctors" style={{ color: "#45c3d2" }}>
                  Tìm bác sĩ ngay
                </Link>
              </Button>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
