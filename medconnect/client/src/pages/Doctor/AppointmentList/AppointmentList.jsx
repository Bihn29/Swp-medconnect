import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { Input } from "../../../components/ui/Input"
import { getDoctorAppointmentsWithFallback, updateAppointmentStatus } from "../../../lib/api"
// Dialog components không tồn tại, sẽ sử dụng HTML elements thay thế
import "./AppointmentList.scss"

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [updatingAppointments, setUpdatingAppointments] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState("")

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
      "accepted": <CheckCircle className="w-4 h-4 text-green-600" />,
      "pending_doctor": <Clock className="w-4 h-4 text-yellow-600" />,
      "rejected": <XCircle className="w-4 h-4 text-red-600" />,
      "cancelled": <XCircle className="w-4 h-4 text-red-600" />,
      "in_progress": <Clock className="w-4 h-4 text-blue-600" />,
      "done": <CheckCircle className="w-4 h-4 text-green-600" />,
      "no_show": <XCircle className="w-4 h-4 text-gray-600" />,
      // Fallback for old status names
      "confirmed": <CheckCircle className="w-4 h-4 text-green-600" />,
      "pending": <Clock className="w-4 h-4 text-yellow-600" />,
      "completed": <CheckCircle className="w-4 h-4 text-blue-600" />,
    }
    return icons[status] || null
  }

  const getStatusColor = (status) => {
    const colors = {
      "accepted": "bg-green-100 text-green-800",
      "pending_doctor": "bg-yellow-100 text-yellow-800",
      "rejected": "bg-red-100 text-red-800",
      "cancelled": "bg-red-100 text-red-800",
      "in_progress": "bg-blue-100 text-blue-800",
      "done": "bg-green-100 text-green-800",
      "no_show": "bg-gray-100 text-gray-800",
      // Fallback for old status names
      "confirmed": "bg-green-100 text-green-800",
      "pending": "bg-yellow-100 text-yellow-800",
      "completed": "bg-blue-100 text-blue-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    const statusMap = {
      "accepted": "Đã chấp nhận",
      "pending_doctor": "Chờ bác sĩ xác nhận", 
      "rejected": "Bác sĩ từ chối",
      "cancelled": "Đã hủy",
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
    try {
      await updateAppointmentStatus(appointment._id, 'done');
      
      // Cập nhật trạng thái ngay lập tức trong UI
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointment._id 
            ? { ...apt, status: 'done' }
            : apt
        )
      );
      
      alert(`Đã hoàn thành khám cho ${appointment.patientId?.fullName || appointment.patient?.fullName || 'bệnh nhân'}`);
      
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
      alert('Có lỗi xảy ra khi hoàn thành khám: ' + error.message);
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
                        <Badge className={getStatusColor(apt.status)}>
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
                      {(apt.status === "done" || apt.status === "rejected" || apt.status === "no_show") && (
                        <span className="text-sm text-gray-500">
                          {apt.status === "done" && "Đã hoàn thành"}
                          {apt.status === "rejected" && "Đã từ chối"}
                          {apt.status === "no_show" && "Không đến khám"}
                        </span>
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
    </Card>
  )
}
