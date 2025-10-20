import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Button, Space } from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import NavigationBreadcrumb from "../../components/Breadcrumb/NavigationBreadcrumb";

const { Title, Text, Paragraph } = Typography;

const AppointmentBookingHome = () => {
  const navigate = useNavigate();

  const handleStartBooking = () => {
    navigate("/dat-lich/chon-chuyen-khoa");
  };

  const steps = [
    {
      icon: <MedicineBoxOutlined />,
      title: "Chọn chuyên khoa",
      description: "Chọn chuyên khoa phù hợp với tình trạng sức khỏe của bạn",
      step: 1,
    },
    {
      icon: <UserOutlined />,
      title: "Chọn bác sĩ",
      description: "Xem danh sách bác sĩ chuyên khoa và chọn bác sĩ phù hợp",
      step: 2,
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Chọn thời gian",
      description: "Chọn ngày và giờ khám phù hợp với lịch trình của bạn",
      step: 3,
    },
    {
      icon: <CalendarOutlined />,
      title: "Xác nhận đặt lịch",
      description: "Điền thông tin và xác nhận đặt lịch khám",
      step: 4,
    },
  ];

  return (
    <div className="appointment-booking-home">
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
            },
          ]}
        />

        {/* Header */}
        <div className="page-header">
          <Title level={1}>Đặt lịch khám</Title>
          <Paragraph className="header-description">
            Đặt lịch khám với các bác sĩ chuyên khoa uy tín một cách dễ dàng và
            nhanh chóng
          </Paragraph>
        </div>

        {/* Main CTA */}
        <div className="main-cta-section">
          <Card className="main-cta-card">
            <div className="cta-content">
              <div className="cta-icon">
                <CalendarOutlined />
              </div>
              <div className="cta-text">
                <Title level={2}>Bắt đầu đặt lịch khám</Title>
                <Paragraph>
                  Chọn chuyên khoa, bác sĩ và thời gian phù hợp với bạn
                </Paragraph>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleStartBooking}
                className="cta-button"
              >
                Đặt lịch ngay
              </Button>
            </div>
          </Card>
        </div>

        {/* Steps */}
        <div className="steps-section">
          <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
            Quy trình đặt lịch
          </Title>
          <Row gutter={[24, 24]}>
            {steps.map((step, index) => (
              <Col xs={24} sm={12} lg={6} key={step.step}>
                <Card className="step-card" hoverable>
                  <div className="step-content">
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-number">Bước {step.step}</div>
                    <Title level={4} className="step-title">
                      {step.title}
                    </Title>
                    <Paragraph className="step-description">
                      {step.description}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Features */}
        <div className="features-section">
          <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
            Tại sao chọn dịch vụ của chúng tôi?
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="feature-card">
                <div className="feature-icon">
                  <UserOutlined />
                </div>
                <Title level={4}>Bác sĩ uy tín</Title>
                <Paragraph>
                  Đội ngũ bác sĩ chuyên khoa có kinh nghiệm và được xác minh
                  chất lượng
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="feature-card">
                <div className="feature-icon">
                  <ClockCircleOutlined />
                </div>
                <Title level={4}>Linh hoạt thời gian</Title>
                <Paragraph>
                  Chọn thời gian khám phù hợp với lịch trình cá nhân của bạn
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="feature-card">
                <div className="feature-icon">
                  <MedicineBoxOutlined />
                </div>
                <Title level={4}>Đa dạng chuyên khoa</Title>
                <Paragraph>
                  Nhiều chuyên khoa khác nhau để đáp ứng nhu cầu khám chữa bệnh
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <Card>
            <Title level={3}>Cần hỗ trợ?</Title>
            <Space direction="vertical" size="middle">
              <div>
                <Text strong>Hotline:</Text> 1900 1234
              </div>
              <div>
                <Text strong>Email:</Text> support@medconnect.com
              </div>
              <div>
                <Text strong>Thời gian hỗ trợ:</Text> 8:00 - 22:00 (Hàng ngày)
              </div>
            </Space>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .appointment-booking-home {
          padding: 24px 0;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .header-description {
          font-size: 18px;
          color: #8c8c8c;
          max-width: 600px;
          margin: 0 auto;
        }

        .main-cta-section {
          margin-bottom: 64px;
        }

        .main-cta-card {
          background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
          border: none;
          color: white;
        }

        .cta-content {
          display: flex;
          align-items: center;
          gap: 24px;
          text-align: center;
        }

        .cta-icon {
          font-size: 64px;
          opacity: 0.9;
        }

        .cta-text {
          flex: 1;
        }

        .cta-text h2,
        .cta-text p {
          color: white !important;
          margin-bottom: 16px;
        }

        .cta-button {
          height: 50px;
          padding: 0 32px;
          font-size: 16px;
          font-weight: 600;
        }

        .steps-section {
          margin-bottom: 64px;
        }

        .step-card {
          height: 100%;
          text-align: center;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .step-content {
          padding: 16px;
        }

        .step-icon {
          font-size: 48px;
          color: #1890ff;
          margin-bottom: 16px;
        }

        .step-number {
          color: #1890ff;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .step-title {
          margin-bottom: 12px !important;
        }

        .step-description {
          color: #8c8c8c;
          margin-bottom: 0 !important;
        }

        .features-section {
          margin-bottom: 64px;
        }

        .feature-card {
          height: 100%;
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .feature-icon {
          font-size: 40px;
          color: #52c41a;
          margin-bottom: 16px;
        }

        .feature-card h4 {
          margin-bottom: 12px !important;
        }

        .feature-card p {
          color: #8c8c8c;
          margin-bottom: 0 !important;
        }

        .help-section {
          text-align: center;
        }

        @media (max-width: 768px) {
          .cta-content {
            flex-direction: column;
            gap: 16px;
          }

          .cta-icon {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentBookingHome;
