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
    {
      key: "specialty",
      label: "Chuyên khoa",
      path: "/chuyen-khoa",
    },
    { key: "facility", label: "Cơ sở y tế", path: "/co-so-y-te" },
    { key: "doctor", label: "Bác sĩ", path: "/bac-si" },
    { key: "package", label: "Gói khám", path: "/goi-kham" },
  ];

  // Chọn categories dựa trên trang hiện tại
  const isSearchPage = location.pathname === "/tim-kiem";
  const isDoctorPage = location.pathname === "/bac-si";
  const isSpecialtyPage = location.pathname === "/chuyen-khoa";
  const isFacilityPage = location.pathname === "/co-so-y-te";
  const isPackagePage = location.pathname === "/goi-kham";

  const useSearchCategories =
    isSearchPage ||
    isDoctorPage ||
    isSpecialtyPage ||
    isFacilityPage ||
    isPackagePage;
  const categories = useSearchCategories ? searchCategories : defaultCategories;

  const [activeCat, setActiveCat] = useState("all");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set active category based on current path
  useEffect(() => {
    // Nếu đang sử dụng searchCategories navigation, không highlight mục nào
    if (useSearchCategories) {
      setActiveCat("");
    } else if (location.pathname === "/kham-tai-nha") {
      setActiveCat("home");
    } else if (location.pathname === "/kham-tai-vien") {
      setActiveCat("hospital");
    } else if (location.pathname === "/gioi-thieu") {
      setActiveCat("about");
    } else {
      setActiveCat("all");
    }
  }, [location.pathname, location.search, useSearchCategories]);

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
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuOutlined style={{ fontSize: 28, color: "#111" }} />
          </button>
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
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
                <Link to="/dang-nhap" className="btn btn-login">
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" style={{ margin: "0px" }} className="btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>Danh mục</h3>
              <button
                className="sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="sidebar-content">
              <div className="sidebar-section">
                <h4>Dịch vụ y tế</h4>
                <ul>
                  <li>
                    <Link to="/" onClick={() => setSidebarOpen(false)}>
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/kham-tai-nha"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Khám tại nhà
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/kham-tai-vien"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Khám tại viện
                    </Link>
                  </li>
                  <li>
                    <Link to="/tim-kiem" onClick={() => setSidebarOpen(false)}>
                      Tìm kiếm tổng hợp
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h4>Chuyên khoa</h4>
                <ul>
                  <li>
                    <Link
                      to="/chuyen-khoa"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Tất cả chuyên khoa
                    </Link>
                  </li>
                  <li>
                    <Link to="/bac-si" onClick={() => setSidebarOpen(false)}>
                      Danh sách bác sĩ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/co-so-y-te"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Cơ sở y tế
                    </Link>
                  </li>
                  <li>
                    <Link to="/goi-kham" onClick={() => setSidebarOpen(false)}>
                      Gói khám sức khỏe
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h4>Hỗ trợ</h4>
                <ul>
                  <li>
                    <Link
                      to="/gioi-thieu"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link to="/lien-he" onClick={() => setSidebarOpen(false)}>
                      Liên hệ
                    </Link>
                  </li>
                  <li>
                    <Link to="/huong-dan" onClick={() => setSidebarOpen(false)}>
                      Hướng dẫn sử dụng
                    </Link>
                  </li>
                  <li>
                    <Link to="/ho-tro" onClick={() => setSidebarOpen(false)}>
                      Trợ giúp
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="sidebar-section">
                <h4>Tài khoản</h4>
                <ul>
                  {user ? (
                    <>
                      <li>
                        <Link
                          to="/profile"
                          onClick={() => setSidebarOpen(false)}
                        >
                          Thông tin cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/lich-hen"
                          onClick={() => setSidebarOpen(false)}
                        >
                          Lịch hẹn của tôi
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleLogout();
                            setSidebarOpen(false);
                          }}
                          className="sidebar-logout"
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/dang-nhap"
                          onClick={() => setSidebarOpen(false)}
                        >
                          Đăng nhập
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dang-ky"
                          onClick={() => setSidebarOpen(false)}
                        >
                          Đăng ký
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
