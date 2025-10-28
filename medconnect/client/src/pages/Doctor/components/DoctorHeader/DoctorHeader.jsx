import React from "react";
import { NotificationCenter } from "../../../../components/NotificationCenter/NotificationCenter";
import "./DoctorHeader.scss";

export function DoctorHeader() {
  return (
    <header className="doctor-header">
      <div className="doctor-header-content">
        {/* Left Section - Title */}
        <div className="doctor-header-left">
          <h1 className="doctor-header-title">Dashboard Bác Sĩ</h1>
        </div>

        {/* Right Section - Notifications */}
        <div className="doctor-header-right">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
