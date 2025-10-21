import { useState } from "react";
import { Clock, Send } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useDoctorTimeSlots } from "../../../hooks/useDoctor";
import "./ScheduleManagement.scss";

export default function ScheduleManagement() {
  const { timeSlots, loading, error, refetch } = useDoctorTimeSlots();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("week");
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [showBookSlot, setShowBookSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    patientName: "",
    patientPhone: "",
    reason: "",
    type: "online",
  });

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

  const weekDates = getWeekDates(new Date(currentDate));
  const timeSlotsList = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30", "17:00",
  ];

  const formatDate = (date) => date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const getDayName = (date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  const getSlotForDateTime = (dayIdx, time) => {
    const dateStr = formatDate(weekDates[dayIdx]);
    return timeSlots?.find((s) => {
      const slotDate = new Date(s.startTime);
      return formatDate(slotDate) === dateStr && slotDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) === time;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return { bg: "bg-yellow-400/80", hover: "hover:bg-yellow-500", text: "Chờ xác nhận" };
      case "confirmed":
        return { bg: "bg-green-500/80", hover: "hover:bg-green-600", text: "Đã xác nhận" };
      case "cancelled":
        return { bg: "bg-red-500/80", hover: "hover:bg-red-600", text: "Hủy" };
      case "completed":
        return { bg: "bg-cyan-500/80", hover: "hover:bg-cyan-600", text: "Hoàn thành" };
      case "leave":
        return { bg: "bg-orange-500/80", hover: "hover:bg-orange-600", text: "Nghỉ" };
      default:
        return { bg: "bg-teal-400/80", hover: "hover:bg-teal-500", text: "Trống" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải lịch làm việc...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
            onClick={() => setShowLeaveRequest(!showLeaveRequest)}
          >
            <Clock className="w-4 h-4" />
            Lịch nghỉ
          </Button>
        </div>
      </div>

      {showLeaveRequest && (
        <Card className="p-6 border-0 shadow-sm bg-orange-50 space-y-4">
          <h4 className="font-semibold text-slate-900">Yêu cầu lịch nghỉ</h4>
          <p className="text-sm text-slate-600">Gửi yêu cầu lịch nghỉ cho admin để duyệt</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Từ ngày</label>
              <input
                type="date"
                value={leaveData.startDate}
                onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Đến ngày</label>
              <input
                type="date"
                value={leaveData.endDate}
                onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Lý do</label>
              <input
                type="text"
                value={leaveData.reason}
                onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                placeholder="Lý do xin nghỉ"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLeaveRequest} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Send className="w-4 h-4" />
              Gửi yêu cầu
            </Button>
            <Button onClick={() => setShowLeaveRequest(false)} variant="outline" className="flex-1">
              Hủy
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("week")}
                className={
                  viewType === "week"
                    ? "bg-white text-slate-700 hover:bg-slate-100"
                    : "text-white border-white hover:bg-slate-600"
                }
              >
                Tuần
              </Button>
              <Button
                variant={viewType === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("day")}
                className={
                  viewType === "day"
                    ? "bg-white text-slate-700 hover:bg-slate-100"
                    : "text-white border-white hover:bg-slate-600"
                }
              >
                Ngày
              </Button>
              <Button
                variant={viewType === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("month")}
                className={
                  viewType === "month"
                    ? "bg-white text-slate-700 hover:bg-slate-100"
                    : "text-white border-white hover:bg-slate-600"
                }
              >
                Tháng
              </Button>
              <input
                type="date"
                value={currentDate.toISOString().split("T")[0]}
                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                className="ml-2 bg-white text-slate-900 border-0 w-40 px-3 py-2 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Trạng thái:</span>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                Chờ xác nhận
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                Đã xác nhận
              </Button>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs">
                Hoàn thành
              </Button>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white text-xs">
                Hủy
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule table with mountain background */}
        <div
          className="rounded-lg overflow-hidden shadow-lg border border-slate-200"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-600/80 backdrop-blur-sm border-b border-slate-400">
                  <th className="px-4 py-4 text-left text-sm font-semibold text-white w-24 bg-slate-700/80">Giờ</th>
                  {weekDates.map((date, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-4 text-center text-sm font-semibold text-white min-w-40 bg-slate-600/60"
                    >
                      <div className="text-xs font-medium text-slate-200 mb-1">{getDayName(date)}</div>
                      <div className="text-sm font-bold text-white">{formatDate(date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlotsList.map((time, timeIdx) => (
                  <tr key={timeIdx} className="border-b border-slate-400/50 hover:bg-slate-600/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white bg-slate-700/60 sticky left-0">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span>{time}</span>
              </div>
                    </td>
                    {weekDates.map((_, dayIdx) => {
                      const slot = getSlotForDateTime(dayIdx, time);
                      const statusColor = slot ? getStatusColor(slot.status) : getStatusColor("empty");
                      return (
                        <td key={dayIdx} className="px-4 py-3 text-center bg-slate-600/10 backdrop-blur-sm">
                          {!slot ? (
                            <button
                              onClick={() => {
                                setSelectedSlot({ date: formatDate(weekDates[dayIdx]), time });
                                setShowBookSlot(true);
                              }}
                              className="w-full px-3 py-2 bg-teal-400/80 hover:bg-teal-500 text-white rounded text-xs font-medium transition-colors"
                            >
                              Trống
                            </button>
                          ) : (
                            <button
                              className={`w-full px-3 py-2 ${statusColor.bg} ${statusColor.hover} text-white rounded text-xs font-medium transition-colors`}
                            >
                              <div className="font-semibold truncate">{slot.patientName || statusColor.text}</div>
                              <div className="text-xs opacity-90">{slot.type === "online" ? "Online" : "Offline"}</div>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Đặt slot cho bệnh nhân</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Ngày: {selectedSlot?.date} - Giờ: {selectedSlot?.time}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tên bệnh nhân</label>
                <input
                  type="text"
                  value={bookingData.patientName}
                  onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                  placeholder="Nhập tên bệnh nhân"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                <input
                  type="text"
                  value={bookingData.patientPhone}
                  onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Loại khám</label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Lý do khám</label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  placeholder="Nhập lý do khám"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleBookSlot}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Đặt slot
                </Button>
                <Button
                  onClick={() => setShowBookSlot(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}