import React from "react";
import { Search } from "lucide-react";
import { NotificationCenter } from "../../../../components/NotificationCenter/NotificationCenter";
import "./PatientHeader.scss";

export function PatientHeader() {
  return (
    <header className="patient-header">
      <div className="header-content">
        {/* Left Section - Logo/Brand */}
        <div className="header-left">
          <div className="brand-container">
            <div className="brand-icon">
              <div className="icon-circle">
                <Search className="brand-icon-symbol" />
              </div>
            </div>
            <div className="brand-text">
              <div className="brand-name">MedConnect</div>
              <div className="brand-tagline">Chăm sóc sức khỏe</div>
            </div>
          </div>
        </div>

        {/* Right Section - Notifications */}
        <div className="header-right">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
