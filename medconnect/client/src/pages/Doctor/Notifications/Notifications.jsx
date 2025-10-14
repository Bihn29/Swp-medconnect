"use client"

import { useState } from "react"
import { Bell, Calendar, DollarSign, MessageSquare, Video, CheckCheck } from "lucide-react"

const Notifications = () => {
  const [filter, setFilter] = useState("all")

  const notifications = [
    {
      id: 1,
      type: "appointment",
      title: "Lịch hẹn mới",
      message: "Bệnh nhân Nguyễn Văn A đã đặt lịch khám vào 15/10/2025 lúc 09:00",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
      priority: "high",
    },
    {
      id: 2,
      type: "payment",
      title: "Thanh toán thành công",
      message: "Bệnh nhân Trần Thị B đã thanh toán 500,000 VNĐ cho lịch hẹn #12345",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
      priority: "medium",
    },
    {
      id: 3,
      type: "message",
      title: "Tin nhắn mới",
      message: "Bệnh nhân Lê Văn C đã gửi tin nhắn cho bạn",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isRead: true,
      priority: "low",
    },
    {
      id: 4,
      type: "video",
      title: "Cuộc gọi video sắp diễn ra",
      message: "Cuộc gọi video với bệnh nhân Phạm Thị D sẽ bắt đầu trong 15 phút",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
      priority: "high",
    },
    {
      id: 5,
      type: "system",
      title: "Cập nhật hệ thống",
      message: "Hệ thống sẽ bảo trì vào 20/10/2025 từ 00:00 đến 02:00",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      isRead: true,
      priority: "medium",
    },
  ]

  const getIcon = (type) => {
    switch (type) {
      case "appointment":
        return <Calendar size={20} />
      case "payment":
        return <DollarSign size={20} />
      case "message":
        return <MessageSquare size={20} />
      case "video":
        return <Video size={20} />
      default:
        return <Bell size={20} />
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "appointment":
        return "bg-primary/10 text-primary"
      case "payment":
        return "bg-green-100 text-green-600"
      case "message":
        return "bg-blue-100 text-blue-600"
      case "video":
        return "bg-purple-100 text-purple-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    return `${days} ngày trước`
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true
    if (filter === "unread") return !notif.isRead
    return notif.type === filter
  })

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Thông báo</h1>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CheckCheck size={18} />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "all" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "unread" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("unread")}
        >
          Chưa đọc
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "appointment" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("appointment")}
        >
          Lịch hẹn
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "payment" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("payment")}
        >
          Thanh toán
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === "message" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => setFilter("message")}
        >
          Tin nhắn
        </button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-md p-6 flex items-start gap-6 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer ${
              !notification.isRead ? "border-l-4 border-primary" : ""
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}
            >
              {getIcon(notification.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                <span className="text-sm text-gray-500">{formatTimestamp(notification.timestamp)}</span>
              </div>
              <p className="text-gray-600 text-sm">{notification.message}</p>
            </div>

            {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications
