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
  X,
} from "lucide-react";
import { useConsultationSummaries } from "../../../../hooks/useConsultationSummaries";
import "./HealthProfile.scss";

export function HealthProfile() {
  const [activeButton, setActiveButton] = useState(null);
  const [activeTab, setActiveTab] = useState("medical");
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch consultation summaries from API
  const {
    data: consultationData,
    isLoading,
    error,
  } = useConsultationSummaries(1, 20);
  const medicalHistory = consultationData?.consultationSummaries || [];

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
    // Find the record with full details
    const record = medicalHistory.find((item) => item.id === recordId);
    if (record && record.fullDetails) {
      setSelectedSummary(record);
      setShowDetailModal(true);
    }
    // Toggle active state
    setActiveButton(activeButton === recordId ? null : recordId);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSummary(null);
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
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải lịch sử khám bệnh...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
              </div>
            ) : medicalHistory.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có lịch sử khám bệnh nào.</p>
              </div>
            ) : (
              <div className="history-list">
                {medicalHistory.map((record) => (
                  <div key={record.id} className="history-card">
                    <div className="card-header">
                      <div className="card-title-section">
                        <div className="card-icon">
                          <FileText className="card-icon-symbol" />
                        </div>
                        <div className="card-title">
                          <div className="specialty-name">
                            {record.specialty}
                          </div>
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
                        <div className="content-value">
                          {record.prescription}
                        </div>
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
            )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedSummary && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết hồ sơ khám bệnh</h3>
              <button className="modal-close" onClick={closeDetailModal}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-body">
              {selectedSummary.fullDetails && (
                <div className="detail-content">
                  {/* Basic Info */}
                  <div className="detail-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Ngày khám:</strong>
                        <span>
                          {new Date(
                            selectedSummary.fullDetails.visitDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Lý do khám:</strong>
                        <span>
                          {selectedSummary.fullDetails.reasonForVisit ||
                            "Không có thông tin"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Kết quả điều trị:</strong>
                        <span>
                          {selectedSummary.fullDetails.treatmentResult ||
                            "Không có thông tin"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnoses */}
                  {selectedSummary.fullDetails.diagnoses &&
                    selectedSummary.fullDetails.diagnoses.length > 0 && (
                      <div className="detail-section">
                        <h4>Chẩn đoán</h4>
                        <div className="diagnoses-list">
                          {selectedSummary.fullDetails.diagnoses.map(
                            (diagnosis, index) => (
                              <div key={index} className="diagnosis-item">
                                <strong>{diagnosis.name}</strong>
                                {diagnosis.icd10 && (
                                  <span className="icd-code">
                                    (ICD-10: {diagnosis.icd10})
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Vitals */}
                  {selectedSummary.fullDetails.vitals && (
                    <div className="detail-section">
                      <h4>Chỉ số sinh tồn</h4>
                      <div className="vitals-grid">
                        {selectedSummary.fullDetails.vitals.height && (
                          <div className="vital-item">
                            <strong>Chiều cao:</strong>{" "}
                            {selectedSummary.fullDetails.vitals.height} cm
                          </div>
                        )}
                        {selectedSummary.fullDetails.vitals.weight && (
                          <div className="vital-item">
                            <strong>Cân nặng:</strong>{" "}
                            {selectedSummary.fullDetails.vitals.weight} kg
                          </div>
                        )}
                        {selectedSummary.fullDetails.vitals.bloodPressure && (
                          <div className="vital-item">
                            <strong>Huyết áp:</strong>{" "}
                            {selectedSummary.fullDetails.vitals.bloodPressure}
                          </div>
                        )}
                        {selectedSummary.fullDetails.vitals.heartRate && (
                          <div className="vital-item">
                            <strong>Nhịp tim:</strong>{" "}
                            {selectedSummary.fullDetails.vitals.heartRate} bpm
                          </div>
                        )}
                        {selectedSummary.fullDetails.vitals.temperature && (
                          <div className="vital-item">
                            <strong>Nhiệt độ:</strong>{" "}
                            {selectedSummary.fullDetails.vitals.temperature}°C
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lab Results */}
                  {selectedSummary.fullDetails.labResults &&
                    selectedSummary.fullDetails.labResults.length > 0 && (
                      <div className="detail-section">
                        <h4>Kết quả xét nghiệm</h4>
                        <div className="lab-results">
                          {selectedSummary.fullDetails.labResults.map(
                            (lab, index) => (
                              <div key={index} className="lab-item">
                                <div className="lab-header">
                                  <strong>{lab.testName}</strong>
                                  <span className="lab-date">
                                    {new Date(
                                      lab.performedAt
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <div className="lab-result">
                                  <span className="result-value">
                                    {lab.result}
                                  </span>
                                  {lab.referenceRange && (
                                    <span className="reference-range">
                                      (Bình thường: {lab.referenceRange})
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Imaging Results */}
                  {selectedSummary.fullDetails.imagingResults &&
                    selectedSummary.fullDetails.imagingResults.length > 0 && (
                      <div className="detail-section">
                        <h4>Kết quả hình ảnh</h4>
                        <div className="imaging-results">
                          {selectedSummary.fullDetails.imagingResults.map(
                            (img, index) => (
                              <div key={index} className="imaging-item">
                                <div className="imaging-header">
                                  <strong>{img.type}</strong>
                                  <span className="imaging-date">
                                    {new Date(
                                      img.performedAt
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <div className="imaging-conclusion">
                                  <strong>Kết luận:</strong> {img.conclusion}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Medications */}
                  {selectedSummary.fullDetails.medications &&
                    selectedSummary.fullDetails.medications.length > 0 && (
                      <div className="detail-section">
                        <h4>Đơn thuốc</h4>
                        <div className="medications-list">
                          {selectedSummary.fullDetails.medications.map(
                            (med, index) => (
                              <div key={index} className="medication-item">
                                <div className="med-name">
                                  <strong>{med.name}</strong>
                                </div>
                                <div className="med-details">
                                  <span>Liều lượng: {med.dosage}</span>
                                  <span>Đường dùng: {med.route}</span>
                                  <span>Số lượng: {med.quantity}</span>
                                </div>
                                <div className="med-instruction">
                                  <strong>Hướng dẫn:</strong> {med.instruction}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Procedures */}
                  {selectedSummary.fullDetails.procedures &&
                    selectedSummary.fullDetails.procedures.length > 0 && (
                      <div className="detail-section">
                        <h4>Thủ thuật</h4>
                        <div className="procedures-list">
                          {selectedSummary.fullDetails.procedures.map(
                            (proc, index) => (
                              <div key={index} className="procedure-item">
                                <div className="procedure-header">
                                  <strong>{proc.name}</strong>
                                  <span className="procedure-date">
                                    {new Date(
                                      proc.performedAt
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                                <div className="procedure-description">
                                  {proc.description}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Summary and Instructions */}
                  <div className="detail-section">
                    <h4>Tóm tắt và hướng dẫn</h4>
                    {selectedSummary.fullDetails.summaryText && (
                      <div className="summary-text">
                        <strong>Tóm tắt:</strong>
                        <p>{selectedSummary.fullDetails.summaryText}</p>
                      </div>
                    )}
                    {selectedSummary.fullDetails.treatmentMethod && (
                      <div className="treatment-method">
                        <strong>Phương pháp điều trị:</strong>
                        <p>{selectedSummary.fullDetails.treatmentMethod}</p>
                      </div>
                    )}
                    {selectedSummary.fullDetails.followUpInstruction && (
                      <div className="follow-up">
                        <strong>Hướng dẫn theo dõi:</strong>
                        <p>{selectedSummary.fullDetails.followUpInstruction}</p>
                      </div>
                    )}
                    {selectedSummary.fullDetails.nextAppointmentDate && (
                      <div className="next-appointment">
                        <strong>Lịch hẹn tái khám:</strong>
                        <span>
                          {new Date(
                            selectedSummary.fullDetails.nextAppointmentDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
