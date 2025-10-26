import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { Input } from "../../../components/ui/Input"
import { getDoctorAppointmentsWithFallback, updateAppointmentStatus } from "../../../lib/api"
// Dialog components không tồn tại, sẽ sử dụng HTML elements thay thế
import "./AppointmentList.scss"

// Consultation Summary Form Component (for offline appointments)
function ConsultationSummaryForm({ appointment, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    reasonForVisit: appointment?.notes || appointment?.reason || "",
    visitDate: new Date().toISOString().split('T')[0],
    treatmentResult: "improved",
    diagnoses: [{ name: "", icd10: "" }],
    vitals: {
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
      temperature: ""
    },
    labResults: [{ testName: "", result: "", referenceRange: "" }],
    imagingResults: [{ type: "", conclusion: "", imageUrl: "" }],
    medications: [{ name: "", dosage: "", route: "", quantity: "", instruction: "" }],
    procedures: [{ name: "", description: "" }],
    summaryText: "",
    treatmentMethod: "",
    followUpInstruction: "",
    nextAppointmentDate: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field, index, subField, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  const addArrayItem = (field) => {
    const template = {
      diagnoses: { name: "", icd10: "" },
      labResults: { testName: "", result: "", referenceRange: "" },
      imagingResults: { type: "", conclusion: "", imageUrl: "" },
      medications: { name: "", dosage: "", route: "", quantity: "", instruction: "" },
      procedures: { name: "", description: "" }
    };
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template[field]]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      appointmentId: appointment._id,
      patientId: appointment.patientId?._id || appointment.patient?._id,
      doctorId: appointment.doctorId?._id || appointment.doctor?._id,
      clinicId: appointment.clinicId?._id || appointment.clinic?._id,
      ...formData,
      visitDate: new Date(formData.visitDate),
      nextAppointmentDate: formData.nextAppointmentDate ? new Date(formData.nextAppointmentDate) : null,
      createdBy: appointment.doctorId?._id || appointment.doctor?._id
    });
  };

  return (
    <div className="consultation-form-overlay" onClick={onClose}>
      <div className="consultation-form" onClick={(e) => e.stopPropagation()}>
        <div className="consultation-form-header">
          <h3>Hồ sơ khám bệnh - {appointment?.patientId?.fullName || appointment?.patient?.fullName}</h3>
          <button className="consultation-form-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="consultation-form-content">
          {/* Patient Info */}
          <div className="form-section">
            <h4>Thông tin bệnh nhân</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Tên bệnh nhân</label>
                <Input 
                  value={appointment?.patientId?.fullName || appointment?.patient?.fullName || ""} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <Input 
                  value={appointment?.patientId?.phone || appointment?.patient?.phone || ""} 
                  disabled 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <Input 
                  value={appointment?.patientId?.email || appointment?.patient?.email || ""} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <Input 
                  value={appointment?.patientId?.dob ? new Date(appointment.patientId.dob).toLocaleDateString('vi-VN') : ""} 
                  disabled 
                />
              </div>
            </div>
          </div>

          {/* Visit Info */}
          <div className="form-section">
            <h4>Thông tin khám</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Lý do khám *</label>
                <textarea
                  value={formData.reasonForVisit}
                  onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ngày khám</label>
                <Input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Kết quả điều trị</label>
                <select
                  value={formData.treatmentResult}
                  onChange={(e) => handleInputChange('treatmentResult', e.target.value)}
                >
                  <option value="recovered">Khỏi bệnh</option>
                  <option value="improved">Cải thiện</option>
                  <option value="unchanged">Không thay đổi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnoses */}
          <div className="form-section">
            <h4>Chẩn đoán</h4>
            {formData.diagnoses.map((diagnosis, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Tên chẩn đoán</label>
                  <Input
                    value={diagnosis.name}
                    onChange={(e) => handleArrayFieldChange('diagnoses', index, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mã ICD-10</label>
                  <Input
                    value={diagnosis.icd10}
                    onChange={(e) => handleArrayFieldChange('diagnoses', index, 'icd10', e.target.value)}
                  />
                </div>
                <Button type="button" onClick={() => removeArrayItem('diagnoses', index)}>Xóa</Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem('diagnoses')}>Thêm chẩn đoán</Button>
          </div>

          {/* Vitals */}
          <div className="form-section">
            <h4>Chỉ số sinh tồn</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Chiều cao (cm)</label>
                <Input
                  type="number"
                  value={formData.vitals.height}
                  onChange={(e) => handleInputChange('vitals', { ...formData.vitals, height: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Cân nặng (kg)</label>
                <Input
                  type="number"
                  value={formData.vitals.weight}
                  onChange={(e) => handleInputChange('vitals', { ...formData.vitals, weight: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Huyết áp</label>
                <Input
                  value={formData.vitals.bloodPressure}
                  onChange={(e) => handleInputChange('vitals', { ...formData.vitals, bloodPressure: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Nhịp tim (bpm)</label>
                <Input
                  type="number"
                  value={formData.vitals.heartRate}
                  onChange={(e) => handleInputChange('vitals', { ...formData.vitals, heartRate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Nhiệt độ (°C)</label>
                <Input
                  type="number"
                  value={formData.vitals.temperature}
                  onChange={(e) => handleInputChange('vitals', { ...formData.vitals, temperature: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="form-section">
            <h4>Đơn thuốc</h4>
            {formData.medications.map((medication, index) => (
              <div key={index} className="medication-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên thuốc</label>
                    <Input
                      value={medication.name}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Liều lượng</label>
                    <Input
                      value={medication.dosage}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'dosage', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Đường dùng</label>
                    <Input
                      value={medication.route}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'route', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số lượng</label>
                    <Input
                      type="number"
                      value={medication.quantity}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'quantity', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Hướng dẫn sử dụng</label>
                  <textarea
                    value={medication.instruction}
                    onChange={(e) => handleArrayFieldChange('medications', index, 'instruction', e.target.value)}
                  />
                </div>
                <Button type="button" onClick={() => removeArrayItem('medications', index)}>Xóa thuốc</Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem('medications')}>Thêm thuốc</Button>
          </div>

          {/* Summary */}
          <div className="form-section">
            <h4>Tóm tắt và hướng dẫn</h4>
            <div className="form-group">
              <label>Tóm tắt khám</label>
              <textarea
                value={formData.summaryText}
                onChange={(e) => handleInputChange('summaryText', e.target.value)}
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Phương pháp điều trị</label>
              <textarea
                value={formData.treatmentMethod}
                onChange={(e) => handleInputChange('treatmentMethod', e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Hướng dẫn theo dõi</label>
              <textarea
                value={formData.followUpInstruction}
                onChange={(e) => handleInputChange('followUpInstruction', e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Lịch hẹn tiếp theo</label>
              <Input
                type="date"
                value={formData.nextAppointmentDate}
                onChange={(e) => handleInputChange('nextAppointmentDate', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit">Xác nhận</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Consultation Advice Form Component (for online appointments)
function ConsultationAdviceForm({ appointment, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    videoUrl: "",
    appointmentDate: appointment?.scheduledStart ? new Date(appointment.scheduledStart).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    diagnoses: [{ name: "", icd10: "" }],
    medications: [{ name: "", dosage: "", route: "", quantity: "", instruction: "" }],
    attachmentUrl: "",
    notes: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field, index, subField, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  const addArrayItem = (field) => {
    const template = {
      diagnoses: { name: "", icd10: "" },
      medications: { name: "", dosage: "", route: "", quantity: "", instruction: "" }
    };
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template[field]]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      appointmentId: appointment._id,
      patientId: appointment.patientId?._id || appointment.patient?._id,
      doctorId: appointment.doctorId?._id || appointment.doctor?._id,
      clinicId: appointment.clinicId?._id || appointment.clinic?._id,
      ...formData,
      appointmentDate: new Date(formData.appointmentDate),
      createdBy: appointment.doctorId?._id || appointment.doctor?._id
    });
  };

  return (
    <div className="consultation-form-overlay" onClick={onClose}>
      <div className="consultation-form" onClick={(e) => e.stopPropagation()}>
        <div className="consultation-form-header">
          <h3>Tư vấn trực tuyến - {appointment?.patientId?.fullName || appointment?.patient?.fullName}</h3>
          <button className="consultation-form-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="consultation-form-content">
          {/* Patient Info */}
          <div className="form-section">
            <h4>Thông tin bệnh nhân</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Tên bệnh nhân</label>
                <Input 
                  value={appointment?.patientId?.fullName || appointment?.patient?.fullName || ""} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <Input 
                  value={appointment?.patientId?.phone || appointment?.patient?.phone || ""} 
                  disabled 
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <Input 
                  value={appointment?.patientId?.email || appointment?.patient?.email || ""} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <Input 
                  value={appointment?.patientId?.dob ? new Date(appointment.patientId.dob).toLocaleDateString('vi-VN') : ""} 
                  disabled 
                />
              </div>
            </div>
          </div>

          {/* Consultation Info */}
          <div className="form-section">
            <h4>Thông tin tư vấn</h4>
            <div className="form-row">
              <div className="form-group">
                <label>URL Video tư vấn</label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="Nhập URL video buổi tư vấn"
                />
              </div>
              <div className="form-group">
                <label>Ngày giờ slot khám</label>
                <Input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Diagnoses */}
          <div className="form-section">
            <h4>Chẩn đoán tham khảo</h4>
            {formData.diagnoses.map((diagnosis, index) => (
              <div key={index} className="form-row">
                <div className="form-group">
                  <label>Tên chẩn đoán</label>
                  <Input
                    value={diagnosis.name}
                    onChange={(e) => handleArrayFieldChange('diagnoses', index, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mã ICD-10</label>
                  <Input
                    value={diagnosis.icd10}
                    onChange={(e) => handleArrayFieldChange('diagnoses', index, 'icd10', e.target.value)}
                  />
                </div>
                <Button type="button" onClick={() => removeArrayItem('diagnoses', index)}>Xóa</Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem('diagnoses')}>Thêm chẩn đoán</Button>
          </div>

          {/* Medications */}
          <div className="form-section">
            <h4>Đơn thuốc (tùy chọn)</h4>
            {formData.medications.map((medication, index) => (
              <div key={index} className="medication-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên thuốc</label>
                    <Input
                      value={medication.name}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Liều lượng</label>
                    <Input
                      value={medication.dosage}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'dosage', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Đường dùng</label>
                    <Input
                      value={medication.route}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'route', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số lượng</label>
                    <Input
                      type="number"
                      value={medication.quantity}
                      onChange={(e) => handleArrayFieldChange('medications', index, 'quantity', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Hướng dẫn sử dụng</label>
                  <textarea
                    value={medication.instruction}
                    onChange={(e) => handleArrayFieldChange('medications', index, 'instruction', e.target.value)}
                  />
                </div>
                <Button type="button" onClick={() => removeArrayItem('medications', index)}>Xóa thuốc</Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem('medications')}>Thêm thuốc</Button>
          </div>

          {/* Additional Info */}
          <div className="form-section">
            <h4>Thông tin bổ sung</h4>
            <div className="form-group">
              <label>File đính kèm (URL)</label>
              <Input
                value={formData.attachmentUrl}
                onChange={(e) => handleInputChange('attachmentUrl', e.target.value)}
                placeholder="Nhập URL file đính kèm (PDF, ảnh hướng dẫn)"
              />
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Nhập ghi chú về buổi tư vấn..."
              />
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit">Xác nhận</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [updatingAppointments, setUpdatingAppointments] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [isConsultationFormOpen, setIsConsultationFormOpen] = useState(false)
  const [consultationFormType, setConsultationFormType] = useState(null) // 'summary' or 'advice'

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getDoctorAppointmentsWithFallback();
        
        if (response.success && response.data?.appointments) {
          setAppointments(response.data.appointments);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patientId?.phone?.includes(searchTerm) ||
    appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const getStatusIcon = (status) => {
    const icons = {
      "accepted": <CheckCircle className="w-4 h-4 text-white" />, // Xanh lá đậm
      "pending_doctor": <Clock className="w-4 h-4 text-white" />, // Vàng
      "rejected": <XCircle className="w-4 h-4 text-white" />, // Đỏ - Bác sĩ từ chối
      "cancelled": <XCircle className="w-4 h-4 text-white" />, // Cam - Bệnh nhân hủy
      "in_progress": <Clock className="w-4 h-4 text-white" />, // Xanh dương - Đang khám
      "done": <CheckCircle className="w-4 h-4 text-white" />, // Xanh lá - Hoàn thành
      "no_show": <XCircle className="w-4 h-4 text-white" />, // Xám - Không đến khám
      // Fallback for old status names
      "confirmed": <CheckCircle className="w-4 h-4 text-white" />,
      "pending": <Clock className="w-4 h-4 text-white" />,
      "completed": <CheckCircle className="w-4 h-4 text-white" />,
    }
    return icons[status] || null
  }

  const getStatusColor = (status) => {
    const colors = {
      "accepted": "!bg-green-500 !text-white", // Xanh lá đậm - Đã chấp nhận
      "pending_doctor": "!bg-purple-500 !text-white", // Tím - Chờ bác sĩ xác nhận
      "rejected": "!bg-red-500 !text-white", // Đỏ - Bác sĩ từ chối
      "cancelled": "!bg-orange-500 !text-white", // Cam - Bệnh nhân hủy
      "in_progress": "!bg-blue-500 !text-white", // Xanh dương - Đang khám
      "done": "!bg-emerald-500 !text-white", // Xanh lá - Hoàn thành
      "no_show": "!bg-gray-500 !text-white", // Xám - Không đến khám
      // Fallback for old status names
      "confirmed": "!bg-green-500 !text-white",
      "pending": "!bg-purple-500 !text-white",
      "completed": "!bg-emerald-500 !text-white",
    }
    return colors[status] || "!bg-gray-500 !text-white"
  }

  const getStatusText = (status) => {
    const statusMap = {
      "accepted": "Đã chấp nhận",
      "pending_doctor": "Chờ bác sĩ xác nhận", 
      "rejected": "Bác sĩ từ chối",
      "cancelled": "Bệnh nhân hủy",
      "in_progress": "Đang khám",
      "done": "Hoàn thành",
      "no_show": "Không đến khám",
      // Fallback for old status names
      "confirmed": "Đã xác nhận",
      "pending": "Chờ xác nhận", 
      "completed": "Hoàn thành",
    }
    return statusMap[status] || status
  }

  const handleAccept = async (appointment) => {
    setUpdatingAppointments(prev => new Set(prev).add(appointment._id));
    try {
      await updateAppointmentStatus(appointment._id, 'accepted');
      
      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointment._id 
            ? { ...apt, status: 'accepted' }
            : apt
        )
      );
      
      alert(`Đã chấp nhận lịch hẹn với ${appointment.patientId?.fullName || appointment.patient?.fullName || 'bệnh nhân'}`);
      
      // Refresh appointments list để đảm bảo đồng bộ
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (updatedAppointments.success && updatedAppointments.data?.appointments) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          // Silent error handling
        }
      }, 1000);
    } catch (error) {
      alert('Có lỗi xảy ra khi chấp nhận lịch hẹn: ' + error.message);
    } finally {
      setUpdatingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointment._id);
        return newSet;
      });
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailDialogOpen(true)
  }

  const handleReject = (appointment) => {
    setSelectedAppointment(appointment)
    setIsRejectDialogOpen(true)
  }

  const confirmReject = async () => {
    if (rejectionReason.trim() && selectedAppointment) {
      try {
        await updateAppointmentStatus(selectedAppointment._id, 'rejected', rejectionReason);
        
        // Cập nhật trạng thái ngay lập tức trong UI
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === selectedAppointment._id 
              ? { ...apt, status: 'rejected', rejectReason: rejectionReason }
              : apt
          )
        );
        
        alert(`Đã từ chối lịch hẹn với ${selectedAppointment.patientId?.fullName || selectedAppointment.patient?.fullName || 'bệnh nhân'}. Lý do: ${rejectionReason}`);
        
        setIsRejectDialogOpen(false);
        setRejectionReason("");
        
        // Refresh appointments list để đảm bảo đồng bộ
        setTimeout(async () => {
          try {
            const updatedAppointments = await getDoctorAppointmentsWithFallback();
            if (updatedAppointments.success && updatedAppointments.data?.appointments) {
              setAppointments(updatedAppointments.data.appointments);
            }
          } catch (error) {
            console.error('Error refreshing appointments:', error);
          }
        }, 1000);
      } catch (error) {
        alert('Có lỗi xảy ra khi từ chối lịch hẹn: ' + error.message);
      }
    }
  }

  const handleStart = async (appointment) => {
    try {
      await updateAppointmentStatus(appointment._id, 'in_progress');
      
      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointment._id 
            ? { ...apt, status: 'in_progress' }
            : apt
        )
      );
      
      alert(`Đã bắt đầu khám cho ${appointment.patientId?.fullName || appointment.patient?.fullName || 'bệnh nhân'}`);
      
      // Refresh appointments list để đảm bảo đồng bộ
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (updatedAppointments.success && updatedAppointments.data?.appointments) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          // Silent error handling
        }
      }, 1000);
    } catch (error) {
      alert('Có lỗi xảy ra khi bắt đầu khám: ' + error.message);
    }
  }

  const handleComplete = async (appointment) => {
    // Determine form type based on appointment mode
    const formType = appointment.mode === 'online' ? 'advice' : 'summary';
    
    // Set the appointment and form type
    setSelectedAppointment(appointment);
    setConsultationFormType(formType);
    setIsConsultationFormOpen(true);
  }

  const handleConsultationSubmit = async (formData) => {
    try {
      // Determine API endpoint based on form type
      const endpoint = consultationFormType === 'summary' 
        ? '/api/doctors/consultation-summary' 
        : '/api/doctors/consultation-advice';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save consultation data');
      }

      // Update appointment status to 'done'
      await updateAppointmentStatus(selectedAppointment._id, 'done');
      
      // Update UI
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === selectedAppointment._id 
            ? { ...apt, status: 'done' }
            : apt
        )
      );

      // Close form
      setIsConsultationFormOpen(false);
      setSelectedAppointment(null);
      setConsultationFormType(null);

      alert(`Đã hoàn thành và lưu hồ sơ khám cho ${selectedAppointment.patientId?.fullName || selectedAppointment.patient?.fullName || 'bệnh nhân'}`);
      
      // Refresh appointments list
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (updatedAppointments.success && updatedAppointments.data?.appointments) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          console.error('Error refreshing appointments:', error);
        }
      }, 1000);
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu hồ sơ khám: ' + error.message);
    }
  }

  const handleNoShow = async (appointment) => {
    try {
      await updateAppointmentStatus(appointment._id, 'no_show', 'Bệnh nhân không đến khám');
      
      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointment._id 
            ? { ...apt, status: 'no_show' }
            : apt
        )
      );
      
      alert(`Đã đánh dấu ${appointment.patientId?.fullName || appointment.patient?.fullName || 'bệnh nhân'} là không đến khám`);
      
      // Refresh appointments list để đảm bảo đồng bộ
      setTimeout(async () => {
        try {
          const updatedAppointments = await getDoctorAppointmentsWithFallback();
          if (updatedAppointments.success && updatedAppointments.data?.appointments) {
            setAppointments(updatedAppointments.data.appointments);
          }
        } catch (error) {
          // Silent error handling
        }
      }, 1000);
    } catch (error) {
      alert('Có lỗi xảy ra khi đánh dấu không đến khám: ' + error.message);
    }
  }


  return (
    <Card className="appointment-list-card">
      <CardHeader className="appointment-list-header">
        <div className="appointment-list-header-content">
          <CardTitle>Danh sách lịch hẹn</CardTitle>
          <div className="appointment-list-search">
            <Search className="appointment-list-search-icon" />
            <Input
              placeholder="    Tìm kiếm ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="appointment-list-search-input"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="appointment-list-content">
        <div className="appointment-list-table-wrapper">
          <table className="appointment-list-table">
            <thead className="appointment-list-thead">
              <tr className="appointment-list-header-row">
                <th className="appointment-list-th">Bệnh nhân</th>
                <th className="appointment-list-th">Ngày & Giờ</th>
                <th className="appointment-list-th">Loại</th>
                <th className="appointment-list-th">Lý do</th>
                <th className="appointment-list-th">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="appointment-list-tbody">
              {loading ? (
                <tr>
                  <td colSpan="5" className="appointment-list-td text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="appointment-list-td text-center">
                    Không có lịch hẹn nào
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="appointment-list-row">
                    <td className="appointment-list-td appointment-list-patient">
                      <span 
                        className="appointment-list-patient-name"
                        onClick={() => handleViewDetails(apt)}
                        style={{ cursor: 'pointer', color: '#000000' }}
                      >
                        {apt.patientId?.fullName || apt.patient?.fullName || 'N/A'}
                      </span>
                    </td>
                    <td className="appointment-list-td appointment-list-datetime">
                      {new Date(apt.scheduledStart).toLocaleDateString('vi-VN')} {new Date(apt.scheduledStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="appointment-list-td">
                      <Badge variant="outline">{apt.mode === 'online' ? 'Trực tuyến' : 'Trực tiếp'}</Badge>
                    </td>
                    <td className="appointment-list-td appointment-list-reason">
                      {apt.notes || apt.reason || 'N/A'}
                    </td>
                    <td className="appointment-list-td appointment-list-actions">
                      <div className="appointment-list-status-info">
                        <Badge className={getStatusColor(apt.status)} data-status={apt.status}>
                          <span className="appointment-list-status">
                            {getStatusIcon(apt.status)}
                            {getStatusText(apt.status)}
                          </span>
                        </Badge>
                      </div>
                      <div className="appointment-list-status-actions">
                      {apt.status === "pending_doctor" && (
                        <>
                          <Button 
                            size="sm" 
                            className="appointment-list-accept-btn" 
                            onClick={() => handleAccept(apt)}
                            disabled={updatingAppointments.has(apt._id)}
                          >
                            {updatingAppointments.has(apt._id) ? "Đang xử lý..." : "Chấp nhận"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleReject(apt)}
                            disabled={updatingAppointments.has(apt._id)}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      {apt.status === "accepted" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleStart(apt)}
                            disabled={updatingAppointments.has(apt._id)}
                          >
                            {updatingAppointments.has(apt._id) ? "Đang xử lý..." : "Bắt đầu khám"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleNoShow(apt)}
                            disabled={updatingAppointments.has(apt._id)}
                          >
                            {updatingAppointments.has(apt._id) ? "Đang xử lý..." : "Không đến khám"}
                          </Button>
                        </>
                      )}
                      {apt.status === "in_progress" && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleComplete(apt)}
                          disabled={updatingAppointments.has(apt._id)}
                        >
                          {updatingAppointments.has(apt._id) ? "Đang xử lý..." : "Hoàn thành"}
                        </Button>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Appointment Detail Dialog */}
      {isDetailDialogOpen && (
        <div className="appointment-detail-dialog-overlay" onClick={() => setIsDetailDialogOpen(false)}>
          <div className="appointment-detail-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="appointment-detail-dialog-header">
              <h3 className="appointment-detail-dialog-title">Chi tiết lịch hẹn</h3>
              <button 
                className="appointment-detail-dialog-close"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                ×
              </button>
            </div>
          {selectedAppointment && (
            <>
              <div className="appointment-detail">
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Bệnh nhân</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.patientId?.fullName || selectedAppointment.patient?.fullName || 'N/A'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Số điện thoại</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.patientId?.phone || selectedAppointment.patient?.phone || 'N/A'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Email</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.patientId?.email || selectedAppointment.patient?.email || 'N/A'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Ngày sinh</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.patientId?.dob ? 
                    new Date(selectedAppointment.patientId.dob).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Giới tính</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.patientId?.gender || selectedAppointment.patient?.gender || 'N/A'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Ngày & Giờ hẹn</p>
                <p className="appointment-detail-value">
                  {new Date(selectedAppointment.scheduledStart).toLocaleDateString('vi-VN')} {' '}
                  {new Date(selectedAppointment.scheduledStart).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Loại khám</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.appointmentType || 'Trực tiếp'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Lý do khám</p>
                <p className="appointment-detail-value">
                  {selectedAppointment.notes || selectedAppointment.reason || 'N/A'}
                </p>
              </div>
              <div className="appointment-detail-item">
                <p className="appointment-detail-label">Trạng thái hiện tại</p>
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  <span className="appointment-list-status">
                    {getStatusIcon(selectedAppointment.status)}
                    {getStatusText(selectedAppointment.status)}
                  </span>
                </Badge>
              </div>
              
              {/* Thay đổi trạng thái */}
              <div className="appointment-detail-actions">
                <h4>Thay đổi trạng thái</h4>
                <div className="appointment-status-buttons">
                  {selectedAppointment.status === "pending_doctor" && (
                    <>
                      <Button 
                        size="sm" 
                        className="appointment-list-accept-btn" 
                        onClick={() => {
                          handleAccept(selectedAppointment);
                          setIsDetailDialogOpen(false);
                        }}
                      >
                        Chấp nhận
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => {
                          handleReject(selectedAppointment);
                          setIsDetailDialogOpen(false);
                        }}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                  {selectedAppointment.status === "accepted" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await updateAppointmentStatus(selectedAppointment._id, 'in_progress');
                            alert('Đã bắt đầu khám bệnh');
                            setIsDetailDialogOpen(false);
                            // Refresh appointments
                            const updatedAppointments = await getDoctorAppointmentsWithFallback();
                            if (updatedAppointments.success && updatedAppointments.data?.appointments) {
                              setAppointments(updatedAppointments.data.appointments);
                            }
                          } catch (error) {
                            alert('Có lỗi xảy ra: ' + error.message);
                          }
                        }}
                      >
                        Bắt đầu khám
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={async () => {
                          try {
                            await updateAppointmentStatus(selectedAppointment._id, 'no_show', 'Bệnh nhân không đến khám');
                            alert('Đã đánh dấu bệnh nhân không đến khám');
                            setIsDetailDialogOpen(false);
                            // Refresh appointments
                            const updatedAppointments = await getDoctorAppointmentsWithFallback();
                            if (updatedAppointments.success && updatedAppointments.data?.appointments) {
                              setAppointments(updatedAppointments.data.appointments);
                            }
                          } catch (error) {
                            alert('Có lỗi xảy ra: ' + error.message);
                          }
                        }}
                      >
                        Không đến khám
                      </Button>
                    </>
                  )}
                  {selectedAppointment.status === "in_progress" && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await updateAppointmentStatus(selectedAppointment._id, 'done');
                          alert('Đã hoàn thành khám bệnh');
                          setIsDetailDialogOpen(false);
                          // Refresh appointments
                          const updatedAppointments = await getDoctorAppointmentsWithFallback();
                          if (updatedAppointments.success && updatedAppointments.data?.appointments) {
                            setAppointments(updatedAppointments.data.appointments);
                          }
                        } catch (error) {
                          alert('Có lỗi xảy ra: ' + error.message);
                        }
                      }}
                    >
                      Hoàn thành khám
                    </Button>
                  )}
                  {selectedAppointment.status === "done" && (
                    <p className="text-green-600 text-sm">Lịch hẹn đã hoàn thành</p>
                  )}
                  {selectedAppointment.status === "rejected" && (
                    <p className="text-red-600 text-sm">Bác sĩ đã từ chối lịch hẹn</p>
                  )}
                  {selectedAppointment.status === "no_show" && (
                    <p className="text-gray-600 text-sm">Bệnh nhân không đến khám</p>
                  )}
                </div>
              </div>
              </div>
              <div className="appointment-detail-dialog-footer">
                <Button onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* Reject Appointment Dialog */}
      {isRejectDialogOpen && (
        <div className="appointment-reject-dialog-overlay" onClick={() => setIsRejectDialogOpen(false)}>
          <div className="appointment-reject-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="appointment-reject-dialog-header">
              <h3 className="appointment-reject-dialog-title">Từ chối lịch hẹn</h3>
              <button 
                className="appointment-reject-dialog-close"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="appointment-reject">
              <div className="appointment-reject-item">
                <p className="appointment-reject-label">Bệnh nhân</p>
                <p className="appointment-reject-value">
                  {selectedAppointment?.patientId?.fullName || selectedAppointment?.patient?.fullName || 'N/A'}
                </p>
              </div>
              <div className="appointment-reject-field">
                <label className="appointment-reject-field-label">Lý do từ chối (bắt buộc)</label>
                <textarea
                  placeholder="Nhập lý do từ chối..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="appointment-reject-field-input"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "100px"
                  }}
                />
              </div>
              <div className="appointment-reject-actions">
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="appointment-reject-cancel"
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim() || updatingAppointments.has(selectedAppointment?._id)}
                  className="appointment-reject-confirm"
                >
                  {updatingAppointments.has(selectedAppointment?._id) ? "Đang từ chối..." : "Xác nhận từ chối"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Forms */}
      {isConsultationFormOpen && consultationFormType === 'summary' && (
        <ConsultationSummaryForm
          appointment={selectedAppointment}
          onClose={() => {
            setIsConsultationFormOpen(false);
            setSelectedAppointment(null);
            setConsultationFormType(null);
          }}
          onSubmit={handleConsultationSubmit}
        />
      )}

      {isConsultationFormOpen && consultationFormType === 'advice' && (
        <ConsultationAdviceForm
          appointment={selectedAppointment}
          onClose={() => {
            setIsConsultationFormOpen(false);
            setSelectedAppointment(null);
            setConsultationFormType(null);
          }}
          onSubmit={handleConsultationSubmit}
        />
      )}
    </Card>
  )
}
