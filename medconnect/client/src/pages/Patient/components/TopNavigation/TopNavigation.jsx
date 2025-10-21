import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { Menu, Calendar, Bell, User, Stethoscope } from "lucide-react";
import "./TopNavigation.scss";

export function TopNavigation() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Trang chủ", href: "/", active: true },
    { label: "Tại nhà", href: "/at-home" },
    { label: "Tại viện", href: "/at-hospital" },
    { label: "Giới thiệu", href: "/about" },
  ];

  return (
    <header className="top-navigation">
      <div className="top-navigation-container">
        {/* Left side - Menu + Logo */}
        <div className="top-navigation-left">
          <Button
            variant="ghost"
            size="icon"
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="menu-icon" />
          </Button>

          <div className="logo-section">
            <div className="logo-icon">
              <Stethoscope className="logo-icon-svg" />
            </div>
            <span className="logo-text">MedConnect</span>
          </div>
        </div>

        {/* Center - Navigation Links */}
        <nav className="top-navigation-center">
          <ul className="navigation-list">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`navigation-item ${item.active ? "active" : ""}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side - Actions */}
        <div className="top-navigation-right">
          <Button variant="outline" className="book-appointment-btn">
            <Calendar className="btn-icon" />
            Đặt lịch
          </Button>

          <Button variant="ghost" size="icon" className="notification-btn">
            <Bell className="notification-icon" />
            <Badge variant="destructive" className="notification-badge">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon" className="profile-btn">
            <User className="profile-icon" />
          </Button>
        </div>
      </div>
    </header>
  );
}
