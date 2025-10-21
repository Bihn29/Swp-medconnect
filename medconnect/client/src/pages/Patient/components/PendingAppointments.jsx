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
  LoadingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { usePatientAppointments } from "../../../hooks/usePatientAppointments";

export function PendingAppointments() {
  const { pendingAppointments, loading, error, refreshAppointments } = usePatientAppointments();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTimeUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return "Đã hết hạn";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `Còn ${diffHours}h ${diffMinutes}m`;
    } else {
      return `Còn ${diffMinutes}m`;
    }
  };

  if (loading) {
    return (
      <Card className="medical-card fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">
            Lịch hẹn chờ xác nhận
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingOutlined style={{ fontSize: '24px' }} />
          <span className="ml-2">Đang tải dữ liệu...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="medical-card fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">
            Lịch hẹn chờ xác nhận
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-red-500 mb-4">Lỗi: {error}</p>
          <Button onClick={refreshAppointments} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="medical-card fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">
          Lịch hẹn chờ xác nhận
        </CardTitle>
        <Badge 
          variant="secondary" 
          className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          {pendingAppointments.length} lịch hẹn
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <p className="text-muted-foreground mt-4">Không có lịch hẹn chờ xác nhận</p>
            <Button className="mt-4" onClick={() => window.location.href = '/appointment'}>
              Đặt lịch ngay
            </Button>
          </div>
        ) : (
          pendingAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors border-amber-200"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={appointment.doctorId?.avatarUrl || "/placeholder.svg"}
                  alt={appointment.doctorId?.fullName}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {appointment.doctorId?.fullName?.split(" ").pop()?.charAt(0) || "BS"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {appointment.doctorId?.fullName || "Bác sĩ"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctorId?.specializationIds?.[0]?.name || "Chuyên khoa"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExclamationCircleOutlined 
                      style={{ fontSize: "16px", color: "#f59e0b" }} 
                    />
                    <span className="text-xs text-amber-600 font-medium">
                      {getTimeUntilExpiry(appointment.autoExpireAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CalendarOutlined style={{ fontSize: "16px" }} />
                    <span>{formatDate(appointment.scheduledStart)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockCircleOutlined style={{ fontSize: "16px" }} />
                    <span>{formatTime(appointment.scheduledStart, appointment.scheduledEnd)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {appointment.mode === "online" ? (
                      <VideoCameraOutlined style={{ fontSize: "16px" }} />
                    ) : (
                      <EnvironmentOutlined style={{ fontSize: "16px" }} />
                    )}
                    <span>
                      {appointment.mode === "online" 
                        ? "Video call" 
                        : appointment.clinicId?.name || "Phòng khám"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  >
                    Chờ bác sĩ xác nhận
                  </Badge>
                  <Badge variant="outline">
                    {appointment.mode === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Badge>
                </div>

                {appointment.reason && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Lý do khám:</span> {appointment.reason}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
