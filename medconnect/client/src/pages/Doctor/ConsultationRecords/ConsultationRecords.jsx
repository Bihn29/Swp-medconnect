import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { Input } from "../../../components/ui/Input"
import { FileText, Download, Eye, Plus } from "lucide-react"
import "./ConsultationRecords.scss"

export default function ConsultationRecords() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [newConsultation, setNewConsultation] = useState({
    patientName: "",
    consultationDate: "",
    consultationTime: "",
    reason: "",
    symptoms: "",
    history: "",
    examination: "",
    diagnosis: "",
    advice: "",
    followUp: "",
  })

  // Fetch consultation records from API
  useEffect(() => {
    const fetchConsultationRecords = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/doctors/me/consultation-records', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.records) {
            setRecords(data.data.records);
          }
        }
      } catch (error) {
        console.error('Error fetching consultation records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultationRecords();
  }, []);

  const filteredRecords = records.filter((record) =>
    record.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateConsultation = () => {
    if (newConsultation.patientName && newConsultation.reason) {
      console.log("Creating consultation:", newConsultation)
      alert("Đã tạo bản ghi tư vấn mới")
      setIsCreateDialogOpen(false)
      setNewConsultation({
        patientName: "",
        consultationDate: "",
        consultationTime: "",
        reason: "",
        symptoms: "",
        history: "",
        examination: "",
        diagnosis: "",
        advice: "",
        followUp: "",
      })
    }
  }

  const handleViewDetails = (record) => {
    setSelectedRecord(record)
    setIsDetailDialogOpen(true)
  }

  const handleDownloadRecord = (recordId) => {
    console.log("Downloading record:", recordId)
    alert(`Đã tải xuống bản ghi khám bệnh #${recordId}`)
  }

  return (
    <div className="consultation-records">
      <Card className="consultation-records-card">
        <CardHeader>
          <div className="consultation-records-header">
            <CardTitle>Lịch sử khám bệnh</CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="consultation-records-add-btn">
              <Plus className="w-4 h-4 mr-2" />
              Tạo bản ghi mới
            </Button>
          </div>
          <Input
            placeholder="Tìm kiếm theo tên bệnh nhân hoặc chẩn đoán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="consultation-records-search"
          />
        </CardHeader>
        <CardContent>
          <div className="consultation-records-list">
            {loading ? (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">Không có bản ghi tư vấn nào</div>
            ) : (
              filteredRecords.map((record) => (
                <div key={record._id || record.id} className="consultation-records-item">
                  <div className="consultation-records-item-header">
                    <div className="consultation-records-item-info">
                      <p className="consultation-records-item-patient">
                        {record.patient?.fullName || record.patient || 'N/A'}
                      </p>
                      <p className="consultation-records-item-datetime">
                        {new Date(record.consultationDate || record.date).toLocaleDateString('vi-VN')} - {record.consultationTime || record.time}
                      </p>
                    </div>
                    <div className="consultation-records-item-actions">
                      {record.prescription && (
                        <Badge className="consultation-records-prescription-badge">
                          <FileText className="w-3 h-3 mr-1" />
                          Đơn thuốc
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(record)}
                        className="consultation-records-view-btn"
                      >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadRecord(record.id)}
                      className="consultation-records-download-btn"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
                <div className="consultation-records-item-content">
                  <div className="consultation-records-item-section">
                    <p className="consultation-records-item-label">Lý do khám</p>
                    <p className="consultation-records-item-value">{record.reason || record.consultationReason || 'N/A'}</p>
                  </div>
                  <div className="consultation-records-item-section">
                    <p className="consultation-records-item-label">Chẩn đoán</p>
                    <p className="consultation-records-item-value">{record.diagnosis || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
              )}
          </div>
        </CardContent>
      </Card>

      {/* Create Consultation Dialog */}
      {isCreateDialogOpen && (
        <div className="consultation-records-create-dialog-overlay" onClick={() => setIsCreateDialogOpen(false)}>
          <div className="consultation-records-create-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="consultation-records-create-dialog-header">
              <h3 className="consultation-records-create-dialog-title">Tạo bản ghi khám bệnh mới</h3>
              <button 
                className="consultation-records-create-dialog-close"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="consultation-records-create-form">
              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Tên bệnh nhân</label>
                <Input
                  placeholder="Nhập tên bệnh nhân"
                  value={newConsultation.patientName}
                  onChange={(e) => setNewConsultation({ ...newConsultation, patientName: e.target.value })}
                  className="consultation-records-form-input"
                />
              </div>

              <div className="consultation-records-form-grid">
                <div className="consultation-records-form-field">
                  <label className="consultation-records-form-label">Ngày khám</label>
                  <Input
                    type="date"
                    value={newConsultation.consultationDate}
                    onChange={(e) => setNewConsultation({ ...newConsultation, consultationDate: e.target.value })}
                    className="consultation-records-form-input"
                  />
                </div>
                <div className="consultation-records-form-field">
                  <label className="consultation-records-form-label">Giờ khám</label>
                  <Input
                    type="time"
                    value={newConsultation.consultationTime}
                    onChange={(e) => setNewConsultation({ ...newConsultation, consultationTime: e.target.value })}
                    className="consultation-records-form-input"
                  />
                </div>
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Lý do khám</label>
                <Input
                  placeholder="Nhập lý do khám"
                  value={newConsultation.reason}
                  onChange={(e) => setNewConsultation({ ...newConsultation, reason: e.target.value })}
                  className="consultation-records-form-input"
                />
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Triệu chứng</label>
                <textarea
                  placeholder="Mô tả triệu chứng"
                  value={newConsultation.symptoms}
                  onChange={(e) => setNewConsultation({ ...newConsultation, symptoms: e.target.value })}
                  className="consultation-records-form-input"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "60px"
                  }}
                />
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Tiền sử bệnh</label>
                <textarea
                  placeholder="Tiền sử bệnh của bệnh nhân"
                  value={newConsultation.history}
                  onChange={(e) => setNewConsultation({ ...newConsultation, history: e.target.value })}
                  className="consultation-records-form-input"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "60px"
                  }}
                />
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Khám lâm sàng</label>
                <textarea
                  placeholder="Kết quả khám lâm sàng"
                  value={newConsultation.examination}
                  onChange={(e) => setNewConsultation({ ...newConsultation, examination: e.target.value })}
                  className="consultation-records-form-input"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "60px"
                  }}
                />
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Chẩn đoán</label>
                <Input
                  placeholder="Nhập chẩn đoán"
                  value={newConsultation.diagnosis}
                  onChange={(e) => setNewConsultation({ ...newConsultation, diagnosis: e.target.value })}
                  className="consultation-records-form-input"
                />
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Tư vấn & Điều trị</label>
                <textarea
                  placeholder="Tư vấn và hướng dẫn điều trị"
                  value={newConsultation.advice}
                  onChange={(e) => setNewConsultation({ ...newConsultation, advice: e.target.value })}
                  className="consultation-records-form-input"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "60px"
                  }}
                />
              </div>

              <div className="consultation-records-form-field">
                <label className="consultation-records-form-label">Tái khám</label>
                <Input
                  placeholder="Hướng dẫn tái khám"
                  value={newConsultation.followUp}
                  onChange={(e) => setNewConsultation({ ...newConsultation, followUp: e.target.value })}
                  className="consultation-records-form-input"
                />
              </div>

              <div className="consultation-records-form-actions">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="consultation-records-form-cancel">
                  Hủy
                </Button>
                <Button onClick={handleCreateConsultation} className="consultation-records-form-submit">
                  Lưu bản ghi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {isDetailDialogOpen && (
        <div className="consultation-records-detail-dialog-overlay" onClick={() => setIsDetailDialogOpen(false)}>
          <div className="consultation-records-detail-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="consultation-records-detail-dialog-header">
              <h3 className="consultation-records-detail-dialog-title">Chi tiết khám bệnh</h3>
              <button 
                className="consultation-records-detail-dialog-close"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                ×
              </button>
            </div>
            {selectedRecord && (
              <div className="consultation-records-detail">
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Bệnh nhân</p>
                  <p className="consultation-records-detail-value">{selectedRecord.patient}</p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Ngày & Giờ khám</p>
                  <p className="consultation-records-detail-value">
                    {selectedRecord.date} - {selectedRecord.time}
                  </p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Lý do khám</p>
                  <p className="consultation-records-detail-value">{selectedRecord.reason}</p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Triệu chứng</p>
                  <p className="consultation-records-detail-value">{selectedRecord.symptoms}</p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Khám lâm sàng</p>
                  <p className="consultation-records-detail-value">{selectedRecord.examination}</p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Chẩn đoán</p>
                  <p className="consultation-records-detail-value">{selectedRecord.diagnosis}</p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Tư vấn & Điều trị</p>
                  <p className="consultation-records-detail-value">{selectedRecord.advice}</p>
                </div>
                <div className="consultation-records-detail-item">
                  <p className="consultation-records-detail-label">Tái khám</p>
                  <p className="consultation-records-detail-value">{selectedRecord.followUp}</p>
                </div>
                {selectedRecord.prescription && (
                  <Badge className="consultation-records-prescription-detail-badge">
                    <FileText className="w-3 h-3 mr-1" />
                    Đơn thuốc đã cấp
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}