import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./DefaultLayout.scss";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation categories cho trang chủ
  const defaultCategories = [
    { key: "all", label: "Trang chủ", path: "/" },
    { key: "home", label: "Tại nhà", path: "/kham-tai-nha" },
    { key: "hospital", label: "Tại viện", path: "/kham-tai-vien" },
    { key: "about", label: "Giới thiệu", path: "/gioi-thieu" },
  ];

  // Navigation categories cho trang search
  const searchCategories = [
    { key: "specialty", label: "Chuyên khoa", path: "/tim-kiem?type=specialty" },
    { key: "facility", label: "Cơ sở y tế", path: "/tim-kiem?type=location" },
    { key: "doctor", label: "Bác sĩ", path: "/tim-kiem?type=doctor" },
    { key: "package", label: "Gói khám", path: "/tim-kiem?type=package" },
  ];

  // Chọn categories dựa trên trang hiện tại
  const isSearchPage = location.pathname === "/tim-kiem";
  const categories = isSearchPage ? searchCategories : defaultCategories;

  const [activeCat, setActiveCat] = useState("all");
  const [user, setUser] = useState(null);

  // Hiển thị search ở các trang này (không hiển thị ở trang search)
  const showSearch = ["/kham-tai-nha", "/kham-tai-vien"].includes(
    location.pathname
  );

  // ===== Placeholder tự đổi =====
  const placeholders = [
    "Tìm bác sĩ",
    "Tìm chuyên khoa",
    "Tìm lý do khám",
    "Tìm điểm khám",
  ];
  const [phIndex, setPhIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhIndex((i) => (i + 1) % placeholders.length);
    }, 2300); // đổi mỗi 2.3s (bạn chỉnh số ms tùy ý)
    return () => clearInterval(id);
  }, []); // chạy 1 lần

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="header">
      <div className="container header__content">
        {/* Left */}
        <div className="header__left">
          <button className="hamburger" aria-label="Menu">
            <MenuOutlined style={{ fontSize: 28, color: "#111" }} />
          </button>
          <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <span className="logo-icon">+</span>
            <span className="logo-text">MedConnect</span>
          </div>
        </div>

        {/* Center */}
        <nav className="header__center">
          {categories.map((c) => (
            <Link
              key={c.key}
              to={c.path}
              className={`cat ${activeCat === c.key ? "active" : ""}`}
              onClick={() => setActiveCat(c.key)}
            >
              {c.label}
            </Link>
          ))}

          {/* Search (Ant Design) */}
          {showSearch && (
            <div
              className="header__search"
              onClick={() => navigate("/tim-kiem")}
            >
              <Input
                className="search-custom"
                placeholder={placeholders[phIndex]}
                readOnly
                prefix={<SearchOutlined style={{ color: "#45c3d2" }} />}
              />
            </div>
          )}
        </nav>

        {/* Right */}
        <div className="header__right">
          <div className="auth-links">
            {user ? (
              <div className="user-section">
                <span className="user-name">
                  {user?.displayName || user?.email}
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link to="/dang-nhap" className="btn-outline">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
