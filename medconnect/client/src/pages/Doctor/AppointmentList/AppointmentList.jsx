"use client";

import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Search, Filter, Calendar, Clock, User } from "lucide-react";
import { useDoctorAppointments } from "../../../hooks/useDoctor.js";

const formatDate = (d) => {
  if (!d) return "--/--/----";
  const t = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  return isNaN(t?.getTime()) ? "--/--/----" : t.toLocaleDateString("vi-VN");
};

const formatTime = (dateTime) => {
  return new Date(dateTime).toLocaleTimeString("vi-VN", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
};

const formatAppointmentType = (appointment) => {
  return appointment.reason || "Khám tổng quát";
};

const getAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const AppointmentList = ({ onSelectAppointment }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const { 
    appointments, 
    loading, 
    error, 
    updateStatus
  } = useDoctorAppointments({
    status: statusFilter === "all" ? undefined : statusFilter,
    date: dateFilter || undefined,
    limit: 50
  });

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    
    const term = searchTerm.trim().toLowerCase();
    return appointments.filter((apt) => {
      const patientName = apt.patientId?.fullName || "";
      const matchesSearch = patientName.toLowerCase().includes(term);
      return matchesSearch;
    });
  }, [appointments, searchTerm]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateStatus(appointmentId, newStatus);
      // Optionally show success message
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      // Optionally show error message
    }
  };

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Danh sách lịch hẹn</h1>
        <button className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md" type="button">
          <Calendar size={18} />
          Tạo lịch hẹn mới
        </button>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-600">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-[15px]"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-600">
          <Calendar size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border-none bg-transparent text-gray-900 font-medium cursor-pointer outline-none"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-600">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-none bg-transparent text-gray-900 font-medium cursor-pointer outline-none min-w-[150px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="done">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải danh sách lịch hẹn...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Có lỗi xảy ra: {error}</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có lịch hẹn nào</div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const patient = appointment.patientId;
            const age = getAge(patient?.dob);
            const gender = patient?.gender === 'male' ? 'Nam' : patient?.gender === 'female' ? 'Nữ' : 'Khác';
            
            return (
              <div
                key={appointment._id}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
                onClick={() => onSelectAppointment?.(appointment)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-6 p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <User size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {patient?.fullName || "Bệnh nhân"}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {age ? `${age} tuổi` : ""} • {gender}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      {formatAppointmentType(appointment)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(appointment.scheduledStart)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{formatTime(appointment.scheduledStart)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-center whitespace-nowrap ${
                        appointment.mode === "online" ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {appointment.mode === "online" ? "Trực tuyến" : "Tại viện"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-center whitespace-nowrap ${
                        appointment.status === "confirmed" ? "bg-green-100 text-green-600"
                          : appointment.status === "done" ? "bg-blue-100 text-blue-600"
                          : appointment.status === "cancelled" ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-amber-700"
                      }`}
                    >
                      {appointment.status === "confirmed"
                        ? "Đã xác nhận"
                        : appointment.status === "done"
                        ? "Hoàn thành"
                        : appointment.status === "cancelled"
                        ? "Đã hủy"
                        : "Chờ xác nhận"}
                    </span>
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="flex gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button 
                      className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all" 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(appointment._id, 'confirmed');
                      }}
                    >
                      Chấp nhận
                    </button>
                    <button 
                      className="flex-1 px-4 py-2 bg-white text-red-500 border border-red-500 rounded-lg font-medium hover:bg-red-50 transition-all" 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(appointment._id, 'cancelled');
                      }}
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

AppointmentList.propTypes = {
  onSelectAppointment: PropTypes.func, // optional; parent truyền vào để mở chi tiết
};

AppointmentList.defaultProps = {
  onSelectAppointment: () => {},
};

export default AppointmentList;
