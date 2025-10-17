import React, { useState } from "react";
import { Search, Bell } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge";
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
        {/* Search Bar */}
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

        {/* Notification Icon */}
        <div className="notification-container">
          <button className="notification-button">
            <Bell className="notification-icon" />
            <Badge className="notification-badge">3</Badge>
          </button>
        </div>
      </div>
    </header>
  );
}
