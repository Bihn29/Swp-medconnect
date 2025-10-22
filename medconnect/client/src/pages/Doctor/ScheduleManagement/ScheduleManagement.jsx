import { useState, useEffect } from "react";
import { Clock, Send, ChevronLeft, ChevronRight, Plus, Search, Calendar, Filter } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select";
import { useDoctorTimeSlots } from "../../../hooks/useDoctor";
import "./ScheduleManagement.scss";

export default function ScheduleManagement() {
  const { timeSlots, loading, error, refetch, autoGenerateTimeSlots } = useDoctorTimeSlots();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("week");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Leave request states
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Booking states
  const [showBookSlot, setShowBookSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    patientName: "",
    patientPhone: "",
    reason: "",
    type: "online",
  });

  // Appointments states
  const [appointments, setAppointments] = useState([]);

  // Fetch appointments for current date
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
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
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [currentDate]);

  const handleLeaveRequest = async () => {
    if (leaveData.startDate && leaveData.endDate && leaveData.reason) {
      try {
        const response = await fetch("/api/doctors/me/leave-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(leaveData),
        });

        if (response.ok) {
          alert("Đã gửi yêu cầu lịch nghỉ cho admin. Vui lòng chờ duyệt.");
          setLeaveData({ startDate: "", endDate: "", reason: "" });
          setShowLeaveRequest(false);
        } else {
          throw new Error("Failed to submit leave request");
        }
      } catch (error) {
        console.error("Error submitting leave request:", error);
        alert("Có lỗi xảy ra khi gửi yêu cầu lịch nghỉ");
      }
    }
  };

  const handleBookSlot = async () => {
    if (selectedSlot && bookingData.patientName && bookingData.patientPhone) {
      try {
        const response = await fetch("/api/doctors/me/time-slots/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...selectedSlot,
            ...bookingData,
          }),
        });

        if (response.ok) {
          alert(`Đã đặt slot cho ${bookingData.patientName}`);
          setShowBookSlot(false);
          setSelectedSlot(null);
          setBookingData({ patientName: "", patientPhone: "", reason: "", type: "online" });
          await refetch();
        } else {
          throw new Error("Failed to book slot");
        }
      } catch (error) {
        console.error("Error booking slot:", error);
        alert("Có lỗi xảy ra khi đặt slot");
      }
    }
  };

  const handleAutoGenerateSlots = async () => {
    console.log("🚀 Auto-generate slots button clicked!");
    try {
      const result = await autoGenerateTimeSlots(30); // Generate for 30 days
      console.log("Auto-generated slots:", result);
      alert(`Đã tạo ${result.createdSlots} slot mới cho 30 ngày tới!`);
    } catch (error) {
      console.error("Error auto-generating slots:", error);
      alert("Có lỗi khi tạo slot tự động: " + error.message);
    }
  };

  const handleSlotClick = (date, time, slot) => {
    if (slot && slot.status !== "available") {
      // Show slot details
      alert(`Slot: ${slot.patientName || "Trống"} - ${slot.status}`);
    } else {
      // Book new slot
      setSelectedSlot({ date, time });
      setShowBookSlot(true);
    }
  };

  const getWeekDates = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      weekDates.push(new Date(d));
    }
    return weekDates;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }
    return days
  };

  const weekDates = getWeekDates(new Date(currentDate));
  const monthDays = getDaysInMonth(currentDate);
  
  const timeSlotsList = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00",
  ];

  const formatDate = (date) => date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const getDayName = (date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  const getSlotForDateTime = (dayIdx, time) => {
    const dateStr = formatDate(weekDates[dayIdx]);
    return timeSlots?.find((s) => {
      const slotDate = new Date(s.startAt);
      return formatDate(slotDate) === dateStr && slotDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) === time;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return { bg: "bg-yellow-400", hover: "hover:bg-yellow-500", text: "Chờ xác nhận" };
      case "confirmed":
        return { bg: "bg-green-500", hover: "hover:bg-green-600", text: "Đã xác nhận" };
      case "cancelled":
        return { bg: "bg-red-500", hover: "hover:bg-red-600", text: "Hủy" };
      case "completed":
        return { bg: "bg-blue-500", hover: "hover:bg-blue-600", text: "Hoàn thành" };
      case "leave":
        return { bg: "bg-orange-500", hover: "hover:bg-orange-600", text: "Nghỉ" };
      default:
        return { bg: "bg-gray-200", hover: "hover:bg-gray-300", text: "Trống" };
    }
  };

  // Helper functions for horizontal layout
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
  };

  const getWeekEnd = (date) => {
    const end = new Date(date);
    end.setDate(end.getDate() + (6 - end.getDay()));
    return end;
  };

  const getWeekDays = () => {
    const start = getWeekStart(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push({
        name: day.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullDate: day.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: '',
        fullDate: '',
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      days.push({
        date: day.toString(),
        fullDate: date.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return days;
  };

  const getTimeSlotsForDay = (date) => {
    if (!timeSlots) return [];
    
    const daySlots = timeSlots.filter(slot => {
      const slotDate = new Date(slot.startAt).toISOString().split('T')[0];
      return slotDate === date;
    });

    return daySlots.map(slot => ({
      id: slot._id,
      time: new Date(slot.startAt).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: slot.status,
      patientName: slot.patientName || null
    }));
  };

  const getTodaySlots = () => {
    const today = new Date().toISOString().split('T')[0];
    return getTimeSlotsForDay(today);
  };

  if (loading) {
    return (
      <div className="schedule-management-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải lịch làm việc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-management-error">
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="schedule-management">
      {/* Header - Glass Effect */}
      <div className="schedule-header">
        <div className="schedule-title">
          <Calendar className="title-icon" />
          <h1>Quản lý lịch làm việc</h1>
        </div>
        
        {/* Navigation Controls */}
        <div className="header-navigation">
          <div className="view-toggle-header">
            <Button
              variant={viewType === "week" ? "primary" : "outline"}
              onClick={() => setViewType("week")}
              size="sm"
              className={viewType === "week" ? "active" : ""}
            >
              Tuần
            </Button>
            <Button
              variant={viewType === "day" ? "primary" : "outline"}
              onClick={() => setViewType("day")}
              size="sm"
              className={viewType === "day" ? "active" : ""}
            >
              Ngày
            </Button>
          </div>
          
          <div className="week-selector">
            <Button
              variant={viewType === "week" ? "primary" : "outline"}
              onClick={() => setViewType("week")}
              size="sm"
              className={viewType === "week" ? "active" : ""}
            >
              Tuần
            </Button>
            <Button
              variant={viewType === "day" ? "primary" : "outline"}
              onClick={() => setViewType("day")}
              size="sm"
              className={viewType === "day" ? "active" : ""}
            >
              Ngày
            </Button>
          </div>
          
          {/* Status Legend */}
          <div className="status-legend">
            <span className="legend-label">Trạng thái:</span>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-dot pending"></div>
                <span>Chờ xác nhận</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot confirmed"></div>
                <span>Đã xác nhận</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot cancelled"></div>
                <span>Đã hủy</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot completed"></div>
                <span>Hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="schedule-actions">
          <Button 
            onClick={handleAutoGenerateSlots}
            className="auto-generate-btn"
            variant="success"
          >
            🚀 Tạo slot tự động
          </Button>
          <Button 
            onClick={() => setShowLeaveRequest(true)}
            className="leave-request-btn"
            variant="warning"
          >
            📅 Lịch nghỉ
          </Button>
        </div>
      </div>

      {/* Main Content - Calendar Only */}
      <div className="schedule-main-horizontal">
        {/* Calendar Content */}
        <div className="schedule-content">
          {/* Calendar View */}
          <Card className="calendar-card">
            <div className="calendar-container">
              {viewType === "week" ? (
                <div className="week-view">
                  {/* Header with days horizontally */}
                  <div className="week-header">
                    <div className="time-label">Giờ</div>
                    {getWeekDays().map((day, index) => (
                      <div key={index} className="day-header">
                        <div className="day-name">{day.name}</div>
                        <div className="day-date">{day.date}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid with time slots as rows and days as columns */}
                  <div className="week-grid">
                    {timeSlotsList.map((time, timeIndex) => (
                      <div key={timeIndex} className="time-row">
                        {/* Time label */}
                        <div className="time-label">
                          {time}
                        </div>
                        
                        {/* Day slots for this time */}
                        {getWeekDays().map((day, dayIndex) => {
                          const slot = getTimeSlotsForDay(day.fullDate).find(s => s.time === time);
                          return (
                            <div
                              key={dayIndex}
                              className={`time-slot ${slot ? slot.status : 'available'}`}
                              onClick={() => handleSlotClick(day.fullDate, time, slot)}
                            >
                              <div className="slot-status">
                                {slot ? (
                                  <>
                                    {slot.status === 'available' && <span className="status-dot available"></span>}
                                    {slot.status === 'booked' && <span className="status-dot booked"></span>}
                                    {slot.status === 'blocked' && <span className="status-dot blocked"></span>}
                                  </>
                                ) : (
                                  <span className="status-dot available"></span>
                                )}
                              </div>
                              {slot && slot.patientName && (
                                <div className="slot-patient">{slot.patientName}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="month-view">
                  <div className="month-grid">
                    {getMonthDays().map((day, index) => (
                      <div
                        key={index}
                        className={`month-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''}`}
                      >
                        <div className="day-number">{day.date}</div>
                        <div className="day-slots">
                          {getTimeSlotsForDay(day.fullDate).slice(0, 3).map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              className={`mini-slot ${slot.status}`}
                              title={`${slot.time} - ${slot.patientName || 'Trống'}`}
                            >
                              {slot.status === 'booked' && <span className="mini-dot booked"></span>}
                              {slot.status === 'blocked' && <span className="mini-dot blocked"></span>}
                            </div>
                          ))}
                          {getTimeSlotsForDay(day.fullDate).length > 3 && (
                            <div className="more-slots">+{getTimeSlotsForDay(day.fullDate).length - 3}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Leave Request Dialog */}
      <Dialog open={showLeaveRequest} onOpenChange={setShowLeaveRequest}>
        <DialogContent className="leave-request-dialog">
          <DialogHeader>
            <DialogTitle>Yêu cầu lịch nghỉ</DialogTitle>
          </DialogHeader>
          <div className="leave-form">
            <p className="leave-description">Gửi yêu cầu lịch nghỉ cho admin để duyệt</p>
            <div className="form-grid">
              <div className="form-group">
                <label>Từ ngày</label>
                <Input
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Đến ngày</label>
                <Input
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Lý do</label>
                <textarea
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  placeholder="Lý do xin nghỉ"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>
            </div>
            <div className="form-actions">
              <Button onClick={handleLeaveRequest} className="submit-btn">
                <Send size={16} />
                Gửi yêu cầu
              </Button>
              <Button onClick={() => setShowLeaveRequest(false)} variant="outline">
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Booking Modal */}
      <Dialog open={showBookSlot} onOpenChange={setShowBookSlot}>
        <DialogContent className="booking-dialog">
          <DialogHeader>
            <DialogTitle>Đặt slot cho bệnh nhân</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="booking-form">
              <div className="booking-info">
                <p>Ngày: {selectedSlot.date} - Giờ: {selectedSlot.time}</p>
              </div>
              
              <div className="form-field">
                <label>Tên bệnh nhân</label>
                <Input
                  placeholder="Nhập tên bệnh nhân"
                  value={bookingData.patientName}
                  onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                />
              </div>
              
              <div className="form-field">
                <label>Số điện thoại</label>
                <Input
                  placeholder="Nhập số điện thoại"
                  value={bookingData.patientPhone}
                  onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                />
              </div>
              
              <div className="form-field">
                <label>Loại khám</label>
                <Select
                  value={bookingData.type}
                  onValueChange={(value) => setBookingData({ ...bookingData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="form-field">
                <label>Lý do khám</label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  placeholder="Nhập lý do khám"
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <Button onClick={handleBookSlot} className="submit-btn">
                  Đặt slot
                </Button>
                <Button onClick={() => setShowBookSlot(false)} variant="outline">
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}