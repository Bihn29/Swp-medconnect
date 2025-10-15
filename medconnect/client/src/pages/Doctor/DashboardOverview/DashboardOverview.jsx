
"use client"

import PropTypes from "prop-types"
import { Calendar, Clock, Users, TrendingUp, Video, FileText } from "lucide-react"
import { useDoctor, useDoctorDashboardStats, useDoctorAppointments } from "../../../hooks/useDoctor.js"

const DashboardOverview = ({ onViewAppointments, onViewSchedule, onViewNotifications, onViewFeedback }) => {
  const { doctor, loading: doctorLoading } = useDoctor()
  const { stats, loading: statsLoading } = useDoctorDashboardStats()
  const { appointments: upcomingAppointments, loading: appointmentsLoading } = useDoctorAppointments({
    status: "confirmed",
    date: new Date().toISOString().split("T")[0],
    limit: 3,
  })

  const statsData = [
    {
      label: "Ca khám hôm nay",
      value: stats?.todayAppointments || "0",
      icon: Calendar,
      color: "teal",
    },
    {
      label: "Slot trống",
      value: stats?.availableSlots || "0",
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Chờ xác nhận",
      value: stats?.pendingAppointments || "0",
      icon: Users,
      color: "orange",
    },
    {
      label: "Hoàn thành",
      value: stats?.completedAppointments || "0",
      icon: TrendingUp,
      color: "green",
    },
  ]

  const quickActions = [
    { label: "Xem lịch hôm nay", icon: Calendar, action: "schedule", onClick: onViewSchedule },
    { label: "Quản lý slot", icon: Clock, action: "slots", onClick: onViewSchedule },
    { label: "Chặn thời gian", icon: Users, action: "block", onClick: onViewSchedule },
    { label: "Tạo tóm tắt", icon: FileText, action: "summary", onClick: () => {} },
    { label: "Lịch sử khám", icon: TrendingUp, action: "history", onClick: () => {} },
    { label: "Khám video", icon: Video, action: "video", onClick: () => {} },
  ]

  const colorClasses = {
    teal: "bg-primary/10 text-primary",
    yellow: "bg-accent/10 text-amber-700",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
  }

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAppointmentType = (appointment) => {
    return appointment.reason || "Khám tổng quát"
  }

  if (doctorLoading || statsLoading) {
    return (
      <div className="max-w-[1400px]">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Chào mừng, BS. {doctor?.fullName || "Bác sĩ"}</h1>
        <p className="text-gray-600">Hôm nay là ngày {new Date().toLocaleDateString("vi-VN")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 flex items-center gap-6 hover:-translate-y-1 transition-transform"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[stat.color]}`}
              >
                <Icon size={24} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Lịch hẹn sắp tới</h2>
            <button
              className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              onClick={onViewAppointments}
              type="button"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {appointmentsLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải lịch hẹn...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có lịch hẹn nào hôm nay</div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="text-lg font-semibold text-primary min-w-[60px]">
                    {formatTime(appointment.scheduledStart)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {appointment.patientId?.fullName || "Bệnh nhân"}
                    </div>
                    <div className="text-sm text-gray-600">{formatAppointmentType(appointment)}</div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.mode === "online" ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {appointment.mode === "online" ? "Trực tuyến" : "Tại viện"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-amber-700"
                      }`}
                    >
                      {appointment.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thao tác nhanh</h2>
          <div className="space-y-3 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-accent hover:bg-accent/90 text-gray-900 rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                  type="button"
                >
                  <Icon size={20} />
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-6 bg-gray-50 rounded-xl text-center">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {doctor?.avatarUrl ? (
                <img src={doctor.avatarUrl} alt="Doctor Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                "BS"
              )}
            </div>
            <div className="font-semibold text-gray-900 mb-1">BS. {doctor?.fullName || "Bác sĩ"}</div>
            <div className="text-sm text-gray-600 mb-4">
              {doctor?.specializationIds?.map((spec) => spec.name).join(", ") || "Chuyên khoa"}
            </div>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
              {doctor?.isVerified ? "Đang hoạt động" : "Chờ xác minh"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

DashboardOverview.propTypes = {
  onViewAppointments: PropTypes.func, 
}

DashboardOverview.defaultProps = {
  onViewAppointments: () => {},
}

export default DashboardOverview
