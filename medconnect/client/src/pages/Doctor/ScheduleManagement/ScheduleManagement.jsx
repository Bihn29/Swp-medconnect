import React, { useState, useEffect } from "react";
import { Clock, Send, ChevronLeft, ChevronRight, Plus, Search, Calendar, Filter, RefreshCw, Phone, User, MessageSquare } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select";
import { auth } from "../../../lib/firebase";
import { getDoctorTimeSlots, autoGenerateTimeSlots } from "../../../lib/api";
import "./ScheduleManagement.scss";

export default function ScheduleManagement() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  
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
  });

  // Listen to authentication changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
    });

    // Listen for logout events
    const handleLogout = () => {
      setAuthUser(null);
    };

    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      unsubscribe();
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  // Load time slots when authUser or currentDate changes
  useEffect(() => {
    if (authUser) {
      loadTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, currentDate]);

  // Navigation functions
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    // Tính ngày Thứ 2 của tuần (Thứ 2 = 1)
    const diff = start.getDate() - day + 1; // Thứ 2 là ngày đầu tuần
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
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
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
      
      // Sử dụng cùng timezone để tránh mismatch
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const date = String(day.getDate()).padStart(2, '0');
      const fullDate = `${year}-${month}-${date}`;
      
      const dayInfo = {
        name: day.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullDate: fullDate, // Sử dụng cùng format với API
        isToday: day.getTime() === today.getTime(),
        isPast: day < today
      };
      days.push(dayInfo);
    }
    return days;
  };

  const formatDateRange = () => {
    const startDate = getWeekStart(currentDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const endDate = new Date(getWeekStart(currentDate).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${startDate} - ${endDate}`;
  };

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const weekRange = getWeekRange();
      const response = await getDoctorTimeSlots({
        startDate: weekRange.startDate,
        endDate: weekRange.endDate,
        limit: 1000  // Tăng limit để lấy đủ slot
      });
      
      console.log("🔍 Load time slots response:", response);
      console.log("🔍 Response structure:", {
        success: response.success,
        hasData: !!response.data,
        hasSlots: !!(response.data && response.data.slots),
        slotsLength: response.data?.slots?.length || 0,
        slotsType: typeof response.data?.slots,
        isArray: Array.isArray(response.data?.slots),
        fullResponse: response
      });
      
      // Kiểm tra nhiều format response có thể có
      let slots = [];
      if (response.success && response.data && response.data.slots) {
        slots = response.data.slots;
        console.log("🔍 Using response.data.slots format");
      } else if (response.slots) {
        slots = response.slots;
        console.log("🔍 Using response.slots format");
      } else if (response.data && Array.isArray(response.data)) {
        slots = response.data;
        console.log("🔍 Using response.data array format");
      } else if (Array.isArray(response)) {
        slots = response;
        console.log("🔍 Using direct array format");
      }
      
      console.log("🔍 Extracted slots:", slots);
      console.log("🔍 Slots count:", slots.length);
      
      if (slots && slots.length > 0) {
        console.log("🔍 Time slots loaded:", slots);
        setTimeSlots(slots);
      } else {
        console.log("🔍 No slots found in any format");
        setTimeSlots([]);
      }
    } catch (error) {
      console.error("❌ Error loading time slots:", error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    try {
      setGenerating(true);
      console.log("🔍 Generating time slots...");
      const response = await autoGenerateTimeSlots();
      console.log("🔍 Generate response:", response);
      if (response.success) {
        alert(`✅ Đã tạo ${response.data.createdSlots} slot mới trong 14 ngày tới (chỉ ngày trong tuần)`);
        await loadTimeSlots();
      } else {
        alert("❌ Lỗi khi tạo slots: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error generating slots:", error);
      alert("❌ Lỗi khi tạo slots: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Extract unique times from actual slots in database
  const timeSlotsList = React.useMemo(() => {
    const timesSet = new Set();
    
    // Extract unique times from loaded slots
    timeSlots.forEach(slot => {
      const slotTime = new Date(slot.startAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      timesSet.add(slotTime);
    });
    
    // Convert to array and sort
    const times = Array.from(timesSet).sort();
    
    console.log("🔍 Extracted unique times from database:", times);
    return times;
  }, [timeSlots]);

  // Processed slots for display - chỉ hiển thị slot thực sự có trong database
  const processedSlots = React.useMemo(() => {
    const slotsMap = {};
    
    console.log("🔍 Processing slots:", timeSlots);
    console.log("🔍 Time slots list:", timeSlotsList);
    
    // Chỉ thêm slot thật từ database vào map
    timeSlots.forEach(slot => {
      console.log("🔍 Processing slot:", {
        id: slot._id,
        startAt: slot.startAt,
        status: slot.status,
        patientName: slot.patientName,
        hasPatientName: !!slot.patientName,
        appointmentId: slot.appointmentId || 'NULL - Không có appointment'
      });
      
      const slotDate = new Date(slot.startAt).toISOString().split('T')[0];
      const slotTime = new Date(slot.startAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // Khởi tạo map cho ngày nếu chưa có
      if (!slotsMap[slotDate]) {
        slotsMap[slotDate] = {};
      }
      
      console.log("🔍 Slot mapping:", {
        slotDate,
        slotTime,
        existsInMap: !!(slotsMap[slotDate] && slotsMap[slotDate][slotTime])
      });
      
      // Thêm slot vào map
      const mappedSlot = {
        id: slot._id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: slot.status,
        patientName: slot.patientName || null,
        reason: slot.reason || null,
        mode: slot.mode || null,
        appointmentId: slot.appointmentId || null, // Thêm appointmentId từ slot
        isEmpty: false
      };
      
      slotsMap[slotDate][slotTime] = mappedSlot;
      
      // Log for booked slots
      if (slot.status === 'booked' || slot.status === 'pending' || slot.status === 'confirmed' || slot.status === 'completed' || slot.status === 'in_progress') {
        console.log("✅ Booked slot mapped:", {
          slotId: slot._id,
          date: slotDate,
          time: slotTime,
          patientName: mappedSlot.patientName,
          mode: mappedSlot.mode,
          status: mappedSlot.status
        });
      }
    });
    
    console.log("🔍 Processed slots map:", slotsMap);
    return slotsMap;
  }, [timeSlots, currentDate]);

  // Lấy danh sách ngày trong tuần (hiển thị đủ 7 ngày)
  const daysWithSlots = React.useMemo(() => {
    return getWeekDays();
  }, [currentDate]);

  // Lấy danh sách giờ làm việc (hiển thị đủ giờ)
  const timesWithSlots = React.useMemo(() => {
    console.log("🔍 timesWithSlots from timeSlotsList:", timeSlotsList);
    return timeSlotsList;
  }, [timeSlotsList]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#f3f4f6'; // Màu xám nhạt cho slot trống
      case 'pending': return '#fbbf24'; // Màu vàng cho chờ duyệt
      case 'confirmed': return '#10b981'; // Màu xanh lá cho đã xác nhận
      case 'in_progress': return '#3b82f6'; // Màu xanh dương cho đang diễn ra
      case 'cancelled': return '#ef4444'; // Màu đỏ cho đã hủy
      case 'completed': return '#3b82f6'; // Màu xanh dương cho hoàn thành
      case 'booked': return '#10b981'; // Màu xanh lá cho đã đặt (tương tự confirmed)
      case 'blocked': return '#6b7280'; // Màu xám cho bị chặn
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'pending': return 'Chờ duyệt';
      case 'confirmed': return 'Đã xác nhận';
      case 'in_progress': return 'Đang diễn ra';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      case 'booked': return 'Đã đặt';
      case 'blocked': return 'Bị chặn';
      default: return 'Không xác định';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24'; // Chấm vàng
      case 'confirmed': return '#10b981'; // Chấm xanh lá
      case 'in_progress': return '#3b82f6'; // Chấm xanh dương
      case 'cancelled': return '#ef4444'; // Chấm đỏ
      case 'completed': return '#3b82f6'; // Chấm xanh dương
      case 'booked': return '#10b981'; // Chấm xanh lá cho đã đặt
      default: return '#6b7280';
    }
  };

  const handleSlotClick = (slot) => {
    if (slot && slot.status === 'available') {
      setSelectedSlot(slot);
      setShowBookSlot(true);
    }
  };

  const handleLeaveRequest = () => {
    console.log("Leave request:", leaveData);
    alert("Yêu cầu nghỉ phép đã được gửi!");
    setShowLeaveRequest(false);
    setLeaveData({ startDate: "", endDate: "", reason: "" });
  };

  const handleBookSlot = () => {
    console.log("Booking slot:", bookingData);
    alert("Đặt lịch thành công!");
    setShowBookSlot(false);
    setBookingData({ patientName: "", patientPhone: "", reason: "" });
    loadTimeSlots();
  };

  // Hàm xử lý gọi video - MỞ SANG TAB MỚI
  const handleVideoCall = async (slot) => {
    console.log("🎥🎥🎥 handleVideoCall - Called with slot:", slot);
    console.log("🎥🎥🎥 handleVideoCall - Slot data:", JSON.stringify(slot, null, 2));
    
    try {
      // Sử dụng appointmentId từ slot (đã được populate từ backend)
      if (!slot || !slot.appointmentId) {
        console.error("❌❌❌ handleVideoCall - No slot or appointmentId");
        alert(`Không tìm thấy lịch hẹn cho slot này. Slot ID: ${slot?.id || 'N/A'}, Patient: ${slot?.patientName || 'N/A'}`);
        return;
      }

      console.log("✅✅✅ handleVideoCall - Found appointment ID from slot:", slot.appointmentId);
      
      const apiModule = await import('../../../lib/api');
      const VideoCallAPI = await import('../../../services/videoCallAPI');
      console.log("✅✅✅ handleVideoCall - APIs imported");
      
      console.log("🔍🔍🔍 handleVideoCall - Updating appointment status to in_progress...");
      // Step 1: Update appointment status to "in_progress" (only if not already in_progress)
      try {
        const statusUrl = `/api/doctors/me/appointments/${slot.appointmentId}/status`;
        console.log("🔍🔍🔍 handleVideoCall - Calling PUT:", statusUrl);

        const response = await apiModule.api.put(statusUrl, {
          status: 'in_progress'
        });

        console.log("🔍🔍🔍 handleVideoCall - Status update response:", response);

        if (response.success) {
          console.log("✅✅✅ handleVideoCall - Appointment status updated to in_progress");
        } else {
          // If status is already in_progress, continue anyway
          if (response.message?.includes('Invalid status transition from in_progress')) {
            console.log("ℹ️ℹ️ℹ️ handleVideoCall - Appointment already in_progress, continuing...");
          } else {
            console.error("❌❌❌ handleVideoCall - Status update failed:", response);
          }
        }
      } catch (statusError) {
        console.error("❌❌❌ handleVideoCall - Error updating appointment status:", statusError);
        // If error is about already being in_progress, continue anyway
        if (statusError.message?.includes('Invalid status transition from in_progress')) {
          console.log("ℹ️ℹ️ℹ️ handleVideoCall - Appointment already in_progress, continuing...");
        } else {
          console.error("❌❌❌ handleVideoCall - Error details:", statusError.message, statusError.stack);
        }
      }
      
      console.log("🔍🔍🔍 handleVideoCall - Creating video call room...");
      // Step 2: Create video call room
      try {
        console.log("🔍🔍🔍 handleVideoCall - Calling VideoCallAPI.createRoom with:", slot.appointmentId);
        const videoCallResponse = await VideoCallAPI.default.createRoom(slot.appointmentId);
        console.log("✅✅✅ handleVideoCall - Video call room created:", videoCallResponse);
      } catch (videoCallError) {
        console.error("❌❌❌ handleVideoCall - Error creating video call room:", videoCallError);
        console.error("❌❌❌ handleVideoCall - Error details:", videoCallError.message, videoCallError.stack);
        // Continue even if video call creation fails - will be created when page loads
      }
      
      console.log("🔍🔍🔍 handleVideoCall - Reloading time slots...");
      // Reload time slots to reflect status change
      await loadTimeSlots();
      
      console.log("🔍🔍🔍 handleVideoCall - Opening video call window...");
      // Mở video call trong TAB MỚI thay vì thay đổi trang hiện tại
      window.open(`/bac-si/video-call/${slot.appointmentId}`, '_blank');
      console.log("✅✅✅ handleVideoCall - Video call window opened");
      
    } catch (error) {
      console.error("❌❌❌ handleVideoCall - Unexpected error:", error);
      console.error("❌❌❌ handleVideoCall - Error details:", error.message, error.stack);
      alert(`Lỗi khi bắt đầu cuộc gọi video: ${error.message}`);
    }
  };


  if (!authUser) {
    return (
      <div className="schedule-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-management">
      <div className="schedule-header">
        <div className="header-left">
          <h1>
            <Calendar className="icon" />
            Lịch làm việc
          </h1>
        </div>
        
        <div className="header-right">
          <div className="week-navigation">
            <span>Tuần:</span>
            <Button 
              onClick={() => navigateWeek(-1)}
              variant="outline"
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="date-range">{formatDateRange()}</span>
            <Button 
              onClick={() => navigateWeek(1)}
              variant="outline"
              size="sm"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="status-indicators">
            <span>Trạng thái:</span>
            <div className="status-item">
              <div className="status-dot" style={{ backgroundColor: '#fbbf24' }}></div>
              <span>Chờ duyệt</span>
            </div>
            <div className="status-item">
              <div className="status-dot" style={{ backgroundColor: '#10b981' }}></div>
              <span>Đã đặt</span>
            </div>
            <div className="status-item">
              <div className="status-dot" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Đã hủy</span>
            </div>
            <div className="status-item">
              <div className="status-dot" style={{ backgroundColor: '#3b82f6' }}></div>
              <span>Hoàn thành</span>
            </div>
            <div className="status-item">
              <div className="status-dot" style={{ backgroundColor: '#e5e7eb' }}></div>
              <span>Trống</span>
            </div>
          </div>
          
          <div className="action-buttons">
            <Button 
              onClick={handleGenerateSlots}
              className="auto-generate-btn"
              disabled={generating}
            >
              🚀 Tạo slot tự động
            </Button>
            <Button 
              onClick={() => setShowLeaveRequest(true)}
              className="leave-btn"
            >
              📅 Lịch nghỉ
            </Button>
            <Button 
              onClick={() => setCurrentDate(new Date())}
              className="today-btn"
            >
              🏠 Hôm nay
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="refresh-btn"
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="schedule-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Đang tải lịch làm việc...</p>
          </div>
        )}
        
        {/* Hiển thị thông báo khi không có slot nào trong tuần */}
        {!loading && timeSlotsList.length === 0 && (
          <div className="no-slots-message">
            <div className="empty-state">
              <Calendar size={64} className="empty-icon" />
              <h3>Chưa có slot nào trong tuần này</h3>
              <p>Bấm nút "Tạo slot tự động" để tạo lịch làm việc cho tuần này</p>
              <Button 
                onClick={handleGenerateSlots}
                className="auto-generate-btn"
                disabled={generating}
                size="lg"
              >
                🚀 Tạo slot tự động ngay
              </Button>
            </div>
          </div>
        )}
        
        {timeSlotsList.length > 0 && <div className="schedule-grid">
          <div className="grid-header">
            <div className="time-column">Giờ</div>
            {daysWithSlots.map((day, index) => (
              <div key={index} className={`day-column ${day.isPast ? 'past-day' : ''}`}>
                <div className="day-name">{day.name}</div>
                <div className="day-date">{day.date}</div>
              </div>
            ))}
          </div>
          
          <div className="grid-body">
            {/* Buổi sáng label */}
            <div className="time-row morning-label">
              <div className="time-cell">Buổi sáng</div>
              {daysWithSlots.map((day, dayIndex) => (
                <div key={`label-morning-${dayIndex}`} className="slot-cell">
                  <div className="slot-content"></div>
                </div>
              ))}
            </div>
            
            {timesWithSlots.map((time, timeIndex) => {
              // Xác định buổi dựa trên giờ
              const hour = parseInt(time.split(':')[0]);
              
              // Tìm vị trí đầu tiên của buổi sáng và buổi chiều
              const morningStartIndex = timesWithSlots.findIndex(t => parseInt(t.split(':')[0]) < 12);
              const afternoonStartIndex = timesWithSlots.findIndex(t => parseInt(t.split(':')[0]) >= 13);
              
              console.log(`🔍 Time ${time} (index ${timeIndex}): morningStart=${morningStartIndex}, afternoonStart=${afternoonStartIndex}`);
              
              return (
                <>
                  {/* Thêm label "Buổi chiều" trước slot 13:00 */}
                  {timeIndex === afternoonStartIndex && (
                    <div className="time-row afternoon-label">
                      <div className="time-cell">Buổi chiều</div>
                      {daysWithSlots.map((day, dayIndex) => (
                        <div key={`label-afternoon-${dayIndex}`} className="slot-cell">
                          <div className="slot-content"></div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div key={timeIndex} className={`time-row ${timeIndex === morningStartIndex ? 'morning-section' : ''} ${timeIndex === afternoonStartIndex ? 'afternoon-section' : ''}`}>
                    <div className="time-cell">
                      {time}
                    </div>
                  {daysWithSlots.map((day, dayIndex) => {
                    const slot = processedSlots[day.fullDate]?.[time];
                    
                    // Chỉ hiển thị nếu có slot trong database
                    if (!slot) {
                      return (
                        <div 
                          key={`${dayIndex}-${timeIndex}`} 
                          className="slot-cell empty"
                        >
                          <div className="slot-content"></div>
                        </div>
                      );
                    }
                    
                    return (
                      <div 
                        key={`${dayIndex}-${timeIndex}`} 
                        className={`slot-cell ${day.isPast ? 'past-day' : ''}`}
                        onClick={() => slot && slot.status === 'available' && handleSlotClick(slot)}
                      >
                      <div className="slot-content">
                        {slot.status === 'available' ? (
                          <div className="slot-status" style={{ backgroundColor: getStatusColor(slot.status) }}>
                            {getStatusText(slot.status)}
                          </div>
                        ) : (
                          <div className={`booked-slot ${slot.status}`}>
                            <div className="slot-header">
                              <div className="status-dot" style={{ backgroundColor: getStatusDotColor(slot.status) }}></div>
                              <span className="status-text">{getStatusText(slot.status)}</span>
                              {slot.mode && (
                                <span className={`mode-badge ${slot.mode}`}>
                                  {slot.mode === 'online' ? 'Online' : 'Offline'}
                                </span>
                              )}
                            </div>
                            <div className="slot-info">
                              <div className="patient-info">
                                <User size={15} />
                                <span className="patient-name">{slot.patientName || 'Bệnh nhân'}</span>
                              </div>
                            </div>
                            {(() => {
                              const shouldShowCallButton = (slot.status === 'confirmed' || slot.status === 'booked' || slot.status === 'in_progress') && slot.mode === 'online';
                              console.log('🔍 Slot debug:', {
                                slotId: slot.slotId || slot._id,
                                status: slot.status,
                                mode: slot.mode,
                                patientName: slot.patientName,
                                appointmentId: slot.appointmentId,
                                shouldShowCallButton
                              });
                              if (shouldShowCallButton) {
                                return (
                                  <div className="slot-actions">
                                    <Button
                                      size="sm"
                                      className="call-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('🎥 Button clicked! Slot data:', slot);
                                        handleVideoCall(slot);
                                      }}
                                    >
                                      <Phone size={13} />
                                      Gọi
                                    </Button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                      </div>
                    );
                  })}
                  </div>
                </>
              );
            })}
          </div>
          
        </div>}
      </div>

      {/* Leave Request Dialog */}
      <Dialog open={showLeaveRequest} onOpenChange={setShowLeaveRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký lịch nghỉ</DialogTitle>
          </DialogHeader>
          <div className="form-group">
            <label>Ngày bắt đầu:</label>
            <Input
              type="date"
              value={leaveData.startDate}
              onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Ngày kết thúc:</label>
            <Input
              type="date"
              value={leaveData.endDate}
              onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Lý do:</label>
            <Input
              value={leaveData.reason}
              onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
              placeholder="Nhập lý do nghỉ..."
            />
          </div>
          <div className="dialog-actions">
            <Button onClick={() => setShowLeaveRequest(false)} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleLeaveRequest} variant="primary">
              Gửi yêu cầu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Slot Dialog */}
      <Dialog open={showBookSlot} onOpenChange={setShowBookSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lịch khám</DialogTitle>
          </DialogHeader>
          <div className="form-group">
            <label>Tên bệnh nhân:</label>
            <Input
              value={bookingData.patientName}
              onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
              placeholder="Nhập tên bệnh nhân..."
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại:</label>
            <Input
              value={bookingData.patientPhone}
              onChange={(e) => setBookingData({...bookingData, patientPhone: e.target.value})}
              placeholder="Nhập số điện thoại..."
            />
          </div>
          <div className="form-group">
            <label>Lý do khám:</label>
            <Input
              value={bookingData.reason}
              onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
              placeholder="Nhập lý do khám..."
            />
          </div>
          <div className="dialog-actions">
            <Button onClick={() => setShowBookSlot(false)} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleBookSlot} variant="primary">
              Đặt lịch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
