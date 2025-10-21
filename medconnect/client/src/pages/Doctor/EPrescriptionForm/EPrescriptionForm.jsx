import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Plus, Trash2, Download, QrCode } from "lucide-react"
import "./EPrescriptionForm.scss"

export default function EPrescriptionForm() {
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [drugs, setDrugs] = useState([])
  const [newDrug, setNewDrug] = useState({
    id: "",
    name: "",
    dosage: "",
    usage: "",
    instructions: "",
    warnings: "",
  })
  const [isAddingDrug, setIsAddingDrug] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [prescriptionCode, setPrescriptionCode] = useState("")
  const [showDrugSelect, setShowDrugSelect] = useState(false)
  const [showUsageSelect, setShowUsageSelect] = useState(false)

  const [commonDrugs, setCommonDrugs] = useState([
    { name: "Paracetamol", dosage: "500mg" },
    { name: "Ibuprofen", dosage: "400mg" },
    { name: "Amoxicillin", dosage: "500mg" },
    { name: "Metformin", dosage: "500mg" },
    { name: "Lisinopril", dosage: "10mg" },
    { name: "Atorvastatin", dosage: "20mg" },
  ])

  const commonUsages = [
    "Uống 1 viên 3 lần/ngày",
    "Uống 1 viên 2 lần/ngày",
    "Uống 1 viên 1 lần/ngày",
    "Uống 2 viên 3 lần/ngày",
  ]

  // Fetch common drugs from API
  useEffect(() => {
    const fetchCommonDrugs = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/medicines', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.medicines) {
            setCommonDrugs(data.data.medicines.slice(0, 10)); // Get first 10 medicines
          }
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    fetchCommonDrugs();
  }, []);

  const handleAddDrug = () => {
    if (newDrug.name && newDrug.dosage && newDrug.usage) {
      setDrugs([...drugs, { ...newDrug, id: Date.now().toString() }])
      setNewDrug({ id: "", name: "", dosage: "", usage: "", instructions: "", warnings: "" })
      setIsAddingDrug(false)
    }
  }

  const handleRemoveDrug = (id) => {
    setDrugs(drugs.filter((drug) => drug.id !== id))
  }

  const handleIssuePrescription = () => {
    if (patientName && diagnosis && drugs.length > 0) {
      const code = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setPrescriptionCode(code)
      setIsQRDialogOpen(true)
      console.log("Issuing prescription:", { patientName, patientAge, diagnosis, drugs })
    }
  }

  const handleDownloadPrescription = () => {
    console.log("Downloading prescription:", prescriptionCode)
    alert(`Đã tải xuống đơn thuốc: ${prescriptionCode}`)
  }

  return (
    <div className="e-prescription-form">
      {/* Patient Information */}
      <Card className="e-prescription-patient-card">
        <CardHeader>
          <CardTitle>Thông tin bệnh nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="e-prescription-patient-grid">
            <div className="e-prescription-patient-field">
              <label className="e-prescription-patient-label">Tên bệnh nhân</label>
              <Input
                placeholder="Nhập tên bệnh nhân"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="e-prescription-patient-input"
              />
            </div>
            <div className="e-prescription-patient-field">
              <label className="e-prescription-patient-label">Tuổi</label>
              <Input
                placeholder="Nhập tuổi"
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="e-prescription-patient-input"
              />
            </div>
            <div className="e-prescription-patient-field">
              <label className="e-prescription-patient-label">Chẩn đoán</label>
              <Input
                placeholder="Nhập chẩn đoán"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="e-prescription-patient-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drugs List */}
      <Card className="e-prescription-drugs-card">
        <CardHeader className="e-prescription-drugs-header">
          <CardTitle>Danh sách thuốc</CardTitle>
          <Button onClick={() => setIsAddingDrug(true)} className="e-prescription-drugs-add-btn">
            <Plus className="w-4 h-4 mr-2" />
            Thêm thuốc
          </Button>
        </CardHeader>
        <CardContent>
          {drugs.length === 0 ? (
            <div className="e-prescription-drugs-empty">
              <p>Chưa có thuốc nào. Nhấn "Thêm thuốc" để bắt đầu.</p>
            </div>
          ) : (
            <div className="e-prescription-drugs-list">
              {drugs.map((drug) => (
                <div key={drug.id} className="e-prescription-drug-item">
                  <div className="e-prescription-drug-item-header">
                    <div className="e-prescription-drug-item-info">
                      <p className="e-prescription-drug-item-name">{drug.name}</p>
                      <p className="e-prescription-drug-item-dosage">{drug.dosage}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveDrug(drug.id)}
                      className="e-prescription-drug-item-remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="e-prescription-drug-item-content">
                    <div className="e-prescription-drug-item-section">
                      <p className="e-prescription-drug-item-label">Cách dùng</p>
                      <p className="e-prescription-drug-item-value">{drug.usage}</p>
                    </div>
                    {drug.instructions && (
                      <div className="e-prescription-drug-item-section">
                        <p className="e-prescription-drug-item-label">Hướng dẫn</p>
                        <p className="e-prescription-drug-item-value">{drug.instructions}</p>
                      </div>
                    )}
                  </div>
                  {drug.warnings && (
                    <div className="e-prescription-drug-item-warning">
                      <p className="e-prescription-drug-item-warning-text">Cảnh báo: {drug.warnings}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Drug Dialog */}
      {isAddingDrug && (
        <div className="e-prescription-drug-dialog-overlay" onClick={() => setIsAddingDrug(false)}>
          <div className="e-prescription-drug-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="e-prescription-drug-dialog-header">
              <h3 className="e-prescription-drug-dialog-title">Thêm thuốc mới</h3>
              <button 
                className="e-prescription-drug-dialog-close"
                onClick={() => setIsAddingDrug(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="e-prescription-drug-form">
            <div className="e-prescription-drug-form-field">
              <label className="e-prescription-drug-form-label">Tên thuốc</label>
              <div className="e-prescription-drug-form-select-container">
                <button 
                  className="e-prescription-drug-form-select"
                  onClick={() => setShowDrugSelect(!showDrugSelect)}
                >
                  {newDrug.name || "Chọn hoặc nhập tên thuốc"}
                  <span className="e-prescription-drug-form-select-arrow">▼</span>
                </button>
                {showDrugSelect && (
                  <div className="e-prescription-drug-form-select-content">
                    {commonDrugs.map((drug) => (
                      <button
                        key={drug.name}
                        className="e-prescription-drug-form-select-item"
                        onClick={() => {
                          setNewDrug({ ...newDrug, name: drug.name });
                          setShowDrugSelect(false);
                        }}
                      >
                        {drug.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input
                placeholder="Hoặc nhập tên thuốc khác"
                value={newDrug.name}
                onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                className="e-prescription-drug-form-input"
              />
            </div>

            <div className="e-prescription-drug-form-field">
              <label className="e-prescription-drug-form-label">Liều lượng</label>
              <Input
                placeholder="VD: 500mg"
                value={newDrug.dosage}
                onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                className="e-prescription-drug-form-input"
              />
            </div>

            <div className="e-prescription-drug-form-field">
              <label className="e-prescription-drug-form-label">Cách dùng</label>
              <div className="e-prescription-drug-form-select-container">
                <button 
                  className="e-prescription-drug-form-select"
                  onClick={() => setShowUsageSelect(!showUsageSelect)}
                >
                  {newDrug.usage || "Chọn cách dùng"}
                  <span className="e-prescription-drug-form-select-arrow">▼</span>
                </button>
                {showUsageSelect && (
                  <div className="e-prescription-drug-form-select-content">
                    {commonUsages.map((usage) => (
                      <button
                        key={usage}
                        className="e-prescription-drug-form-select-item"
                        onClick={() => {
                          setNewDrug({ ...newDrug, usage: usage });
                          setShowUsageSelect(false);
                        }}
                      >
                        {usage}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="e-prescription-drug-form-field">
              <label className="e-prescription-drug-form-label">Hướng dẫn thêm</label>
              <Input
                placeholder="VD: Uống sau bữa ăn"
                value={newDrug.instructions}
                onChange={(e) => setNewDrug({ ...newDrug, instructions: e.target.value })}
                className="e-prescription-drug-form-input"
              />
            </div>

            <div className="e-prescription-drug-form-field">
              <label className="e-prescription-drug-form-label">Cảnh báo/Tương tác</label>
              <textarea
                placeholder="Cảnh báo về tương tác thuốc hoặc tác dụng phụ"
                value={newDrug.warnings}
                onChange={(e) => setNewDrug({ ...newDrug, warnings: e.target.value })}
                className="e-prescription-drug-form-input"
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

            <div className="e-prescription-drug-form-actions">
              <Button variant="outline" onClick={() => setIsAddingDrug(false)} className="e-prescription-drug-form-cancel">
                Hủy
              </Button>
              <Button onClick={handleAddDrug} className="e-prescription-drug-form-submit">
                Thêm thuốc
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Prescription Button */}
      <div className="e-prescription-actions">
        <Button
          onClick={handleIssuePrescription}
          disabled={!patientName || !diagnosis || drugs.length === 0}
          className="e-prescription-issue-btn"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Phát hành E-Prescription
        </Button>
      </div>

      {/* QR Code Dialog */}
      {isQRDialogOpen && (
        <div className="e-prescription-qr-dialog-overlay" onClick={() => setIsQRDialogOpen(false)}>
          <div className="e-prescription-qr-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="e-prescription-qr-dialog-header">
              <h3 className="e-prescription-qr-dialog-title">E-Prescription đã phát hành</h3>
              <button 
                className="e-prescription-qr-dialog-close"
                onClick={() => setIsQRDialogOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="e-prescription-qr-content">
            <div className="e-prescription-qr-success">
              <p className="e-prescription-qr-success-text">Đơn thuốc đã được phát hành thành công</p>
            </div>

            <div className="e-prescription-qr-code-section">
              <p className="e-prescription-qr-code-label">Mã đơn thuốc</p>
              <p className="e-prescription-qr-code-value">{prescriptionCode}</p>
            </div>

            <div className="e-prescription-qr-display">
              <div className="e-prescription-qr-placeholder">
                <QrCode className="e-prescription-qr-icon" />
                <p className="e-prescription-qr-placeholder-text">QR Code</p>
              </div>
            </div>

            <div className="e-prescription-qr-info">
              <div className="e-prescription-qr-info-item">
                <p className="e-prescription-qr-info-label">Bệnh nhân</p>
                <p className="e-prescription-qr-info-value">{patientName}</p>
              </div>
              <div className="e-prescription-qr-info-item">
                <p className="e-prescription-qr-info-label">Chẩn đoán</p>
                <p className="e-prescription-qr-info-value">{diagnosis}</p>
              </div>
              <div className="e-prescription-qr-info-item">
                <p className="e-prescription-qr-info-label">Số lượng thuốc</p>
                <p className="e-prescription-qr-info-value">{drugs.length} loại</p>
              </div>
            </div>

            <div className="e-prescription-qr-actions">
              <Button variant="outline" onClick={() => setIsQRDialogOpen(false)} className="e-prescription-qr-close">
                Đóng
              </Button>
              <Button onClick={handleDownloadPrescription} className="e-prescription-qr-download">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
