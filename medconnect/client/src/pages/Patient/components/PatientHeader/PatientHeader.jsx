import React, { useState } from "react";
import { Search } from "lucide-react";
import { NotificationCenter } from "../../../../components/NotificationCenter/NotificationCenter";
import "./PatientHeader.scss";

export function PatientHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Thêm logic tìm kiếm ở đây
  };

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

        {/* Center Section - Search Bar */}
        <div className="header-center">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Right Section - Notifications */}
        <div className="header-right">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
