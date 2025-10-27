import React, { useState } from "react";
import { Search, Bell, Video } from "lucide-react";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import VideoCall from "../../../../components/VideoCall/VideoCall";
import "./PatientHeader.scss";

export function PatientHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallRoomId, setVideoCallRoomId] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Thêm logic tìm kiếm ở đây
  };

  // Test video call handler
  const handleTestVideoCall = async () => {
    try {
      console.log("🎥 Starting test video call (Patient)...");
      const testRoomId = `TestRoom_Patient_${Date.now()}`;
      setVideoCallRoomId(testRoomId);
      setShowVideoCall(true);
      console.log("✅ Test video call started with room ID:", testRoomId);
    } catch (error) {
      console.error("❌ Error starting test video call:", error);
    }
  };

  const handleEndVideoCall = () => {
    setShowVideoCall(false);
    setVideoCallRoomId(null);
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
          <Button
            onClick={handleTestVideoCall}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              marginRight: '10px'
            }}
          >
            <Video size={16} style={{ marginRight: '6px' }} />
            Test Video
          </Button>
          <button className="notification-button">
            <Bell className="notification-icon" />
            <Badge className="notification-badge">3</Badge>
          </button>
        </div>
      </div>

      {/* Test Video Call Component */}
      {showVideoCall && videoCallRoomId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <VideoCall
            roomId={videoCallRoomId}
            onCallEnd={handleEndVideoCall}
            userName="Test Patient"
          />
        </div>
      )}
    </header>
  );
}
