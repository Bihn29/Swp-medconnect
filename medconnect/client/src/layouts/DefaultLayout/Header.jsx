import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./DefaultLayout.scss";

const Header = () => {
  const categories = [
    { key: "all", label: "Trang chủ", path: "/" },
    { key: "home", label: "Tại nhà", path: "/kham-tai-nha" },
    { key: "hospital", label: "Tại viện", path: "/kham-tai-vien" },
    { key: "about", label: "Giới thiệu", path: "/gioi-thieu" },
  ];

  const [activeCat, setActiveCat] = useState("all");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hiển thị search ở các trang này
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
          <div className="logo">
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
            <div className="header__search">
              <Input.Search
                className="search-custom"
                placeholder={placeholders[phIndex]}
                size="large"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={(value) => {
                  // TODO: gắn logic tìm kiếm thực tế ở đây
                  console.log("Searching:", value);
                }}
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
