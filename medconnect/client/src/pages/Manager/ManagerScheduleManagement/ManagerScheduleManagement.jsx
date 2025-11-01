import React, { useState, useEffect, useCallback } from "react";
import { Clock, Calendar, RefreshCw, Phone, User, Search } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { api } from "../../../lib/api";
import "./ManagerScheduleManagement.scss";

export default function ManagerScheduleManagement() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [selectedSpecializationId, setSelectedSpecializationId] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Booking states
  const [showBookSlot, setShowBookSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingData, setBookingData] = useState({
    patientName: "",
    patientPhone: "",
    reason: "",
    mode: "online",
  });

  // Appointment detail modal states
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] =
    useState(null);
  const [loadingAppointmentDetail, setLoadingAppointmentDetail] =
    useState(false);

  // Load specializations on mount
  useEffect(() => {
    loadSpecializations();
  }, []);

  const loadDoctors = useCallback(async () => {
    // Only load if at least one filter is applied
    const hasNameFilter = searchName.trim().length > 0;
    const hasSpecializationFilter = selectedSpecializationId.length > 0;

    if (!hasNameFilter && !hasSpecializationFilter) {
      // No filters applied, clear doctors list
      setDoctors([]);
      setLoadingDoctors(false);
      return;
    }

    try {
      setLoadingDoctors(true);
      const params = new URLSearchParams();

      // Add specialization filter if selected
      if (selectedSpecializationId) {
        params.append("specializationId", selectedSpecializationId);
      }

      // Add name search if provided
      if (searchName.trim()) {
        params.append("name", searchName.trim());
      }

      const url = `/api/managers/doctors?${params.toString()}`;
      console.log("[Manager] Loading doctors with URL:", url);
      console.log("[Manager] Search name:", searchName);
      console.log("[Manager] Specialization ID:", selectedSpecializationId);

      const response = await api.get(url);
      if (response.success) {
        console.log(
          "[Manager] Received doctors:",
          response.data.doctors?.length || 0
        );
        setDoctors(response.data.doctors || []);
      } else {
        console.error("[Manager] Failed to load doctors:", response);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoadingDoctors(false);
    }
  }, [searchName, selectedSpecializationId]);

  // Load doctors when filters change (with debounce for search)
  useEffect(() => {
    // Load doctors when search name or specialization changes
    // loadDoctors will only load if at least one filter is applied
    const timer = setTimeout(
      () => {
        loadDoctors();
      },
      searchName ? 500 : 0
    ); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [searchName, selectedSpecializationId, loadDoctors]);

  // Reset selected doctor if current selection is not in filtered list after doctors are loaded
  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0) {
      const isStillAvailable = doctors.some((d) => d._id === selectedDoctorId);
      if (!isStillAvailable) {
        setSelectedDoctorId(null);
      }
    }
  }, [doctors, selectedDoctorId]);

  // Load time slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId) {
      loadTimeSlots();
    } else {
      setTimeSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId, currentDate]);

  const loadSpecializations = async () => {
    try {
      const response = await api.getAllSpecializations({ limit: 100 });
      if (response.success) {
        setSpecializations(response.data || []);
      }
    } catch (error) {
      console.error("Error loading specializations:", error);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + 1;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekRange = () => {
    const start = getWeekStart(currentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const getWeekDays = () => {
    const start = getWeekStart(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const date = String(day.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${date}`;

      const dayInfo = {
        name: day.toLocaleDateString("vi-VN", { weekday: "short" }),
        date: day.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        fullDate: fullDate,
        isToday: day.getTime() === today.getTime(),
        isPast: day < today,
      };
      days.push(dayInfo);
    }
    return days;
  };

  const formatDateRange = () => {
    const startDate = getWeekStart(currentDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const endDate = new Date(
      getWeekStart(currentDate).getTime() + 6 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${startDate} - ${endDate}`;
  };

  const loadTimeSlots = async () => {
    if (!selectedDoctorId) return;

    try {
      setLoading(true);
      const weekRange = getWeekRange();
      const response = await api.get(
        `/api/managers/doctors/${selectedDoctorId}/time-slots?startDate=${weekRange.startDate}&endDate=${weekRange.endDate}&limit=1000`
      );

      if (response.success && response.data && response.data.slots) {
        setTimeSlots(response.data.slots);
      } else {
        setTimeSlots([]);
      }
    } catch (error) {
      console.error("Error loading time slots:", error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Process slots similar to ScheduleManagement
  const processedSlots = React.useMemo(() => {
    const slotsMap = {};
    const timesSet = new Set();

    timeSlots.forEach((slot) => {
      const slotDate = new Date(slot.startAt).toISOString().split("T")[0];
      const slotTime = new Date(slot.startAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const hour = parseInt(slotTime.split(":")[0]);
      if (hour >= 17) return;

      timesSet.add(slotTime);

      if (!slotsMap[slotDate]) {
        slotsMap[slotDate] = {};
      }

      const mappedSlot = {
        id: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: slot.status,
        patientName: slot.patientName || null,
        reason: slot.reason || null,
        mode: slot.mode || null,
        appointmentId: slot.appointmentId || null,
        isEmpty: false,
      };

      if (!slotsMap[slotDate][slotTime]) {
        slotsMap[slotDate][slotTime] = mappedSlot;
      }
    });

    return { slotsMap, timesSet };
  }, [timeSlots, currentDate]);

  const timeSlotsList = React.useMemo(() => {
    return Array.from(processedSlots.timesSet || []).sort();
  }, [processedSlots]);

  const daysWithSlots = React.useMemo(() => {
    return getWeekDays();
  }, [currentDate]);

  const timesWithSlots = React.useMemo(() => {
    return timeSlotsList;
  }, [timeSlotsList]);

  const stats = React.useMemo(() => {
    const counts = {
      pending: 0,
      completed: 0,
      booked: 0,
      cancelled: 0,
    };

    timeSlots.forEach((slot) => {
      if (slot.status === "pending" || slot.status === "pending_doctor")
        counts.pending++;
      else if (slot.status === "completed" || slot.status === "done")
        counts.completed++;
      else if (
        slot.status === "booked" ||
        slot.status === "confirmed" ||
        slot.status === "accepted"
      )
        counts.booked++;
      else if (slot.status === "cancelled") counts.cancelled++;
    });

    return counts;
  }, [timeSlots]);

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#f3f4f6";
      case "pending":
        return "#fbbf24";
      case "confirmed":
        return "#10b981";
      case "in_progress":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      case "completed":
        return "#3b82f6";
      case "booked":
        return "#10b981";
      case "blocked":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Không xác định";

    switch (status) {
      case "pending_doctor":
        return "Chờ duyệt";
      case "accepted":
        return "Đã xác nhận";
      case "rejected":
        return "Đã từ chối";
      case "in_progress":
        return "Đang diễn ra";
      case "cancelled":
        return "Đã hủy";
      case "done":
        return "Hoàn thành";
      case "no_show":
        return "Không đến";
      case "rescheduled":
        return "Đã dời lịch";
      case "available":
        return "Trống";
      case "pending":
        return "Chờ duyệt";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Hoàn thành";
      case "booked":
        return "Đã đặt";
      case "blocked":
        return "Bị chặn";
      default:
        return "Không xác định";
    }
  };

  const handleSlotClick = async (slot) => {
    if (!slot) return;

    if (slot.status === "available") {
      setSelectedSlot(slot);
      setShowBookSlot(true);
      return;
    }

    if (slot.appointmentId) {
      setLoadingAppointmentDetail(true);
      setShowAppointmentDetail(true);

      try {
        const response = await api.get(
          `/api/doctors/me/appointments/${slot.appointmentId}`
        );

        if (response.success) {
          setSelectedAppointmentDetail(response.data);
        } else {
          alert("Không thể tải thông tin chi tiết lịch hẹn");
          setShowAppointmentDetail(false);
        }
      } catch (error) {
        console.error("Error fetching appointment detail:", error);
        alert("Có lỗi xảy ra khi tải thông tin");
        setShowAppointmentDetail(false);
      } finally {
        setLoadingAppointmentDetail(false);
      }
    }
  };

  const handleBookSlot = async () => {
    if (
      !bookingData.patientName ||
      !bookingData.patientPhone ||
      !bookingData.reason
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!selectedDoctorId) {
      alert("Vui lòng chọn bác sĩ!");
      return;
    }

    try {
      let scheduledStart, scheduledEnd;
      let slotId = null;

      if (selectedSlot) {
        scheduledStart = selectedSlot.startAt;
        scheduledEnd = selectedSlot.endAt;
        slotId = selectedSlot.id || selectedSlot._id;
      } else if (selectedDate && selectedTime) {
        const [hour, minute] = selectedTime.split(":").map(Number);
        const startDateTime = new Date(
          `${selectedDate}T${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}:00`
        );
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + 20);

        scheduledStart = startDateTime.toISOString();
        scheduledEnd = endDateTime.toISOString();

        const foundSlot = timeSlots.find((slot) => {
          const slotDate = new Date(slot.startAt);
          return (
            slotDate.toISOString().split("T")[0] === selectedDate &&
            slotDate.getHours() === hour &&
            slotDate.getMinutes() === minute
          );
        });

        if (foundSlot) {
          slotId = foundSlot.id || foundSlot._id;
        }
      } else {
        alert("Thiếu thông tin ngày/giờ. Vui lòng thử lại!");
        return;
      }

      const appointmentData = {
        doctorId: selectedDoctorId,
        slotId: slotId,
        patientName: bookingData.patientName,
        patientPhone: bookingData.patientPhone,
        reason: bookingData.reason,
        mode: bookingData.mode,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
      };

      const response = await api.post(
        "/api/managers/appointments",
        appointmentData
      );

      if (response.success) {
        alert("Đặt lịch thành công!");
        setShowBookSlot(false);
        setBookingData({
          patientName: "",
          patientPhone: "",
          reason: "",
          mode: "online",
        });
        setSelectedSlot(null);
        setSelectedDate(null);
        setSelectedTime(null);
        await loadTimeSlots();
      } else {
        alert("Lỗi khi đặt lịch: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error booking slot:", error);
      alert("Có lỗi xảy ra khi đặt lịch: " + error.message);
    }
  };

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  return (
    <div className="manager-schedule-management">
      {/* Doctor Filter Section */}
      <div className="doctor-filter-section">
        <div className="filter-card">
          <h3 className="filter-title">Tìm kiếm bác sĩ</h3>
          <div className="filter-controls">
            <div className="filter-input-group">
              <Search size={18} className="search-icon" />
              <Input
                type="text"
                placeholder="Tìm theo tên bác sĩ..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="search-input"
              />
            </div>
            <Select
              value={selectedSpecializationId}
              onValueChange={(value) => setSelectedSpecializationId(value)}
            >
              <SelectTrigger className="specialization-select">
                <SelectValue placeholder="Tìm theo chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec._id} value={spec._id}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDoctor && (
            <div className="selected-doctor-info">
              <span>
                Đang quản lý lịch: <strong>{selectedDoctor.fullName}</strong>
                {selectedDoctor.specializationIds?.[0]?.name && (
                  <span className="doctor-specialization">
                    {" "}
                    - {selectedDoctor.specializationIds[0].name}
                  </span>
                )}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDoctorId(null)}
              >
                Hủy chọn
              </Button>
            </div>
          )}
        </div>

        {/* Doctor List */}
        {!searchName.trim() && !selectedSpecializationId ? (
          <div className="no-doctors-found">
            <User size={48} className="empty-icon" />
            <p>Vui lòng nhập tên bác sĩ hoặc chọn chuyên khoa để tìm kiếm</p>
          </div>
        ) : loadingDoctors ? (
          <div className="loading-doctors">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách bác sĩ...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="no-doctors-found">
            <User size={48} className="empty-icon" />
            <p>Không tìm thấy bác sĩ nào</p>
          </div>
        ) : (
          <div className="doctor-list">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className={`doctor-card ${
                  selectedDoctorId === doctor._id ? "selected" : ""
                }`}
                onClick={() => setSelectedDoctorId(doctor._id)}
              >
                <div className="doctor-card-content">
                  <div className="doctor-avatar">
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.fullName}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className="avatar-placeholder">
                      <User size={24} />
                    </div>
                  </div>
                  <div className="doctor-info">
                    <h4 className="doctor-name">{doctor.fullName}</h4>
                    {doctor.specializationIds &&
                      doctor.specializationIds.length > 0 && (
                        <div className="doctor-specializations">
                          {doctor.specializationIds.map((spec, idx) => (
                            <span key={idx} className="specialization-tag">
                              {spec.name}
                            </span>
                          ))}
                        </div>
                      )}
                    {doctor.ratingAvg > 0 && (
                      <div className="doctor-rating">
                        ⭐ {doctor.ratingAvg.toFixed(1)} ({doctor.ratingCount}{" "}
                        đánh giá)
                      </div>
                    )}
                  </div>
                  {selectedDoctorId === doctor._id && (
                    <div className="selected-badge">✓ Đã chọn</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!selectedDoctorId ? (
        <div className="no-doctor-selected">
          <Calendar size={64} className="empty-icon" />
          <h3>Vui lòng chọn bác sĩ để xem lịch làm việc</h3>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card pending">
              <div className="summary-label">Chờ duyệt</div>
              <div className="summary-value">{stats.pending}</div>
            </div>
            <div className="summary-card completed">
              <div className="summary-label">Hoàn thành</div>
              <div className="summary-value">{stats.completed}</div>
            </div>
            <div className="summary-card booked">
              <div className="summary-label">Đã đặt</div>
              <div className="summary-value">{stats.booked}</div>
            </div>
            <div className="summary-card cancelled">
              <div className="summary-label">Đã hủy</div>
              <div className="summary-value">{stats.cancelled}</div>
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="schedule-controls">
            <div className="week-navigation">
              <span>Tuần:</span>
              <button className="nav-arrow" onClick={() => navigateWeek(-1)}>
                &lt;
              </button>
              <span className="date-range">{formatDateRange()}</span>
              <button className="nav-arrow" onClick={() => navigateWeek(1)}>
                &gt;
              </button>
            </div>
            <div className="action-buttons">
              <Button
                onClick={() => setCurrentDate(new Date())}
                className="today-btn"
              >
                🏠 Hôm nay
              </Button>
              <Button onClick={loadTimeSlots} className="refresh-btn">
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>

          <div className="schedule-header">
            <div className="header-left">
              <h1>
                <Calendar className="icon" />
                Lịch làm việc - {selectedDoctor?.fullName}
              </h1>
            </div>
          </div>

          <div className="schedule-content">
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Đang tải lịch làm việc...</p>
              </div>
            )}

            {!loading && timeSlotsList.length === 0 && (
              <div className="no-slots-message">
                <div className="empty-state">
                  <Calendar size={64} className="empty-icon" />
                  <h3>Chưa có slot nào trong tuần này</h3>
                </div>
              </div>
            )}

            {timeSlotsList.length > 0 && (
              <div className="schedule-grid">
                <div className="grid-header">
                  <div className="time-column">
                    <Clock size={16} />
                    Giờ
                  </div>
                  {daysWithSlots.map((day, index) => (
                    <div
                      key={index}
                      className={`day-column ${day.isPast ? "past-day" : ""}`}
                    >
                      <div className="day-name">{day.name}</div>
                      <div className="day-date">{day.date}</div>
                    </div>
                  ))}
                </div>

                <div className="grid-body">
                  {timesWithSlots.map((time, timeIndex) => {
                    const hour = parseInt(time.split(":")[0]);
                    const morningStartIndex = timesWithSlots.findIndex(
                      (t) => parseInt(t.split(":")[0]) < 12
                    );
                    const afternoonStartIndex = timesWithSlots.findIndex(
                      (t) => parseInt(t.split(":")[0]) >= 13
                    );

                    return (
                      <div key={timeIndex} className="time-row">
                        <div className="time-cell">{time}</div>
                        {daysWithSlots.map((day, dayIndex) => {
                          const slot =
                            processedSlots.slotsMap?.[day.fullDate]?.[time];

                          if (!slot) {
                            return (
                              <div
                                key={`${dayIndex}-${timeIndex}`}
                                className="slot-cell empty-no-border"
                                onClick={() => {
                                  setSelectedDate(day.fullDate);
                                  setSelectedTime(time);
                                  setSelectedSlot(null);
                                  setBookingData({
                                    patientName: "",
                                    patientPhone: "",
                                    reason: "",
                                    mode: "online",
                                  });
                                  setShowBookSlot(true);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {/* Empty slot - clickable to book */}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={`${dayIndex}-${timeIndex}`}
                              className={`slot-cell ${
                                day.isPast ? "past-day" : ""
                              }`}
                              onClick={() => handleSlotClick(slot)}
                            >
                              <div className="slot-content">
                                {slot.status === "available" ? (
                                  <div
                                    className="slot-status"
                                    style={{
                                      backgroundColor: getStatusColor(
                                        slot.status
                                      ),
                                    }}
                                  >
                                    {getStatusText(slot.status)}
                                  </div>
                                ) : (
                                  <div className={`booked-slot ${slot.status}`}>
                                    <div className="patient-name-main">
                                      {slot.patientName || "Bệnh nhân"}
                                    </div>
                                    <div className="status-text-small">
                                      {getStatusText(slot.status)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Book Slot Dialog */}
      <Dialog open={showBookSlot} onOpenChange={setShowBookSlot}>
        <DialogContent className="book-slot-dialog">
          <DialogHeader>
            <DialogTitle>Đặt lịch khám</DialogTitle>
          </DialogHeader>
          <div className="form-group">
            <label>Tên bệnh nhân:</label>
            <Input
              value={bookingData.patientName}
              onChange={(e) =>
                setBookingData({ ...bookingData, patientName: e.target.value })
              }
              placeholder="Nhập tên bệnh nhân..."
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại:</label>
            <Input
              value={bookingData.patientPhone}
              onChange={(e) =>
                setBookingData({ ...bookingData, patientPhone: e.target.value })
              }
              placeholder="Nhập số điện thoại..."
            />
          </div>
          <div className="form-group">
            <label>Lý do khám:</label>
            <Input
              value={bookingData.reason}
              onChange={(e) =>
                setBookingData({ ...bookingData, reason: e.target.value })
              }
              placeholder="Nhập lý do khám..."
            />
          </div>
          <div className="form-group">
            <label>Hình thức khám:</label>
            <div className="mode-checkboxes">
              <label className="checkbox-option">
                <input
                  type="radio"
                  name="mode"
                  value="online"
                  checked={bookingData.mode === "online"}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, mode: e.target.value })
                  }
                />
                <span>Online</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="radio"
                  name="mode"
                  value="offline"
                  checked={bookingData.mode === "offline"}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, mode: e.target.value })
                  }
                />
                <span>Offline</span>
              </label>
            </div>
          </div>
          <div className="dialog-actions">
            <Button
              onClick={() => {
                setShowBookSlot(false);
                setBookingData({
                  patientName: "",
                  patientPhone: "",
                  reason: "",
                  mode: "online",
                });
                setSelectedSlot(null);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              variant="outline"
            >
              Hủy
            </Button>
            <Button onClick={handleBookSlot} variant="primary">
              Đặt lịch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Modal */}
      <Dialog
        open={showAppointmentDetail}
        onOpenChange={setShowAppointmentDetail}
      >
        <DialogContent className="appointment-detail-dialog">
          <DialogHeader>
            <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
          </DialogHeader>
          {loadingAppointmentDetail ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin...</p>
            </div>
          ) : selectedAppointmentDetail ? (
            <div className="appointment-detail-content">
              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin bệnh nhân</h3>
                <div className="detail-item">
                  <span className="detail-label">Họ và tên:</span>
                  <span className="detail-value">
                    {selectedAppointmentDetail.patientId?.fullName ||
                      selectedAppointmentDetail.patientName ||
                      "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Số điện thoại:</span>
                  <span className="detail-value">
                    {selectedAppointmentDetail.patientId?.phone ||
                      selectedAppointmentDetail.patientPhone ||
                      "N/A"}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin lịch hẹn</h3>
                <div className="detail-item">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-value">
                    {selectedAppointmentDetail.scheduledStart
                      ? new Date(
                          selectedAppointmentDetail.scheduledStart
                        ).toLocaleString("vi-VN")
                      : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng thái:</span>
                  <span
                    className={`detail-value status-badge ${selectedAppointmentDetail.status}`}
                  >
                    {getStatusText(selectedAppointmentDetail.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hình thức:</span>
                  <span className="detail-value">
                    {selectedAppointmentDetail.mode === "online"
                      ? "Online"
                      : selectedAppointmentDetail.mode === "offline"
                      ? "Offline"
                      : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lý do khám:</span>
                  <span className="detail-value">
                    {selectedAppointmentDetail.reason || "Chưa có thông tin"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>Không có thông tin chi tiết</p>
            </div>
          )}
          <div className="dialog-actions">
            <Button
              onClick={() => setShowAppointmentDetail(false)}
              variant="outline"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
