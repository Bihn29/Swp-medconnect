import React from "react";
import { Clock, MapPin, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import "./UpcomingAppointments.scss";

const appointments = [
  {
    id: 1,
    doctor: "BS. Trần Thị B",
    specialty: "Tim mạch",
    date: "16/10/2025",
    time: "09:00",
    location: "Phòng khám 201",
    status: "confirmed",
  },
  {
    id: 2,
    doctor: "BS. Lê Văn C",
    specialty: "Nội khoa",
    date: "20/10/2025",
    time: "14:30",
    location: "Phòng khám 105",
    status: "pending",
  },
  {
    id: 3,
    doctor: "BS. Phạm Thị D",
    specialty: "Da liễu",
    date: "25/10/2025",
    time: "10:15",
    location: "Phòng khám 308",
    status: "confirmed",
  },
];

const statusConfig = {
  confirmed: { label: "Đã xác nhận", variant: "default" },
  pending: { label: "Chờ xác nhận", variant: "secondary" },
};

export function UpcomingAppointments() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-balance">Lịch hẹn sắp tới</CardTitle>
          <Button variant="ghost" size="sm">
            Xem tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-balance">
                        {appointment.doctor}
                      </p>
                      <Badge variant={statusConfig[appointment.status].variant}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.specialty}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>
                      {appointment.date} - {appointment.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{appointment.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button size="sm" className="flex-1 sm:flex-none">
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none bg-transparent"
                >
                  Hủy
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
