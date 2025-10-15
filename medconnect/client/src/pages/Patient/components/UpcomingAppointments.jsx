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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const appointments = [
  {
    id: 1,
    doctor: "BS. Nguyễn Văn An",
    specialty: "Tim mạch",
    date: "15 Tháng 5, 2025",
    time: "09:00 - 09:30",
    type: "offline",
    location: "Phòng 302, Tầng 3",
    status: "confirmed",
    avatar: "/doctor-male.jpg",
    canJoin: false,
  },
  {
    id: 2,
    doctor: "BS. Trần Thị Bình",
    specialty: "Da liễu",
    date: "17 Tháng 5, 2025",
    time: "14:00 - 14:30",
    type: "online",
    location: "Video call",
    status: "confirmed",
    avatar: "/doctor-female.jpg",
    canJoin: true,
  },
  {
    id: 3,
    doctor: "BS. Lê Minh Châu",
    specialty: "Nội tổng quát",
    date: "20 Tháng 5, 2025",
    time: "10:30 - 11:00",
    type: "offline",
    location: "Phòng 105, Tầng 1",
    status: "pending",
    avatar: "/doctor-female-2.jpg",
    canJoin: false,
  },
];

export function UpcomingAppointments() {
  return (
    <Card className="medical-card fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">
          Lịch hẹn sắp tới
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={appointment.avatar || "/placeholder.svg"}
                alt={appointment.doctor}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {appointment.doctor.split(" ").pop()?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {appointment.doctor}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {appointment.specialty}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreOutlined style={{ fontSize: "16px" }} />
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarOutlined style={{ fontSize: "16px" }} />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockCircleOutlined style={{ fontSize: "16px" }} />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {appointment.type === "online" ? (
                    <VideoCameraOutlined style={{ fontSize: "16px" }} />
                  ) : (
                    <EnvironmentOutlined style={{ fontSize: "16px" }} />
                  )}
                  <span>{appointment.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    appointment.status === "confirmed" ? "default" : "secondary"
                  }
                  className={
                    appointment.status === "confirmed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }
                >
                  {appointment.status === "confirmed"
                    ? "Đã xác nhận"
                    : "Chờ xác nhận"}
                </Badge>
                <Badge variant="outline">
                  {appointment.type === "online" ? "Trực tuyến" : "Trực tiếp"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {appointment.type === "online" && appointment.canJoin && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <VideoCameraOutlined
                      style={{ fontSize: "16px", marginRight: "6px" }}
                    />
                    Tham gia ngay
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <CalendarOutlined
                    style={{ fontSize: "16px", marginRight: "6px" }}
                  />
                  Dời lịch
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  Hủy lịch
                </Button>
                <Button size="sm" variant="outline">
                  Chi tiết
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
