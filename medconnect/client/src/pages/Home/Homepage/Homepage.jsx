import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Select, Card, Row, Col, Typography, Steps } from "antd";
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
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Homepage.css";

const { Title, Paragraph } = Typography;

const Homepage = () => {
  const navigate = useNavigate();

  // ---- Custom arrow components for react-slick ----
  const SampleNextArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        className="slick-arrow slick-next"
        onClick={onClick}
        style={{
          right: "15px",
          zIndex: 2,
          color: "#45c3d2",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        <RightOutlined />
      </div>
    );
  };

  const SamplePrevArrow = (props) => {
    const { onClick } = props;
    return (
      <div
        className="slick-arrow slick-prev"
        onClick={onClick}
        style={{
          left: "15px",
          zIndex: 2,
          color: "#45c3d2",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        <LeftOutlined />
      </div>
    );
  };

  // ---- Slider settings ----
  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  // ---- Feature data ----
  const features = [
    {
      icon: <HeartOutlined style={{ fontSize: "48px", color: "#45c3d2" }} />,
      title: "Tìm bác sĩ uy tín",
      description:
        "Tìm kiếm bác sĩ theo chuyên khoa, tên hoặc địa điểm gần bạn",
      link: "/bac-si  ",
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

  // ---- Step guide ----
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

  // ---- Specialty list ----
  const specialties = [
    {
      id: "orthopedic",
      title: "Cơ Xương Khớp",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145826-coxuongkhop.png",
    },
    {
      id: "neurology",
      title: "Thần kinh",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145827-thankinh.png",
    },
    {
      id: "digestive",
      title: "Tiêu hóa",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145828-tieuhoa.png",
    },
    {
      id: "otolaryngology",
      title: "Tai Mũi Họng",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145829-taimuihong.png",
    },
    {
      id: "cardiology",
      title: "Tim mạch",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145830-timmach.png",
    },
    {
      id: "dermatology",
      title: "Da liễu",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145831-dalie.png",
    },
    {
      id: "pediatrics",
      title: "Nhi khoa",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145832-nhikhoa.png",
    },
    {
      id: "dentistry",
      title: "Nha khoa",
      icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145833-nhakhoa.png",
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <Row justify="center" align="middle" style={{ minHeight: "350px" }}>
            <Col xs={24} lg={20} style={{ textAlign: "center" }}>
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

              <Input
                placeholder="Tìm bệnh viện"
                size="large"
                prefix={<SearchOutlined style={{ color: "#45c3d2" }} />}
                onClick={() => navigate("/tim-kiem")}
                readOnly
                style={{
                  borderRadius: "25px",
                  width: "100%",
                  maxWidth: "1500px",
                  height: "55px",
                  margin: "0 auto",
                  fontSize: "16px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* Recommendation Section */}
      <section style={{ padding: "80px 0", background: "white" }}>
        <div className="container">
          <Title level={2} style={{ marginBottom: "40px" }}>
            Dành cho bạn
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} md={8}>
              <Link to="/bac-si">
                <Card
                  hoverable
                  bordered={false}
                  style={{ textAlign: "center" }}
                >
                  <img
                    src="https://cdn.bookingcare.vn/fo/w1920/2023/12/28/152447-bac-si.png"
                    alt="Bác sĩ"
                    style={{
                      borderRadius: "50%",
                      width: "220px",
                      height: "220px",
                      objectFit: "cover",
                      marginBottom: "20px",
                    }}
                  />
                  <Title level={4}>Bác sĩ</Title>
                </Card>
              </Link>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Link to="/chuyen-khoa">
                <Card
                  hoverable
                  bordered={false}
                  style={{ textAlign: "center" }}
                >
                  <img
                    src="https://cdn.bookingcare.vn/fo/w1920/2023/12/28/152612-chuyen-khoa.png"
                    alt="Chuyên khoa"
                    style={{
                      borderRadius: "50%",
                      width: "220px",
                      height: "220px",
                      objectFit: "cover",
                      marginBottom: "20px",
                    }}
                  />
                  <Title level={4}>Chuyên khoa</Title>
                </Card>
              </Link>
            </Col>
          </Row>
        </div>
      </section>

      {/* Comprehensive Services */}
      <section style={{ padding: "80px 0", background: "#f9fafb" }}>
        <div className="container">
          <Title level={2} style={{ marginBottom: "50px" }}>
            Dịch vụ toàn diện
          </Title>

          <Row gutter={[24, 24]}>
            {[
              {
                title: "Khám Chuyên khoa",
                icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145510-chuyenkhoa.png",
              },
              {
                title: "Khám từ xa",
                icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145511-khamtuxa.png",
              },
              {
                title: "Khám tổng quát",
                icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145512-khamtongquat.png",
              },
              {
                title: "Xét nghiệm y học",
                icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145513-xetnghiemyhoc.png",
              },
              {
                title: "Sức khỏe tinh thần",
                icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145514-tinhthan.png",
              },
              {
                title: "Khám nha khoa",
                icon: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/145515-nhakhoa.png",
              },
            ].map((service, index) => (
              <Col xs={24} sm={12} md={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "20px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                  }}
                  bodyStyle={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "20px 24px",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      flexShrink: 0,
                      background: "#fff9e6",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={service.icon}
                      alt={service.title}
                      style={{ width: "36px", height: "36px" }}
                    />
                  </div>
                  <Title level={4} style={{ margin: 0 }}>
                    {service.title}
                  </Title>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Specialties Section */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "40px" }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Chuyên khoa
            </Title>
            <Link
              to="/chuyen-khoa"
              style={{
                background: "#c8f3f3",
                padding: "8px 20px",
                borderRadius: "12px",
                color: "#007f7f",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Xem thêm
            </Link>
          </Row>

          <Slider {...sliderSettings}>
            {specialties.map((specialty, index) => (
              <div key={index} style={{ padding: "0 12px" }}>
                <Card
                  hoverable
                  onClick={() => navigate(`/specialties/${specialty.id}`)}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                    cursor: "pointer",
                    height: "100%",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                  }}
                  bodyStyle={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={specialty.icon}
                    alt={specialty.title}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "contain",
                      marginBottom: "16px",
                    }}
                  />
                  <Title level={4} style={{ margin: 0, color: "#333" }}>
                    {specialty.title}
                  </Title>
                </Card>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Medical Facilities Section */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "40px" }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Cơ sở y tế
            </Title>
            <Link
              to="/co-so-y-te"
              style={{
                background: "#c8f3f3",
                padding: "8px 20px",
                borderRadius: "12px",
                color: "#007f7f",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Xem thêm
            </Link>
          </Row>

          <Slider {...sliderSettings}>
            {[
              {
                id: "vietduc",
                name: "Bệnh viện Hữu nghị Việt Đức",
                logo: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151122-viet-duc.png",
              },
              {
                id: "choray",
                name: "Bệnh viện Chợ Rẫy",
                logo: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151123-cho-ray.png",
              },
              {
                id: "doctorcheck",
                name: "Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn",
                logo: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151124-doctor-check.png",
              },
              {
                id: "vinmec",
                name: "Bệnh viện Đa khoa Quốc tế Vinmec",
                logo: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151125-vinmec.png",
              },
              {
                id: "tamduc",
                name: "Bệnh viện Tâm Đức",
                logo: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151126-tam-duc.png",
              },
              {
                id: "hunggvuong",
                name: "Bệnh viện Hùng Vương",
                logo: "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151127-hung-vuong.png",
              },
            ].map((facility, index) => (
              <div key={index} style={{ padding: "0 12px" }}>
                <Card
                  hoverable
                  onClick={() => navigate(`/hospitals/${facility.id}`)}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                    cursor: "pointer",
                    height: "100%",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                  }}
                  bodyStyle={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={facility.logo}
                    alt={facility.name}
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "contain",
                      marginBottom: "16px",
                    }}
                  />
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: "#333",
                      fontWeight: 500,
                      fontSize: "1.05rem",
                    }}
                  >
                    {facility.name}
                  </Title>
                </Card>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Promotion Section */}
      <section style={{ padding: "80px 0", background: "#f9fafb" }}>
        <div className="container">
          <Title
            level={2}
            style={{
              textAlign: "left",
              marginBottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            Ưu đãi HOT trong tháng
            <img
              src="https://cdn-icons-png.flaticon.com/512/616/616554.png"
              alt="Hot"
              style={{ width: "28px", height: "28px" }}
            />
          </Title>

          <Slider
            {...{
              dots: true,
              infinite: true,
              autoplay: true,
              autoplaySpeed: 4000,
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: false,
              pauseOnHover: true,
            }}
          >
            {[
              {
                id: 1,
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2024/08/01/144053-uu-dai-medlatec.png",
                link: "/promotions/medlatec",
              },
              {
                id: 2,
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2024/07/01/145311-uu-dai-da-lieu.png",
                link: "/promotions/dermatology",
              },
              {
                id: 3,
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2024/06/01/145312-uu-dai-vinmec.png",
                link: "/promotions/vinmec",
              },
              {
                id: 4,
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2024/05/01/145313-uu-dai-nha-khoa.png",
                link: "/promotions/dental",
              },
              {
                id: 5,
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2024/04/01/145314-uu-dai-tam-soat.png",
                link: "/promotions/checkup",
              },
            ].map((promo) => (
              <div key={promo.id} style={{ textAlign: "center" }}>
                <Link to={promo.link}>
                  <img
                    src={promo.image}
                    alt={`Ưu đãi ${promo.id}`}
                    style={{
                      width: "100%",
                      maxWidth: "1200px",
                      height: "auto",
                      borderRadius: "16px",
                      margin: "0 auto",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                    }}
                  />
                </Link>
              </div>
            ))}
          </Slider>
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

      {/* Featured Doctors Section */}
      <section style={{ padding: "80px 0", background: "#45c3d2" }}>
        <div className="container">
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "40px" }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Bác sĩ nổi bật
            </Title>
            <Link
              to="/bac-si"
              style={{
                background: "#c8f3f3",
                padding: "8px 20px",
                borderRadius: "12px",
                color: "#007f7f",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Xem thêm
            </Link>
          </Row>

          <Slider
            {...{
              dots: false,
              infinite: true,
              slidesToShow: 4,
              slidesToScroll: 1,
              arrows: true,
              autoplay: true,
              autoplaySpeed: 5000,
              centerMode: false,
              variableWidth: false,
              nextArrow: <SampleNextArrow />,
              prevArrow: <SamplePrevArrow />,
              responsive: [
                {
                  breakpoint: 992,
                  settings: { slidesToShow: 2, slidesToScroll: 1 },
                },
                {
                  breakpoint: 576,
                  settings: { slidesToShow: 1, slidesToScroll: 1 },
                },
              ],
            }}
          >
            {[
              {
                id: "doctor1",
                name: 'Gói Khám "Bác Sĩ Khuyến Cáo" (DC2)',
                specialty: "Khám tổng quát, Cơ bản, Nam, Nữ",
                image:
                  "https://cdn.bookingcare.vn/fr/w384/2023/08/10/095118-goi-kham-bac-si-khuyen-cao.jpg",
              },
              {
                id: "doctor2",
                name: "Phó Giáo sư, Tiến sĩ, Bác sĩ Nguyễn Thị Hoài An",
                specialty: "Tai Mũi Họng, Nhi khoa",
                image:
                  "https://cdn.bookingcare.vn/fr/w384/2023/08/10/095154-ps-nguyen-thi-hoai-an.jpg",
              },
              {
                id: "doctor3",
                name: "Bác sĩ Chuyên khoa II Võ Văn Mẫn",
                specialty: "Cơ Xương Khớp, Chấn thương chỉnh hình",
                image:
                  "https://cdn.bookingcare.vn/fr/w384/2023/08/10/095214-bs-vo-van-man.jpg",
              },
              {
                id: "doctor4",
                name: "Phó Giáo sư, Tiến sĩ Kiều Đình Hùng",
                specialty: "Thần kinh, Cột sống, Ngoại thần kinh",
                image:
                  "https://cdn.bookingcare.vn/fr/w384/2023/08/10/095247-pgs-kieu-dinh-hung.jpg",
              },
              {
                id: "doctor5",
                name: "Phó Giáo sư, Tiến sĩ, Bác sĩ Nguyễn Văn A",
                specialty: "Tim mạch, Nội tổng quát",
                image:
                  "https://cdn.bookingcare.vn/fr/w384/2023/08/10/095300-bs-nguyen-van-a.jpg",
              },
            ].map((doctor, index) => (
              <div key={index} className="doctor-card">
                <Card
                  hoverable
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                  style={{
                    borderRadius: "16px",
                    border: "none",
                    textAlign: "center",
                    background: "#ffffff",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                    height: "380px", // ✅ đảm bảo chiều cao bằng nhau
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginBottom: "16px",
                    }}
                  />
                  <Title
                    level={4}
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#222",
                      marginBottom: "8px",
                    }}
                  >
                    {doctor.name}
                  </Title>
                  <Paragraph
                    style={{
                      fontSize: "0.95rem",
                      color: "#666",
                      margin: 0,
                    }}
                  >
                    {doctor.specialty}
                  </Paragraph>
                </Card>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Telemedicine Section */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "40px" }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Khám từ xa
            </Title>
            <Link
              to="/kham-tai-nha"
              style={{
                background: "#c8f3f3",
                padding: "8px 20px",
                borderRadius: "12px",
                color: "#007f7f",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Xem thêm
            </Link>
          </Row>

          <Slider
            {...{
              dots: false,
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 1,
              arrows: true,
              autoplay: true,
              autoplaySpeed: 4500,
              nextArrow: <SampleNextArrow />,
              prevArrow: <SamplePrevArrow />,
              responsive: [
                {
                  breakpoint: 992,
                  settings: { slidesToShow: 2, slidesToScroll: 1 },
                },
                {
                  breakpoint: 576,
                  settings: { slidesToShow: 1, slidesToScroll: 1 },
                },
              ],
            }}
          >
            {[
              {
                id: "psychology",
                title: "Tư vấn, trị liệu Tâm lý từ xa",
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/150951-tamly.png",
              },
              {
                id: "mental",
                title: "Sức khỏe tâm thần từ xa",
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151029-tamthan.png",
              },
              {
                id: "dermatology",
                title: "Bác sĩ Da liễu từ xa",
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151046-dalieu.png",
              },
              {
                id: "pediatric",
                title: "Bác sĩ Nhi khoa từ xa",
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151101-nhikhoa.png",
              },
              {
                id: "internal",
                title: "Khám Nội tổng quát từ xa",
                image:
                  "https://cdn.bookingcare.vn/fo/w1920/2023/12/28/151115-noitongquat.png",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="telemedicine-card"
                style={{ padding: "0 12px" }}
              >
                <Card
                  hoverable
                  onClick={() => navigate(`/telemedicine/${service.id}`)}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                    background: "#ffffff",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                    height: "330px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  bodyStyle={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: "200px",
                      height: "160px",
                      objectFit: "contain",
                      marginBottom: "16px",
                    }}
                  />
                  <Title
                    level={4}
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "#222",
                      marginBottom: "8px",
                    }}
                  >
                    {service.title}
                  </Title>
                </Card>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
