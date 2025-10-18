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
  LoadingOutlined,
} from "@ant-design/icons";
import { usePatientAppointments } from "../../../hooks/usePatientAppointments";

export function UpcomingAppointments() {
  const { upcomingAppointments, loading, error, refreshAppointments } = usePatientAppointments();

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_doctor':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >
            Chờ bác sĩ xác nhận
          </Badge>
        );
      case 'accepted':
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          >
            Đã chấp nhận
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          >
            Đã xác nhận
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          >
            Đang diễn ra
          </Badge>
        );
      case 'cancelled':
      case 'auto_cancelled':
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          >
            Đã hủy
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          >
            Bị từ chối
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const canJoinVideoCall = (appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.scheduledStart);
    const endTime = new Date(appointment.scheduledEnd);
    
    return appointment.mode === 'online' && 
           appointment.status === 'confirmed' && 
           now >= startTime && 
           now <= endTime;
  };

  if (loading) {
    return (
      <Card className="medical-card fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold">
            Lịch hẹn sắp tới
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
            Lịch hẹn sắp tới
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
          Lịch hẹn sắp tới
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <p className="text-muted-foreground mt-4">Chưa có lịch hẹn sắp tới</p>
            <Button className="mt-4" onClick={() => window.location.href = '/appointment'}>
              Đặt lịch ngay
            </Button>
          </div>
        ) : (
          upcomingAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreOutlined style={{ fontSize: "16px" }} />
                  </Button>
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
                  {getStatusBadge(appointment.status)}
                  <Badge variant="outline">
                    {appointment.mode === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {canJoinVideoCall(appointment) && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <VideoCameraOutlined
                        style={{ fontSize: "16px", marginRight: "6px" }}
                      />
                      Tham gia ngay
                    </Button>
                  )}
                  {appointment.status === 'pending_doctor' && (
                    <Button size="sm" variant="outline" disabled>
                      <CalendarOutlined
                        style={{ fontSize: "16px", marginRight: "6px" }}
                      />
                      Dời lịch
                    </Button>
                  )}
                  {(appointment.status === 'accepted' || appointment.status === 'confirmed') && (
                    <Button size="sm" variant="outline">
                      <CalendarOutlined
                        style={{ fontSize: "16px", marginRight: "6px" }}
                      />
                      Dời lịch
                    </Button>
                  )}
                  {!['cancelled', 'auto_cancelled', 'rejected', 'done'].includes(appointment.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      Hủy lịch
                    </Button>
                  )}
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
