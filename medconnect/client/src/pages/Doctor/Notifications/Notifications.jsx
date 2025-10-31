import { useState, useEffect } from "react";
import { Bell, Calendar, DollarSign, MessageSquare, Video, CheckCheck, Filter } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useDoctorNotifications } from "../../../hooks/useDoctor";
import "./Notifications.scss";

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const { notifications, loading, error, markAsRead, markAllAsRead } = useDoctorNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return <Calendar className="notification-icon notification-icon-blue" />;
      case "payment":
        return <DollarSign className="notification-icon notification-icon-green" />;
      case "message":
        return <MessageSquare className="notification-icon notification-icon-purple" />;
      case "video_call":
        return <Video className="notification-icon notification-icon-red" />;
      default:
        return <Bell className="notification-icon notification-icon-gray" />;
    }
  };

  const getNotificationBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="notification-badge notification-badge-high">Quan trọng</Badge>;
      case "medium":
        return <Badge className="notification-badge notification-badge-medium">Trung bình</Badge>;
      case "low":
        return <Badge className="notification-badge notification-badge-low">Thấp</Badge>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải thông báo...</div>
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
    <div className="notifications-container">
      <div className="notifications-header">
        <div>
          <h2 className="notifications-title">
            Thông báo
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-700">
                {unreadCount} chưa đọc
              </Badge>
            )}
          </h2>
          <p className="notifications-subtitle">Thông báo hệ thống và cập nhật</p>
        </div>
      </div>

      {/* Actions */}
      <div className="notifications-actions-bar">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="notifications-filter-select"
        >
          <option value="all">Tất cả</option>
          <option value="unread">Chưa đọc</option>
          <option value="appointment">Lịch hẹn</option>
          <option value="payment">Thanh toán</option>
          <option value="message">Tin nhắn</option>
          <option value="video_call">Video call</option>
        </select>
        
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            className="notifications-mark-all-btn"
          >
            <CheckCheck className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có thông báo
            </h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? "Bạn chưa có thông báo nào" 
                : `Không có thông báo loại "${filter}"`}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`notification-item ${!notification.isRead ? "unread" : ""}`}
              onClick={() => handleMarkAsRead(notification._id)}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-body">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <div className="notification-meta">
                      {getNotificationBadge(notification.priority)}
                      <span className="notification-time">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.data && (
                    <div className="notification-data">
                      {notification.data.patientName && (
                        <span className="text-sm text-gray-600">
                          Bệnh nhân: {notification.data.patientName}
                        </span>
                      )}
                      {notification.data.appointmentDate && (
                        <span className="text-sm text-gray-600">
                          Ngày: {new Date(notification.data.appointmentDate).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {!notification.isRead && (
                  <div className="notification-indicator">
                    <div className="unread-dot"></div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}