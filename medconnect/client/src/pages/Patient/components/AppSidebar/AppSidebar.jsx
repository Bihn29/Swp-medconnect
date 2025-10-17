import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import {
  CalendarCheck,
  Search,
  Video,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  CreditCard,
  Bell,
  Plus,
  ChevronDown,
} from "lucide-react";
import "./AppSidebar.scss";

export function AppSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mainMenuItems = [
    { icon: Home, label: "Trang chủ", href: "/patient-dashboard" },
    { icon: Search, label: "Tìm bác sĩ", href: "/search-doctors" },
    {
      icon: CalendarCheck,
      label: "Lịch hẹn của tôi",
      href: "/my-appointments",
    },
    { icon: Video, label: "Tư vấn trực tuyến", href: "/consultations" },
    { icon: FileText, label: "Hồ sơ sức khỏe", href: "/medical-records" },
    { icon: CreditCard, label: "Thanh toán", href: "/payments" },
    { icon: Bell, label: "Thông báo", href: "/notifications", badge: 3 },
  ];

  const settingsMenuItems = [
    { icon: Settings, label: "Cài đặt", href: "/settings" },
    { icon: LogOut, label: "Đăng xuất", href: "/logout" },
  ];

  const userInfo = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    role: "Bệnh nhân",
  };

  const handleLogout = () => {
    console.log("Logout");
    // Thêm logic logout ở đây
  };

  return (
    <>
      {/* Mobile menu button */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            zIndex: 50,
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Overlay for mobile */}
      {!isDesktop && isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: isDesktop ? "sticky" : "fixed",
          left: isDesktop ? "auto" : 0,
          top: isDesktop ? "0" : 0,
          zIndex: 40,
          height: "100vh",
          width: "18rem",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          transition: "transform 0.3s ease",
          transform: isDesktop
            ? "translateX(0)"
            : isOpen
            ? "translateX(0)"
            : "translateX(-100%)",
          flexShrink: 0,
        }}
      >
        <div className="sidebar-content">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-icon">
                <Plus className="logo-plus" />
              </div>
              <div className="logo-text">
                <div className="app-name">MedConnect</div>
                <div className="app-tagline">Chăm sóc sức khỏe</div>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="user-profile-section">
            <div className="user-avatar">
              <img
                src="/patient-consultation.png"
                alt="User Avatar"
                className="avatar-image"
              />
            </div>
            <div className="user-info">
              <div className="user-name">{userInfo.name}</div>
              <div className="user-role">{userInfo.role}</div>
            </div>
            <Button variant="ghost" size="icon" className="dropdown-btn">
              <ChevronDown className="dropdown-icon" />
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="navigation-menu">
            <div className="menu-container">
              {/* Main Menu Items */}
              <ul className="menu-list main-menu">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = window.location.pathname === item.href;
                  return (
                    <li key={item.href} className="menu-item">
                      <button
                        onClick={() => {
                          navigate(item.href);
                          setIsOpen(false);
                        }}
                        className={`menu-button ${isActive ? "active" : ""}`}
                      >
                        <Icon className="menu-icon" />
                        <span className="menu-text">{item.label}</span>
                        {item.badge && (
                          <Badge className="notification-badge">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Settings Menu Items */}
              <div className="settings-section" style={{ marginTop: "1rem" }}>
                <div className="menu-separator"></div>
                <ul className="menu-list settings-menu">
                  {settingsMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = window.location.pathname === item.href;
                    return (
                      <li key={item.href} className="menu-item">
                        <button
                          onClick={() => {
                            if (item.label === "Đăng xuất") {
                              handleLogout();
                            } else {
                              navigate(item.href);
                            }
                            setIsOpen(false);
                          }}
                          className={`menu-button ${isActive ? "active" : ""}`}
                        >
                          <Icon className="menu-icon" />
                          <span className="menu-text">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
