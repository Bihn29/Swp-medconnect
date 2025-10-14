"use client"

import PropTypes from "prop-types";
import { LayoutDashboard, Calendar, Users, FileText, Settings, Bell, MessageSquare, Video, Shield } from "lucide-react"

const Sidebar = ({ activeView, onNavigate }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Tổng quan hôm nay",
    },
    {
      id: "schedule",
      label: "Lịch làm việc",
      icon: Calendar,
      description: "Quản lý slot & lịch",
    },
    {
      id: "appointments",
      label: "Lịch hẹn",
      icon: Users,
      description: "Danh sách lịch hẹn",
    },
    {
      id: "consultations",
      label: "Hồ sơ khám",
      icon: FileText,
      description: "Lịch sử tư vấn",
    },
    {
      id: "notifications",
      label: "Thông báo",
      icon: Bell,
      description: "Thông báo hệ thống",
    },
    {
      id: "feedback",
      label: "Đánh giá",
      icon: MessageSquare,
      description: "Phản hồi bệnh nhân",
    },
    {
      id: "profile",
      label: "Hồ sơ",
      icon: Settings,
      description: "Cài đặt cá nhân",
    },
  ]

  return (
    <div className="w-[280px] bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">MedConnect</h1>
            <p className="text-xs text-gray-500">Doctor Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all group ${
                  isActive ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={`text-xs ${isActive ? "text-white/80" : "text-gray-500"}`}>{item.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Video className="text-primary" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">Video Call</div>
              <div className="text-xs text-gray-500">Sẵn sàng khám online</div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  activeView: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default Sidebar
