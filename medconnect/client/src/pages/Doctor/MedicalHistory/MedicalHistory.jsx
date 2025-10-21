import { useState } from "react";
import { Calendar, Download, Save, FileText } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useConsultationRecords } from "../../../hooks/useDoctor";
import "./MedicalHistory.scss";

export default function MedicalHistory() {
  const { records, loading, error } = useConsultationRecords();
  const [activeTab, setActiveTab] = useState("history");
  const [filters, setFilters] = useState({
    patientName: "",
    dateFrom: "",
    dateTo: "",
    type: "all",
  });

  const [consultations] = useState([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [consultationFormData, setConsultationFormData] = useState({
    reason: "",
    symptoms: "",
    medicalHistory: "",
    examination: "",
    diagnosis: "",
    icdCode: "",
    advice: "",
    followUp: "",
    attachments: "",
  });

  const filteredRecords = records?.filter((record) => {
    return (
      record.patientName?.toLowerCase().includes(filters.patientName.toLowerCase()) &&
      (!filters.type || record.type === filters.type)
    );
  }) || [];

  const handleSelectConsultation = (id) => {
    setSelectedConsultationId(id);
    setConsultationFormData({
      reason: "Khám tổng quát",
      symptoms: "Đau đầu, mệt mỏi",
      medicalHistory: "Không có bệnh lý nền",
      examination: "Huyết áp: 120/80, Nhịp tim: 72",
      diagnosis: "Mệt mỏi do stress",
      icdCode: "R53.83",
      advice: "Nghỉ ngơi, uống nước đầy đủ",
      followUp: "Tái khám sau 1 tuần",
      attachments: "",
    });
  };

  const handleSaveConsultation = (status) => {
    alert(`Tóm tắt khám đã được lưu với trạng thái: ${status === "draft" ? "Nháp" : "Hoàn thành"}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải lịch sử khám...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="medical-history-container">
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab("history")}
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
        >
          Lịch sử khám
        </button>
        <button
          onClick={() => setActiveTab("consultation")}
          className={`tab-button ${activeTab === "consultation" ? "active" : ""}`}
        >
          Tóm tắt khám
        </button>
      </div>

      {activeTab === "history" && (
        <div className="history-content">
          <h3 className="section-title">Lịch sử khám</h3>

          {/* Filters */}
          <Card className="filters-card">
            <div className="filters-grid">
              <div>
                <label className="filter-label">Tên bệnh nhân</label>
                <input
                  type="text"
                  value={filters.patientName}
                  onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                  placeholder="Tìm kiếm..."
                  className="filter-input"
                />
              </div>
              <div>
                <label className="filter-label">Từ ngày</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="filter-input"
                />
              </div>
              <div>
                <label className="filter-label">Đến ngày</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="filter-input"
                />
              </div>
              <div>
                <label className="filter-label">Loại khám</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Records List */}
          <div className="records-list">
            {filteredRecords.length === 0 ? (
              <Card className="empty-state">
                <p className="text-gray-600">Không tìm thấy hồ sơ khám</p>
              </Card>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record._id} className="record-item">
                  <div className="record-header">
                    <div className="record-patient-info">
                      <h3 className="patient-name">{record.patientName}</h3>
                      <div className="record-meta">
                        <span className="appointment-date">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <span className="record-type-badge">{record.type}</span>
                  </div>

                  <div className="record-details">
                    <p className="record-detail-item">
                      <strong>Chẩn đoán:</strong> {record.diagnosis}
                    </p>
                    <p className="record-detail-item">
                      <strong>Ghi chú:</strong> {record.notes}
                    </p>
                  </div>

                  <Button variant="outline" size="sm" className="download-btn">
                    <Download className="w-4 h-4" />
                    Tải PDF
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "consultation" && (
        <div className="consultation-content">
          <div className="consultation-layout">
            {/* Consultation List */}
            <div className="consultation-list">
              <h3 className="section-title">Danh sách khám</h3>
              <div className="consultation-items">
                {consultations.map((consultation) => (
                  <Card
                    key={consultation.id}
                    className={`consultation-item ${
                      selectedConsultationId === consultation.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectConsultation(consultation.id)}
                  >
                    <p className="consultation-patient-name">{consultation.patientName}</p>
                    <p className="consultation-date">{consultation.date}</p>
                    <p className="consultation-reason">{consultation.reason}</p>
                    <span className={`consultation-status ${consultation.status}`}>
                      {consultation.status === "draft" ? "Nháp" : "Hoàn thành"}
                    </span>
                  </Card>
                ))}
              </div>
            </div>

            {/* Consultation Form */}
            {selectedConsultationId && (
              <div className="consultation-form">
                <h3 className="section-title">Tóm tắt khám</h3>
                <Card className="form-card">
                  <div className="consultation-form-container">
                    <div className="consultation-form-field">
                      <label className="form-label">Lý do khám</label>
                      <input
                        type="text"
                        value={consultationFormData.reason}
                        onChange={(e) =>
                          setConsultationFormData({ ...consultationFormData, reason: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>

                    <div className="consultation-form-field">
                      <label className="form-label">Triệu chứng</label>
                      <textarea
                        value={consultationFormData.symptoms}
                        onChange={(e) =>
                          setConsultationFormData({ ...consultationFormData, symptoms: e.target.value })
                        }
                        placeholder="Mô tả triệu chứng..."
                        className="form-textarea"
                      />
                    </div>

                    <div className="consultation-form-field">
                      <label className="form-label">Tiền sử bệnh</label>
                      <textarea
                        value={consultationFormData.medicalHistory}
                        onChange={(e) =>
                          setConsultationFormData({
                            ...consultationFormData,
                            medicalHistory: e.target.value,
                          })
                        }
                        placeholder="Tiền sử bệnh lý..."
                        className="form-textarea"
                      />
                    </div>

                    <div className="consultation-form-field">
                      <label className="form-label">Khám lâm sàng</label>
                      <textarea
                        value={consultationFormData.examination}
                        onChange={(e) =>
                          setConsultationFormData({ ...consultationFormData, examination: e.target.value })
                        }
                        placeholder="Kết quả khám..."
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-grid">
                      <div className="consultation-form-field">
                        <label className="form-label">Chẩn đoán</label>
                        <input
                          type="text"
                          value={consultationFormData.diagnosis}
                          onChange={(e) =>
                            setConsultationFormData({ ...consultationFormData, diagnosis: e.target.value })
                          }
                          className="form-input"
                        />
                      </div>
                      <div className="consultation-form-field">
                        <label className="form-label">Mã ICD</label>
                        <input
                          type="text"
                          value={consultationFormData.icdCode}
                          onChange={(e) =>
                            setConsultationFormData({ ...consultationFormData, icdCode: e.target.value })
                          }
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="consultation-form-field">
                      <label className="form-label">Tư vấn/Kế hoạch theo dõi</label>
                      <textarea
                        value={consultationFormData.advice}
                        onChange={(e) =>
                          setConsultationFormData({ ...consultationFormData, advice: e.target.value })
                        }
                        placeholder="Tư vấn cho bệnh nhân..."
                        className="form-textarea"
                      />
                    </div>

                    <div className="consultation-form-field">
                      <label className="form-label">Tái khám</label>
                      <input
                        type="text"
                        value={consultationFormData.followUp}
                        onChange={(e) =>
                          setConsultationFormData({ ...consultationFormData, followUp: e.target.value })
                        }
                        placeholder="Thời gian tái khám..."
                        className="form-input"
                      />
                    </div>

                    <div className="consultation-form-actions">
                      <Button
                        onClick={() => handleSaveConsultation("draft")}
                        variant="outline"
                        className="save-draft-btn"
                      >
                        <Save className="w-4 h-4" />
                        Lưu nháp
                      </Button>
                      <Button
                        onClick={() => handleSaveConsultation("finalized")}
                        className="finalize-btn"
                      >
                        <FileText className="w-4 h-4" />
                        Hoàn thành
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}