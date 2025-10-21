import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Textarea } from "../../../components/ui/Textarea"
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select"
import "./ScheduleCalendar.scss"

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSlotDetailOpen, setIsSlotDetailOpen] = useState(false)
  const [slotDetail, setSlotDetail] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    patientPhone: "",
    appointmentType: "offline",
    reason: "",
    notes: "",
  })

  // Fetch time slots and appointments from API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // Fetch time slots
        const slotsResponse = await fetch('http://localhost:3000/api/doctors/me/time-slots', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (slotsResponse.ok) {
          const slotsData = await slotsResponse.json();
          if (slotsData.success && slotsData.data?.timeSlots) {
            const slots = slotsData.data.timeSlots.map(slot => slot.time);
            setTimeSlots(slots);
          }
        }

        // Fetch appointments for current date
        const dateStr = currentDate.toISOString().split('T')[0];
        const appointmentsResponse = await fetch(`http://localhost:3000/api/doctors/me/appointments?date=${dateStr}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          if (appointmentsData.success && appointmentsData.data?.appointments) {
            setAppointments(appointmentsData.data.appointments);
          }
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [currentDate]);
    "18:00",
  ]

  const vietnameseDays = ["CHỦ NHẬT", "THỨ 2", "THỨ 3", "THỨ 4", "THỨ 5", "THỨ 6", "THỨ 7"]

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const slots = {
    "2025-10-13": [
      { time: "09:00", status: "confirmed", patient: "Nguyễn Văn A", reason: "Khám tổng quát" },
      { time: "10:00", status: "available" },
      { time: "11:00", status: "pending", patient: "Trần Thị B", reason: "Tư vấn" },
      { time: "14:00", status: "available" },
      { time: "15:00", status: "off", reason: "Nghỉ trưa" },
    ],
    "2025-10-14": [
      { time: "09:00", status: "available" },
      { time: "10:00", status: "confirmed", patient: "Lê Minh C", reason: "Khám tổng quát" },
      { time: "11:00", status: "available" },
      {
        time: "14:00",
        status: "cancelled",
        patient: "Phạm Hồng D",
        reason: "Khám",
        cancellationReason: "Bệnh nhân hủy lịch",
      },
    ],
    "2025-10-15": [
      { time: "08:00", status: "completed", patient: "Vũ Thị E", reason: "Khám tổng quát" },
      { time: "09:00", status: "available" },
      { time: "14:00", status: "confirmed", patient: "Hoàng Văn F", reason: "Tư vấn" },
    ],
  }

  const getSlotColor = (status) => {
    const colors = {
      confirmed: "slot-confirmed",
      pending: "slot-pending",
      cancelled: "slot-cancelled",
      completed: "slot-completed",
      off: "slot-off",
      available: "slot-available",
      booked: "slot-booked",
    }
    return colors[status] || "slot-default"
  }

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: "Đã xác nhận",
      pending: "Chờ xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
      off: "Nghỉ",
      available: "Có sẵn",
    }
    return labels[status] || status
  }

  const formatDateRange = () => {
    const startDate = startOfWeek.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    const endDate = weekDates[6].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    return `${startDate} - ${endDate}`
  }

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleSlotClick = (date, time, slot) => {
    if (slot && slot.status !== "available") {
      setSlotDetail({ ...slot, date, time })
      setIsSlotDetailOpen(true)
    } else {
      setSelectedSlot({ date, time })
      setIsDialogOpen(true)
    }
  }

  const handleBookAppointment = () => {
    if (newAppointment.patientName && selectedSlot) {
      console.log("Booking appointment:", { ...newAppointment, ...selectedSlot })
      setIsDialogOpen(false)
      setNewAppointment({ patientName: "", patientPhone: "", appointmentType: "offline", reason: "", notes: "" })
    }
  }

  const handleApproveAll = () => {
    const pendingCount = Object.values(slots)
      .flat()
      .filter((s) => s.status === "pending").length
    if (pendingCount > 0) {
      console.log(`Approving ${pendingCount} pending appointments`)
      alert(`Đã duyệt ${pendingCount} lịch hẹn chờ xác nhận`)
    } else {
      alert("Không có lịch hẹn nào chờ xác nhận")
    }
  }

  return (
    <div className="schedule-calendar">
      <div className="schedule-calendar-controls">
        <div className="schedule-calendar-search">
          <Search className="schedule-calendar-search-icon" />
          <Input
            placeholder="Tìm kiếm bệnh nhân, ghi chú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="schedule-calendar-search-input"
          />
        </div>
        <Button onClick={handleApproveAll} className="schedule-calendar-approve-btn">
          Duyệt tất cả
        </Button>
      </div>

      <div className="schedule-calendar-header">
        <div className="schedule-calendar-header-nav">
          <Button variant="ghost" size="sm" onClick={handlePrevWeek} className="schedule-calendar-nav-btn">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="schedule-calendar-header-info">
            <p className="schedule-calendar-header-label">Tuần</p>
            <p className="schedule-calendar-header-date">{formatDateRange()}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNextWeek} className="schedule-calendar-nav-btn">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="schedule-calendar-legend">
          <span className="schedule-calendar-legend-item legend-pending">
            <span className="legend-dot"></span>
            Chờ xác nhận
          </span>
          <span className="schedule-calendar-legend-item legend-confirmed">
            <span className="legend-dot"></span>
            Đã xác nhận
          </span>
          <span className="schedule-calendar-legend-item legend-cancelled">
            <span className="legend-dot"></span>
            Đã hủy
          </span>
          <span className="schedule-calendar-legend-item legend-completed">
            <span className="legend-dot"></span>
            Hoàn thành
          </span>
          <span className="schedule-calendar-legend-item legend-off">
            <span className="legend-dot"></span>
            Nghỉ
          </span>
        </div>
      </div>

      <div className="schedule-calendar-grid">
        <div className="schedule-calendar-table">
          <div className="schedule-calendar-table-header">
            <div className="schedule-calendar-time-col">
              <p className="schedule-calendar-time-label">Giờ</p>
            </div>
            {weekDates.map((date, i) => (
              <div key={i} className="schedule-calendar-day-col">
                <p className="schedule-calendar-day-name">{vietnameseDays[date.getDay()]}</p>
                <p className="schedule-calendar-day-date">
                  {date.getDate()}/{date.getMonth() + 1}
                </p>
              </div>
            ))}
          </div>

          {timeSlots.map((time) => (
            <div key={time} className="schedule-calendar-time-row">
              <div className="schedule-calendar-time-cell">
                <p className="schedule-calendar-time">{time}</p>
              </div>
              {weekDates.map((date, i) => {
                const dateStr = date.toISOString().split("T")[0]
                const daySlots = slots[dateStr] || []
                const slot = daySlots.find((s) => s.time === time)

                return (
                  <div key={i} className="schedule-calendar-slot-cell">
                    {slot ? (
                      <div
                        className={`schedule-calendar-slot ${getSlotColor(slot.status)}`}
                        onClick={() => handleSlotClick(dateStr, time, slot)}
                        title={slot.patient ? `${slot.patient} - ${slot.reason}` : ""}
                      >
                        {slot.status === "available" && <Plus className="w-3 h-3 mx-auto" />}
                        {slot.status !== "available" && (
                          <>
                            <div className="slot-status">{getStatusLabel(slot.status)}</div>
                            {slot.patient && <div className="slot-patient">{slot.patient}</div>}
                          </>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="schedule-calendar-empty-slot"
                        onClick={() => handleSlotClick(dateStr, time)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isSlotDetailOpen} onOpenChange={setIsSlotDetailOpen}>
        <DialogContent className="schedule-calendar-slot-dialog">
          <DialogHeader>
            <DialogTitle>Thông tin lịch hẹn</DialogTitle>
          </DialogHeader>
          {slotDetail && (
            <div className="slot-detail-content">
              <div className="slot-detail-item">
                <p className="slot-detail-label">Thời gian</p>
                <p className="slot-detail-value">
                  {new Date(slotDetail.date).toLocaleDateString("vi-VN")} - {slotDetail.time}
                </p>
              </div>
              <div className="slot-detail-item">
                <p className="slot-detail-label">Trạng thái</p>
                <p className="slot-detail-value">{getStatusLabel(slotDetail.status)}</p>
              </div>
              {slotDetail.patient && (
                <div className="slot-detail-item">
                  <p className="slot-detail-label">Bệnh nhân</p>
                  <p className="slot-detail-value">{slotDetail.patient}</p>
                </div>
              )}
              {slotDetail.reason && (
                <div className="slot-detail-item">
                  <p className="slot-detail-label">Lý do</p>
                  <p className="slot-detail-value">{slotDetail.reason}</p>
                </div>
              )}
              {slotDetail.cancellationReason && (
                <div className="slot-detail-item">
                  <p className="slot-detail-label">Lý do hủy</p>
                  <p className="slot-detail-value">{slotDetail.cancellationReason}</p>
                </div>
              )}
              <Button onClick={() => setIsSlotDetailOpen(false)} className="slot-detail-close-btn">
                Đóng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="schedule-calendar-appointment-dialog">
          <DialogHeader>
            <DialogTitle>Đặt lịch hẹn mới</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="appointment-form">
              <div className="appointment-form-item">
                <p className="appointment-form-label">Thời gian đã chọn</p>
                <p className="appointment-form-value">
                  {new Date(selectedSlot.date).toLocaleDateString("vi-VN")} - {selectedSlot.time}
                </p>
              </div>

              <div className="appointment-form-field">
                <label className="appointment-form-field-label">Tên bệnh nhân</label>
                <Input
                  placeholder="Nhập tên bệnh nhân"
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                  className="appointment-form-field-input"
                />
              </div>

              <div className="appointment-form-field">
                <label className="appointment-form-field-label">Số điện thoại</label>
                <Input
                  placeholder="Nhập số điện thoại"
                  value={newAppointment.patientPhone}
                  onChange={(e) => setNewAppointment({ ...newAppointment, patientPhone: e.target.value })}
                  className="appointment-form-field-input"
                />
              </div>

              <div className="appointment-form-field">
                <label className="appointment-form-field-label">Loại khám</label>
                <Select
                  value={newAppointment.appointmentType}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, appointmentType: value })}
                >
                  <SelectTrigger className="appointment-form-field-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Trực tiếp</SelectItem>
                    <SelectItem value="online">Trực tuyến</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="appointment-form-field">
                <label className="appointment-form-field-label">Lý do khám</label>
                <Input
                  placeholder="Nhập lý do khám"
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                  className="appointment-form-field-input"
                />
              </div>

              <div className="appointment-form-field">
                <label className="appointment-form-field-label">Ghi chú</label>
                <Textarea
                  placeholder="Ghi chú thêm (tùy chọn)"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  className="appointment-form-field-input"
                  rows={3}
                />
              </div>

              <div className="appointment-form-actions">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="appointment-form-cancel">
                  Hủy
                </Button>
                <Button onClick={handleBookAppointment} className="appointment-form-submit">
                  Đặt lịch
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
