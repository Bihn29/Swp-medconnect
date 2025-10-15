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
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";

const history = [
  {
    id: 1,
    doctor: "BS. Phạm Thị Dung",
    specialty: "Nội khoa",
    date: "10 Tháng 4, 2025",
    time: "15:00",
    diagnosis: "Viêm họng cấp",
    paymentStatus: "paid",
    hasPrescription: true,
    hasSummary: true,
    rating: 5,
    avatar: "/doctor-female.jpg",
  },
  {
    id: 2,
    doctor: "BS. Hoàng Minh Tuấn",
    specialty: "Tai mũi họng",
    date: "25 Tháng 3, 2025",
    time: "10:30",
    diagnosis: "Viêm xoang mãn tính",
    paymentStatus: "paid",
    hasPrescription: true,
    hasSummary: true,
    rating: 0,
    avatar: "/doctor-male.jpg",
  },
  {
    id: 3,
    doctor: "BS. Nguyễn Thu Hà",
    specialty: "Nhi khoa",
    date: "15 Tháng 3, 2025",
    time: "09:00",
    diagnosis: "Cảm cúm thông thường",
    paymentStatus: "paid",
    hasPrescription: true,
    hasSummary: true,
    rating: 4,
    avatar: "/doctor-female-2.jpg",
  },
];

export function AppointmentHistory() {
  return (
    <Card className="medical-card fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">
          Lịch sử khám bệnh
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((record) => (
          <div
            key={record.id}
            className="flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={record.avatar || "/placeholder.svg"}
                alt={record.doctor}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {record.doctor.split(" ").pop()?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {record.doctor}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {record.specialty}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarOutlined style={{ fontSize: "16px" }} />
                  <span>{record.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockCircleOutlined style={{ fontSize: "16px" }} />
                  <span>{record.time}</span>
                </div>
              </div>

              <p className="text-sm">
                <span className="font-medium">Chẩn đoán:</span>{" "}
                {record.diagnosis}
              </p>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  {record.paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </Badge>
                {record.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <StarOutlined
                      style={{ fontSize: "16px", color: "#d97706" }}
                    />
                    <span>{record.rating}/5</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {record.hasSummary && (
                  <Button size="sm" variant="outline">
                    <FileTextOutlined
                      style={{ fontSize: "16px", marginRight: "6px" }}
                    />
                    Xem tóm tắt
                  </Button>
                )}
                {record.hasPrescription && (
                  <Button size="sm" variant="outline">
                    <FileTextOutlined
                      style={{ fontSize: "16px", marginRight: "6px" }}
                    />
                    Đơn thuốc
                  </Button>
                )}
                {record.rating === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 hover:text-amber-700 bg-transparent"
                  >
                    <StarOutlined
                      style={{ fontSize: "16px", marginRight: "6px" }}
                    />
                    Đánh giá
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
