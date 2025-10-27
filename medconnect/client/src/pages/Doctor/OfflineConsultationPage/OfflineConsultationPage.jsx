import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getDoctorAppointmentsWithFallback } from "../../../lib/api"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import "./OfflineConsultationPage.scss"

export default function OfflineConsultationPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("vitals")
  const [formData, setFormData] = useState({
    reasonForVisit: "",
    visitDate: new Date().toISOString().split("T")[0],
    treatmentResult: "improved",
    consultationCategory: "examination",
    diagnoses: [],
    vitals: {
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
    },
    labResults: [],
    imagingResults: [],
    medications: [],
    procedures: [],
    summaryText: "",
    treatmentMethod: "",
    followUpInstruction: "",
    nextAppointmentDate: "",
  })

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await getDoctorAppointmentsWithFallback()
        
        if (response.success && response.data?.appointments) {
          const found = response.data.appointments.find(apt => apt._id === appointmentId)
          if (found) {
            setAppointment(found)
            setFormData(prev => ({
              ...prev,
              reasonForVisit: found?.reason || found?.notes || "",
              visitDate: found?.scheduledStart ? new Date(found.scheduledStart).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            }))
          } else {
            alert("Không tìm thấy lịch hẹn")
            navigate("/bac-si/lich-hen")
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error)
        alert("Có lỗi xảy ra khi tải dữ liệu")
        navigate("/bac-si/lich-hen")
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId, navigate])

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleVitalChange = (field, value) => {
    setFormData({
      ...formData,
      vitals: { 
        ...formData.vitals, 
        [field]: value 
      },
    })
  }

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...formData[arrayName]]
    newArray[index][field] = value
    setFormData({ ...formData, [arrayName]: newArray })
  }

  const addArrayItem = (arrayName, template) => {
    setFormData({
      ...formData,
      [arrayName]: [...formData[arrayName], template],
    })
  }

  const removeArrayItem = (arrayName, index) => {
    setFormData({
      ...formData,
      [arrayName]: formData[arrayName].filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submitData = {
      appointmentId: appointment._id,
      summaryText: formData.summaryText || undefined,
      reasonForVisit: formData.reasonForVisit || undefined,
      visitDate: formData.visitDate ? new Date(formData.visitDate) : undefined,
      treatmentResult: formData.treatmentResult || undefined,
      consultationCategory: formData.consultationCategory || undefined,
      diagnoses: formData.diagnoses.length > 0 ? formData.diagnoses : undefined,
      vitals: Object.keys(formData.vitals).length > 0 ? formData.vitals : undefined,
      labResults: formData.labResults.length > 0 ? formData.labResults : undefined,
      imagingResults: formData.imagingResults.length > 0 ? formData.imagingResults : undefined,
      medications: formData.medications.length > 0 ? formData.medications : undefined,
      procedures: formData.procedures.length > 0 ? formData.procedures : undefined,
      treatmentMethod: formData.treatmentMethod || undefined,
      followUpInstruction: formData.followUpInstruction || undefined,
      nextAppointmentDate: formData.nextAppointmentDate ? new Date(formData.nextAppointmentDate) : undefined,
    }

    try {
      const response = await fetch('/api/doctors/me/consultation-summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit consultation')
      }

      await fetch(`/api/doctors/me/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'done' })
      })

      alert("Đã hoàn thành khám bệnh và lưu thông tin thành công!")
      navigate("/bac-si/lich-hen")
    } catch (error) {
      console.error("Error submitting consultation:", error)
      alert("Có lỗi xảy ra: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="offline-consultation-page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  return (
    <div className="offline-consultation-page-container">
      <div className="offline-consultation-page-content">
        <div className="consultation-page-header">
          <div className="header-content">
            <h1>Hoàn thành khám bệnh trực tiếp</h1>
            <p className="patient-info">
              Bệnh nhân: <strong>{appointment?.patientId?.fullName || appointment?.patient?.fullName || appointment?.patientName || "N/A"}</strong>
            </p>
          </div>
          <button className="back-btn" onClick={() => navigate("/bac-si/lich-hen")}>
            ← Quay lại
          </button>
        </div>

        <div className="consultation-form-wrapper">
          <div className="form-tabs">
            <button type="button" className={`tab-btn ${activeTab === "basic" ? "active" : ""}`} onClick={() => setActiveTab("basic")}>📋 Thông tin cơ bản</button>
            <button type="button" className={`tab-btn ${activeTab === "vitals" ? "active" : ""}`} onClick={() => setActiveTab("vitals")}>📊 Chỉ số</button>
            <button type="button" className={`tab-btn ${activeTab === "diagnosis" ? "active" : ""}`} onClick={() => setActiveTab("diagnosis")}>🔍 Chẩn đoán</button>
            <button type="button" className={`tab-btn ${activeTab === "tests" ? "active" : ""}`} onClick={() => setActiveTab("tests")}>🧪 Xét nghiệm</button>
            <button type="button" className={`tab-btn ${activeTab === "treatment" ? "active" : ""}`} onClick={() => setActiveTab("treatment")}>💊 Điều trị</button>
            <button type="button" className={`tab-btn ${activeTab === "summary" ? "active" : ""}`} onClick={() => setActiveTab("summary")}>📝 Tóm tắt</button>
          </div>

          <form onSubmit={handleSubmit} className="consultation-form-content">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="form-section">
                <div className="section-row">
                  <div className="form-group">
                    <label>Lý do khám *</label>
                    <Input type="text" value={formData.reasonForVisit} onChange={(e) => handleFieldChange("reasonForVisit", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Ngày khám *</label>
                    <Input type="date" value={formData.visitDate} onChange={(e) => handleFieldChange("visitDate", e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Kết quả điều trị</label>
                  <select value={formData.treatmentResult} onChange={(e) => handleFieldChange("treatmentResult", e.target.value)} className="form-select">
                    <option value="recovered">Khỏi hoàn toàn</option>
                    <option value="improved">Cải thiện</option>
                    <option value="unchanged">Không thay đổi</option>
                  </select>
                </div>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
              <div className="form-section">
                <h3 className="section-title">📊 Chỉ số Sinh Học</h3>
                <div className="vitals-grid">
                  <div className="form-group">
                    <label>Chiều cao (cm)</label>
                    <Input type="number" value={formData.vitals.height} onChange={(e) => handleVitalChange("height", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Cân nặng (kg)</label>
                    <Input type="number" value={formData.vitals.weight} onChange={(e) => handleVitalChange("weight", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Huyết áp (mmHg)</label>
                    <Input type="text" value={formData.vitals.bloodPressure} onChange={(e) => handleVitalChange("bloodPressure", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Nhịp tim (bpm)</label>
                    <Input type="number" value={formData.vitals.heartRate} onChange={(e) => handleVitalChange("heartRate", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Nhiệt độ (°C)</label>
                    <Input type="number" step="0.1" value={formData.vitals.temperature} onChange={(e) => handleVitalChange("temperature", e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis Tab */}
            {activeTab === "diagnosis" && (
              <div className="form-section">
                <h3 className="section-title">🔍 Chẩn Đoán Lâm Sàng</h3>
                {formData.diagnoses.length === 0 && <p className="no-data">Chưa có chẩn đoán nào</p>}
                {formData.diagnoses.map((diagnosis, index) => (
                  <div key={index} className="array-item">
                    <div className="item-header">
                      <span className="item-number">#{index + 1}</span>
                      {formData.diagnoses.length >= 1 && (
                        <button type="button" className="btn-remove" onClick={() => removeArrayItem("diagnoses", index)}>✕</button>
                      )}
                    </div>
                    <div className="item-content">
                      <div className="form-group">
                        <label>Tên chẩn đoán *</label>
                        <Input type="text" value={diagnosis.name} onChange={(e) => handleArrayChange("diagnoses", index, "name", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Treatment Tab */}
            {activeTab === "treatment" && (
              <div className="form-section">
                <h3 className="section-title">💊 Đơn Thuốc</h3>
                {formData.medications.length === 0 && <p className="no-data">Chưa có thuốc nào</p>}
                {formData.medications.map((medication, index) => (
                  <div key={index} className="array-item">
                    <div className="item-header">
                      <span className="item-number">Thuốc #{index + 1}</span>
                      {formData.medications.length >= 1 && (
                        <button type="button" className="btn-remove" onClick={() => removeArrayItem("medications", index)}>✕</button>
                      )}
                    </div>
                    <div className="item-content">
                      <div className="form-group">
                        <label>Tên thuốc *</label>
                        <Input type="text" value={medication.name} onChange={(e) => handleArrayChange("medications", index, "name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Số lượng</label>
                        <Input type="text" value={medication.quantity} onChange={(e) => handleArrayChange("medications", index, "quantity", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Cách dùng</label>
                        <Input type="text" placeholder="VD: Uống 2 viên/lần, 2 lần/ngày..." value={medication.instruction} onChange={(e) => handleArrayChange("medications", index, "instruction", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={() => addArrayItem("medications", { name: "", instruction: "", quantity: "" })} className="btn-add">+ Thêm thuốc</Button>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="form-section">
                <h3 className="section-title">📝 Tóm Tắt Khám Bệnh</h3>
                <div className="form-group">
                  <label>Tóm tắt buổi khám</label>
                  <textarea className="form-textarea" rows="6" value={formData.summaryText} onChange={(e) => handleFieldChange("summaryText", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Phương pháp điều trị</label>
                  <textarea className="form-textarea" rows="4" value={formData.treatmentMethod} onChange={(e) => handleFieldChange("treatmentMethod", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Hướng dẫn tái khám</label>
                  <textarea className="form-textarea" rows="4" value={formData.followUpInstruction} onChange={(e) => handleFieldChange("followUpInstruction", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Ngày tái khám</label>
                  <Input type="date" value={formData.nextAppointmentDate} onChange={(e) => handleFieldChange("nextAppointmentDate", e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-actions">
              <Button type="button" onClick={() => navigate("/bac-si/lich-hen")} variant="outline">Hủy</Button>
              <Button type="submit" className="btn-submit">Xác nhận & Lưu</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
