import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getDoctorAppointmentsWithFallback } from "../../../lib/api"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import "./OnlineConsultationPage.scss"

export default function OnlineConsultationPage() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [formData, setFormData] = useState({
    notes: "",
    attachmentUrl: "",
    diagnoses: [{ name: "" }],
    medications: [{ name: "", instruction: "", quantity: "" }]
  })

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await getDoctorAppointmentsWithFallback()
        
        if (response.success && response.data?.appointments) {
          const found = response.data.appointments.find(apt => apt._id === appointmentId)
          if (found) {
            setAppointment(found)
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
    if (formData[arrayName].length > 1) {
      setFormData({
        ...formData,
        [arrayName]: formData[arrayName].filter((_, i) => i !== index),
      })
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/doctors/me/upload-consultation-file`, {
        method: 'POST',
        credentials: 'include',
        body: formDataObj
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.url) {
          setFormData({ ...formData, attachmentUrl: data.data.url })
          alert('Tải file lên thành công!')
        } else {
          alert('Upload file thất bại: ' + (data.message || 'Unknown error'))
        }
      } else {
        const errorData = await response.json()
        alert('Upload file thất bại: ' + (errorData.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Có lỗi xảy ra khi upload file: ' + error.message)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submitData = {
      appointmentId: appointment._id,
      notes: formData.notes || undefined,
      attachmentUrl: formData.attachmentUrl || undefined,
      diagnoses: formData.diagnoses.length > 0 ? formData.diagnoses : undefined,
      medications: formData.medications.length > 0 ? formData.medications : undefined
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/doctors/me/consultation-advice`, {
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

      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/doctors/me/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'done' })
      })

      alert("Đã hoàn thành tư vấn và lưu thông tin thành công!")
      navigate("/bac-si/lich-hen")
    } catch (error) {
      console.error("Error submitting consultation:", error)
      alert("Có lỗi xảy ra: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="online-consultation-page-container">
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
    <div className="online-consultation-page-container">
      <div className="online-consultation-page-content">
        <div className="consultation-page-header">
          <div className="header-content">
            <h1>Hoàn thành tư vấn trực tuyến</h1>
            <p className="patient-info">
              Bệnh nhân: <strong>{appointment?.patientId?.fullName || appointment?.patient?.fullName || appointment?.patientName || "N/A"}</strong>
            </p>
          </div>
          <button className="back-btn" onClick={() => navigate("/bac-si/lich-hen")}>
            ← Quay lại
          </button>
        </div>

        <div className="consultation-form-wrapper">
          <form onSubmit={handleSubmit} className="consultation-form-content">
            {/* Basic Info Section */}
            <div className="form-section basic-info">
              <h3 className="section-title">📋 Thông Tin Cuộc Hẹn</h3>
              <div className="section-row">
                <div className="form-group">
                  <label>Bệnh nhân</label>
                  <Input
                    type="text"
                    value={appointment?.patientId?.fullName || appointment?.patient?.fullName || appointment?.patientName || "N/A"}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label>Ngày khám</label>
                  <Input
                    type="text"
                    value={appointment?.scheduledStart ? new Date(appointment.scheduledStart).toLocaleString('vi-VN') : "N/A"}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Lý do khám</label>
                <Input
                  type="text"
                  value={appointment?.reason || appointment?.notes || "N/A"}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            {/* Diagnosis Section - Show by default */}
            <div className="form-section">
              <h3 className="section-title">🔍 Chẩn Đoán sơ bộ</h3>
              {formData.diagnoses.map((diagnosis, index) => (
                <div key={index} className="array-item">
                  <div className="item-header">
                    <span className="item-number">Chẩn đoán </span>
                    {formData.diagnoses.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeArrayItem("diagnoses", index)}>✕</button>
                    )}
                  </div>
                  <div className="item-content">
                    <div className="form-group">
                      
                      <Input type="text" placeholder="VD: Viêm phế quản cấp" value={diagnosis.name} onChange={(e) => handleArrayChange("diagnoses", index, "name", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Medications Section - Show by default */}
            <div className="form-section">
              <h3 className="section-title">💊 Đơn Thuốc</h3>
              {formData.medications.map((medication, index) => (
                <div key={index} className="array-item">
                  <div className="item-header">
                    <span className="item-number">Thuốc #{index + 1}</span>
                    {formData.medications.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeArrayItem("medications", index)}>✕</button>
                    )}
                  </div>
                  <div className="item-content">
                    <div className="form-group">
                      <label>Tên thuốc *</label>
                      <Input type="text" placeholder="VD: Paracetamol" value={medication.name} onChange={(e) => handleArrayChange("medications", index, "name", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Số lượng</label>
                      <Input type="text" placeholder="VD: 30 viên" value={medication.quantity} onChange={(e) => handleArrayChange("medications", index, "quantity", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Liều dùng</label>
                      <Input type="text" placeholder="VD: Uống 2 viên/lần, 2 lần/ngày..." value={medication.instruction} onChange={(e) => handleArrayChange("medications", index, "instruction", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={() => addArrayItem("medications", { name: "", instruction: "", quantity: "" })} className="btn-add">+ Thêm thuốc</Button>
            </div>

            {/* File Upload Section */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="file-attachment">File đính kèm</label>
                <div className="file-upload-group">
                  <input
                    type="file"
                    id="file-attachment"
                    name="file-attachment"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    accept=".pdf,.doc,.jpg,.png"
                    className="file-input"
                  />
                  <label htmlFor="file-attachment" className="file-upload-label">
                    <i className="bi bi-cloud-upload"></i>
                    <span>
                      {formData.attachmentUrl
                        ? "✓ File đã được chọn"
                        : uploadingFile
                        ? "Đang tải lên..."
                        : "Chọn file để đính kèm (PDF, DOC, DOCX, JPG, PNG - Tối đa 10MB)"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notes Section - Moved to the end */}
            <div className="form-section">
              <div className="form-group">
                <label>Ghi chú tư vấn *</label>
                <textarea
                  className="form-textarea"
                  rows="6"
                  value={formData.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  required
                  placeholder="Nhập tóm tắt tư vấn, triệu chứng, lời khuyên..."
                />
              </div>
            </div>

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
