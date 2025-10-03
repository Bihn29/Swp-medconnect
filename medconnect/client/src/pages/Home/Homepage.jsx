import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";

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
      icon: "",
      title: "Tìm bác sĩ uy tín",
      description:
        "Tìm kiếm bác sĩ theo chuyên khoa, tên hoặc địa điểm gần bạn",
    },
    {
      icon: "",
      title: "Đặt lịch trực tuyến",
      description:
        "Đặt lịch khám trực tiếp hoặc tư vấn video call một cách dễ dàng",
    },
    {
      icon: "",
      title: "Thanh toán an toàn",
      description:
        "Thanh toán trực tuyến qua VietQR, VNPAY, MoMo với bảo mật cao",
    },
    {
      icon: "",
      title: "Quản lý hồ sơ",
      description:
        "Lưu trữ lịch sử khám bệnh và đơn thuốc điện tử một cách tiện lợi",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Tìm kiếm bác sĩ",
      description:
        "Sử dụng thanh tìm kiếm để tìm bác sĩ phù hợp với nhu cầu của bạn",
    },
    {
      step: "02",
      title: "Đặt lịch hẹn",
      description: "Chọn thời gian phù hợp và xác nhận đặt lịch khám",
    },
    {
      step: "03",
      title: "Thanh toán",
      description: "Thanh toán phí tư vấn để xác nhận lịch hẹn",
    },
    {
      step: "04",
      title: "Tham gia tư vấn",
      description: "Tham gia buổi tư vấn trực tiếp hoặc qua video call",
    },
  ];

  return (
    <div className="homepage">
      {/* Header local removed – dùng Header toàn cục từ DefaultLayout */}

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              MedConnect: Nền tảng{" "}
              <span className="highlight">Tư vấn Y tế</span> &
              <span className="highlight"> Đặt lịch khám</span> trực tuyến
            </h1>
            <p className="hero-subtitle">
              Kết nối bạn với các bác sĩ uy tín, đặt lịch khám dễ dàng và nhận
              tư vấn chất lượng ngay tại nhà thông qua video call bảo mật.
            </p>

            {/* Search Bar */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-type-selector">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-select"
                  >
                    <option value="name">Tên bác sĩ</option>
                    <option value="specialization">Chuyên khoa</option>
                    <option value="location">Địa điểm</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder={`Tìm kiếm theo ${
                    searchType === "name"
                      ? "tên bác sĩ"
                      : searchType === "specialization"
                      ? "chuyên khoa"
                      : "địa điểm"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  Tìm kiếm
                </button>
              </form>
            </div>

            {/* Quick Specializations */}
            <div className="quick-specializations">
              <p>Chuyên khoa phổ biến:</p>
              <div className="specialization-tags">
                {specializations.map((spec, i) => (
                  <button key={i} className="spec-tag">
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Tại sao chọn MedConnect?</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Cách thức hoạt động</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{s.step}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-description">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Bắt đầu chăm sóc sức khỏe của bạn ngay hôm nay!</h2>
            <p>
              Đăng ký tài khoản miễn phí để trải nghiệm dịch vụ tư vấn y tế chất
              lượng cao.
            </p>
            <div className="cta-buttons">
              <Link to="/doctors" className="btn btn-primary large">
                Tìm bác sĩ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer removed here – dùng Footer từ DefaultLayout để tránh trùng lặp */}
    </div>
  );
};

export default Homepage;
