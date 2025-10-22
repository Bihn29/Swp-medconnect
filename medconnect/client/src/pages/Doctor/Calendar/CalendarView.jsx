import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { getDoctorAppointmentsWithFallback } from "../../../lib/api";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [filterType, setFilterType] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get appointments for the current month
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await getDoctorAppointmentsWithFallback({
          date: currentDate.toISOString().split("T")[0].substring(0, 7), // YYYY-MM format
          limit: 100,
        });

        if (response.success && response.data?.appointments) {
          setAppointments(response.data.appointments);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentDate]);

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    return days;
  };

  const getEventsForDay = (day) => {
    if (!appointments) return [];

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.scheduledStart);
        return appointmentDate.getDate() === day;
      })
      .map((appointment) => ({
        id: appointment._id,
        title: appointment.patientId?.fullName || "Bệnh nhân",
        type: appointment.mode,
        status: appointment.status,
        time: new Date(appointment.scheduledStart).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
  };

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="max-w-[1400px]">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
        <div className="flex items-center gap-8">
          <h1 className="text-4xl font-bold text-gray-900">Lịch làm việc</h1>
          <div className="flex items-center gap-4">
            <button
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-gray-900 min-w-[150px] text-center">
              Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
            </span>
            <button
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`px-6 py-2 font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("month")}
            >
              Tháng
            </button>
            <button
              className={`px-6 py-2 font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("week")}
            >
              Tuần
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600">
            <Filter size={18} />
            <select
              className="border-none bg-transparent text-gray-900 font-medium cursor-pointer outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="online">Trực tuyến</option>
              <option value="offline">Tại viện</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 p-6 bg-white rounded-xl shadow-md mb-8">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Tổng ca khám:</span>
          <span className="text-lg font-bold text-gray-900">42</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Trực tuyến:</span>
          <span className="text-lg font-bold text-primary">24</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Tại viện:</span>
          <span className="text-lg font-bold text-orange-600">18</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-7 gap-px mb-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-gray-900 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Đang tải lịch hẹn...</div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {days.map((dayObj, index) => {
              const events = dayObj.isCurrentMonth
                ? getEventsForDay(dayObj.day)
                : [];
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 ${
                    dayObj.isCurrentMonth ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`font-semibold mb-1 ${
                      dayObj.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {dayObj.day}
                  </div>
                  <div className="space-y-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`px-2 py-1 rounded text-xs font-medium cursor-pointer hover:scale-105 transition-transform ${
                          event.type === "online"
                            ? "bg-primary/15 text-primary"
                            : "bg-orange-100 text-orange-700"
                        }`}
                        title={`${event.time} - ${event.title}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
