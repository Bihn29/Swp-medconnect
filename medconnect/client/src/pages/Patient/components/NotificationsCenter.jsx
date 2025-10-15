import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  BellOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const notifications = [
  {
    id: 1,
    type: "appointment_confirmed",
    title: "Lịch hẹn đã được xác nhận",
    message: "Lịch khám với BS. Nguyễn Văn An vào 15/05/2025 lúc 09:00",
    time: "2 giờ trước",
    read: false,
    icon: CheckCircleOutlined,
    iconColor: "text-green-600",
  },
  {
    id: 2,
    type: "appointment_reminder",
    title: "Nhắc nhở lịch hẹn",
    message: "Bạn có lịch khám với BS. Trần Thị Bình vào ngày mai lúc 14:00",
    time: "5 giờ trước",
    read: false,
    icon: BellOutlined,
    iconColor: "text-amber-600",
  },
  {
    id: 3,
    type: "prescription_ready",
    title: "Đơn thuốc đã sẵn sàng",
    message: "Đơn thuốc từ buổi khám ngày 10/04 đã được cập nhật",
    time: "1 ngày trước",
    read: true,
    icon: FileTextOutlined,
    iconColor: "text-blue-600",
  },
  {
    id: 4,
    type: "payment_success",
    title: "Thanh toán thành công",
    message: "Đã thanh toán 500,000 ₫ cho lịch hẹn #APT-001234",
    time: "2 ngày trước",
    read: true,
    icon: CreditCardOutlined,
    iconColor: "text-green-600",
  },
];

export function NotificationsCenter() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="medical-card fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-semibold">Thông báo</CardTitle>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="h-5 min-w-5 rounded-full px-1.5"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-lg border p-3 hover:bg-muted/50 transition-colors ${
              !notification.read ? "bg-primary/5 border-primary/20" : "bg-card"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-full bg-background p-2 ${notification.iconColor}`}
              >
                <notification.icon style={{ fontSize: "16px" }} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
