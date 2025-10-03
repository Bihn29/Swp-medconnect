import "./DefaultLayout.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
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
              <li>
                <Link to="/about">Về chúng tôi</Link>
              </li>
              <li>
                <Link to="/doctors">Danh sách bác sĩ</Link>
              </li>
              <li>
                <Link to="/specializations">Chuyên khoa</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>
                <Link to="/help">Trung tâm trợ giúp</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
              <li>
                <Link to="/privacy">Chính sách bảo mật</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>1900-1234</p>
            <p>support@medconnect.vn</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 MedConnect. Tất cả quyền được bảo lưu.</p>
          <p>Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
