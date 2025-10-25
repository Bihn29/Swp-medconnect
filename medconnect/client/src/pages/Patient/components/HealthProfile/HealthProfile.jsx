import React, { useState } from "react";
import {
  Download,
  Heart,
  Activity,
  Droplets,
  Weight,
  FileText,
  Calendar,
  User,
  Eye,
  FileDown,
  MessageCircle,
  Video,
} from "lucide-react";
import "./HealthProfile.scss";

export function HealthProfile() {
  const [activeButton, setActiveButton] = useState(null);
  const [activeTab, setActiveTab] = useState("medical");
  const [healthMetrics] = useState([
    {
      id: 1,
      icon: Activity,
      label: "Huyết áp",
      value: "120/80 mmHg",
      status: "Bình thường",
      statusColor: "normal",
    },
    {
      id: 2,
      icon: Heart,
      label: "Nhịp tim",
      value: "72 bpm",
      status: "Bình thường",
      statusColor: "normal",
    },
    {
      id: 3,
      icon: Droplets,
      label: "Đường huyết",
      value: "95 mg/dL",
      status: "Bình thường",
      statusColor: "normal",
    },
    {
      id: 4,
      icon: Weight,
      label: "Cân nặng",
      value: "68 kg",
      status: "Bình thường",
      statusColor: "normal",
    },
  ]);

  const [medicalHistory] = useState([
    {
      id: 1,
      specialty: "Nha khoa",
      date: "05/10/2025",
      doctor: "BS. Nguyễn Văn E",
      diagnosis: "Khám định kỳ, vệ sinh răng miệng",
      prescription: "Không có đơn thuốc",
      documents: [
        {
          name: "Kết quả X-quang.pdf",
          type: "pdf",
        },
      ],
    },
    {
      id: 2,
      specialty: "Tim mạch",
      date: "28/09/2025",
      doctor: "BS. Trần Thị B",
      diagnosis: "Kiểm tra huyết áp, ECG bình thường",
      prescription: "Thuốc hạ huyết áp - Uống 1 viên/ngày",
      documents: [
        {
          name: "Kết quả ECG.pdf",
          type: "pdf",
        },
      ],
    },
  ]);

  const [consultationHistory] = useState([
    {
      id: 1,
      type: "Video Call",
      date: "15/10/2025",
      doctor: "BS. Lê Thị C",
      specialty: "Tâm lý",
      duration: "30 phút",
      topic: "Tư vấn về stress và lo âu",
      summary:
        "Bác sĩ đã tư vấn về các phương pháp quản lý stress, hướng dẫn các bài tập thở và khuyến nghị thay đổi lối sống.",
      documents: [
        {
          name: "Tài liệu hướng dẫn thở.pdf",
          type: "pdf",
        },
      ],
    },
    {
      id: 2,
      type: "Chat",
      date: "12/10/2025",
      doctor: "BS. Phạm Văn D",
      specialty: "Dinh dưỡng",
      duration: "20 phút",
      topic: "Tư vấn chế độ ăn uống",
      summary:
        "Tư vấn về chế độ ăn uống cân bằng, các thực phẩm nên tránh và khuyến nghị về vitamin.",
      documents: [
        {
          name: "Thực đơn mẫu.pdf",
          type: "pdf",
        },
        {
          name: "Danh sách thực phẩm.pdf",
          type: "pdf",
        },
      ],
    },
    {
      id: 3,
      type: "Video Call",
      date: "08/10/2025",
      doctor: "BS. Hoàng Thị E",
      specialty: "Da liễu",
      duration: "25 phút",
      topic: "Tư vấn về chăm sóc da",
      summary:
        "Hướng dẫn quy trình chăm sóc da hàng ngày, các sản phẩm phù hợp và cách phòng ngừa mụn.",
      documents: [
        {
          name: "Hướng dẫn chăm sóc da.pdf",
          type: "pdf",
        },
      ],
    },
  ]);

  const handleDownload = () => {
    console.log("Downloading health profile...");
    // Implement download functionality
  };

  const handleViewDetails = (recordId) => {
    console.log("Viewing details for record:", recordId);
    // Toggle active state
    setActiveButton(activeButton === recordId ? null : recordId);
    // Implement view details functionality
  };

  const handleDownloadDocument = (documentName) => {
    console.log("Downloading document:", documentName);
    // Implement document download functionality
  };

  return (
    <div className="health-profile-container">
      {/* Header */}
      <div className="health-profile-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title" style={{ color: "#000000" }}>
              Hồ sơ sức khỏe
            </h1>
            <p className="page-subtitle">
              Theo dõi và quản lý thông tin sức khỏe của bạn
            </p>
          </div>
          <button className="download-button" onClick={handleDownload}>
            <Download className="download-icon" />
            Tải xuống
          </button>
        </div>
      </div>

      {/* Health Metrics Section */}
      <div className="health-metrics-section">
        <h2 className="section-title">Chỉ số sức khỏe</h2>
        <div className="metrics-grid">
          {healthMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div key={metric.id} className="metric-card">
                <div className="metric-icon">
                  <IconComponent className="metric-icon-symbol" />
                </div>
                <div className="metric-content">
                  <div className="metric-label">{metric.label}</div>
                  <div className="metric-value">{metric.value}</div>
                  <div className={`metric-status status-${metric.statusColor}`}>
                    {metric.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Section with Tabs */}
      <div className="history-section">
        <div className="section-header">
          <h2 className="section-title">Lịch sử</h2>
          <div className="tab-navigation">
            <button
              className={`tab-button ${
                activeTab === "medical" ? "active" : ""
              }`}
              onClick={() => setActiveTab("medical")}
            >
              <FileText className="tab-icon" />
              Lịch sử khám bệnh
            </button>
            <button
              className={`tab-button ${
                activeTab === "consultation" ? "active" : ""
              }`}
              onClick={() => setActiveTab("consultation")}
            >
              <MessageCircle className="tab-icon" />
              Lịch sử tư vấn
            </button>
          </div>
        </div>

        {/* Medical History Tab */}
        {activeTab === "medical" && (
          <div className="tab-content">
            <div className="history-list">
              {medicalHistory.map((record) => (
                <div key={record.id} className="history-card">
                  <div className="card-header">
                    <div className="card-title-section">
                      <div className="card-icon">
                        <FileText className="card-icon-symbol" />
                      </div>
                      <div className="card-title">
                        <div className="specialty-name">{record.specialty}</div>
                        <div className="card-meta">
                          <div className="meta-item">
                            <Calendar className="meta-icon" />
                            <span>{record.date}</span>
                          </div>
                          <div className="meta-item">
                            <User className="meta-icon" />
                            <span>{record.doctor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`view-details-button ${
                        activeButton === record.id ? "active" : ""
                      }`}
                      onClick={() => handleViewDetails(record.id)}
                    >
                      <Eye className="view-icon" />
                      Xem chi tiết
                    </button>
                  </div>

                  <div className="card-content">
                    <div className="content-item">
                      <div className="content-label">Chẩn đoán:</div>
                      <div className="content-value">{record.diagnosis}</div>
                    </div>

                    <div className="content-item">
                      <div className="content-label">Đơn thuốc:</div>
                      <div className="content-value">{record.prescription}</div>
                    </div>

                    <div className="content-item">
                      <div className="content-label">Tài liệu đính kèm:</div>
                      <div className="documents-list">
                        {record.documents.map((doc, index) => (
                          <div key={index} className="document-item">
                            <FileText className="document-icon" />
                            <span
                              className="document-link"
                              onClick={() => handleDownloadDocument(doc.name)}
                            >
                              {doc.name}
                            </span>
                            <FileDown className="download-icon" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consultation History Tab */}
        {activeTab === "consultation" && (
          <div className="tab-content">
            <div className="history-list">
              {consultationHistory.map((record) => (
                <div key={record.id} className="history-card consultation-card">
                  <div className="card-header">
                    <div className="card-title-section">
                      <div className="card-icon">
                        {record.type === "Video Call" ? (
                          <Video className="card-icon-symbol" />
                        ) : (
                          <MessageCircle className="card-icon-symbol" />
                        )}
                      </div>
                      <div className="card-title">
                        <div className="specialty-name">{record.specialty}</div>
                        <div className="card-meta">
                          <div className="meta-item">
                            <Calendar className="meta-icon" />
                            <span>{record.date}</span>
                          </div>
                          <div className="meta-item">
                            <User className="meta-icon" />
                            <span>{record.doctor}</span>
                          </div>
                          <div className="meta-item">
                            <span className="consultation-type">
                              {record.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`view-details-button ${
                        activeButton === record.id ? "active" : ""
                      }`}
                      onClick={() => handleViewDetails(record.id)}
                    >
                      <Eye className="view-icon" />
                      Xem chi tiết
                    </button>
                  </div>

                  <div className="card-content">
                    <div className="content-item">
                      <div className="content-label">Chủ đề tư vấn:</div>
                      <div className="content-value">{record.topic}</div>
                    </div>

                    <div className="content-item">
                      <div className="content-label">Thời gian:</div>
                      <div className="content-value">{record.duration}</div>
                    </div>

                    <div className="content-item">
                      <div className="content-label">Tóm tắt:</div>
                      <div className="content-value">{record.summary}</div>
                    </div>

                    <div className="content-item">
                      <div className="content-label">Tài liệu đính kèm:</div>
                      <div className="documents-list">
                        {record.documents.map((doc, index) => (
                          <div key={index} className="document-item">
                            <FileText className="document-icon" />
                            <span
                              className="document-link"
                              onClick={() => handleDownloadDocument(doc.name)}
                            >
                              {doc.name}
                            </span>
                            <FileDown className="download-icon" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
