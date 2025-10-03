import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import "./DefaultLayout.scss";

const Header = () => {
  const categories = [
    { key: "all", label: "Tất cả" },
    { key: "home", label: "Tại nhà" },
    { key: "hospital", label: "Tại viện" },
    { key: "health", label: "Sống khỏe" },
  ];
  const [activeCat, setActiveCat] = useState("all");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
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
    <header className="header header--booking">
      <div className="container">
        <div className="nav nav--booking">
          <div className="nav-left">
            <button className="hamburger" aria-label="Menu">
              ☰
            </button>
            <div className="logo">
              <h2>
                <span className="logo-mark">Med</span>Connect
              </h2>
            </div>
          </div>

          <div className="nav-center">
            <nav className="center-cats" aria-label="Categories">
              {categories.map((c) => (
                <a
                  key={c.key}
                  href="#"
                  className={`cat ${activeCat === c.key ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCat(c.key);
                  }}
                >
                  {c.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="nav-right">
            <a href="#" className="icon-link" title="Hợp tác">
              🤝
            </a>
            <a href="#" className="icon-link" title="Lịch hẹn">
              📅
            </a>
            <div className="nav-links">
              {user ? (
                <div className="user-section">
                  <div className="user-info">
                    <i className="bi bi-person-circle" />
                    <span>{user?.displayName || user?.email || "User"}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline logout-btn"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/dang-nhap"
                    className="btn btn-outline nav-login"
                    role="button"
                    aria-label="Đăng nhập"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="btn btn-primary nav-register"
                    role="button"
                    aria-label="Đăng ký"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
