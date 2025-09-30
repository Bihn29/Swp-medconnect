import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log(`Searching for ${searchType}: ${searchTerm}`);
  };

  const specializations = [
    'Tim mạch', 'Da liễu', 'Nhi khoa', 'Sản phụ khoa', 
    'Thần kinh', 'Tiêu hóa', 'Hô hấp', 'Xương khớp'
  ];

  const features = [
    {
      icon: '���',
      title: 'Tìm bác sĩ uy tín',
      description: 'Tìm kiếm bác sĩ theo chuyên khoa, tên hoặc địa điểm gần bạn'
    },
    {
      icon: '���',
      title: 'Đặt lịch trực tuyến',
      description: 'Đặt lịch khám trực tiếp hoặc tư vấn video call một cách dễ dàng'
    },
    {
      icon: '���',
      title: 'Thanh toán an toàn',
      description: 'Thanh toán trực tuyến qua VietQR, VNPAY, MoMo với bảo mật cao'
    },
    {
      icon: '���',
      title: 'Quản lý hồ sơ',
      description: 'Lưu trữ lịch sử khám bệnh và đơn thuốc điện tử một cách tiện lợi'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Tìm kiếm bác sĩ',
      description: 'Sử dụng thanh tìm kiếm để tìm bác sĩ phù hợp với nhu cầu của bạn'
    },
    {
      step: '02',
      title: 'Đặt lịch hẹn',
      description: 'Chọn thời gian phù hợp và xác nhận đặt lịch khám'
    },
    {
      step: '03',
      title: 'Thanh toán',
      description: 'Thanh toán phí tư vấn để xác nhận lịch hẹn'
    },
    {
      step: '04',
      title: 'Tham gia tư vấn',
      description: 'Tham gia buổi tư vấn trực tiếp hoặc qua video call'
    }
  ];

  return (
    <div className="homepage">
      {/* Header Section */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">
              <h2>MedConnect</h2>
            </div>
            <div className="nav-links">
              <Link to="/login" className="nav-link">Đăng nhập</Link>
              <Link to="/register" className="nav-link btn-primary">Đăng ký</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              MedConnect: Nền tảng <span className="highlight">Tư vấn Y tế</span> & 
              <span className="highlight"> Đặt lịch khám</span> trực tuyến
            </h1>
            <p className="hero-subtitle">
              Kết nối bạn với các bác sĩ uy tín, đặt lịch khám dễ dàng và nhận tư vấn 
              chất lượng ngay tại nhà thông qua video call bảo mật.
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
                  placeholder={`Tìm kiếm theo ${searchType === 'name' ? 'tên bác sĩ' : searchType === 'specialization' ? 'chuyên khoa' : 'địa điểm'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  ��� Tìm kiếm
                </button>
              </form>
            </div>

            {/* Quick Specializations */}
            <div className="quick-specializations">
              <p>Chuyên khoa phổ biến:</p>
              <div className="specialization-tags">
                {specializations.map((spec, index) => (
                  <button key={index} className="spec-tag">
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Tại sao chọn MedConnect?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Cách thức hoạt động</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Bắt đầu chăm sóc sức khỏe của bạn ngay hôm nay!</h2>
            <p>Đăng ký tài khoản miễn phí để trải nghiệm dịch vụ tư vấn y tế chất lượng cao.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary large">
                Đăng ký ngay
              </Link>
              <Link to="/login" className="btn btn-secondary large">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>MedConnect</h3>
              <p>Nền tảng kết nối bác sĩ và bệnh nhân hàng đầu Việt Nam</p>
            </div>
            <div className="footer-section">
              <h4>Liên kết</h4>
              <ul>
                <li><Link to="/about">Về chúng tôi</Link></li>
                <li><Link to="/doctors">Danh sách bác sĩ</Link></li>
                <li><Link to="/specializations">Chuyên khoa</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><Link to="/help">Trung tâm trợ giúp</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
                <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Liên hệ</h4>
              <p>��� 1900-1234</p>
              <p>��� support@medconnect.vn</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 MedConnect. Tất cả quyền được bảo lưu.</p>
            <p>Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
