import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { Phone, Video, Clock } from "lucide-react"
import "./UpcomingAppointments.scss"

export default function UpcomingAppointments() {
  const appointments = [
    {
      id: 1,
      patient: "Vũ Thị E",
      time: "2:30 PM",
      type: "Gọi video",
      reason: "Tư vấn theo dõi",
      status: "Chờ xác nhận",
    },
    {
      id: 2,
      patient: "Đỗ Văn F",
      time: "3:45 PM",
      type: "Trực tiếp",
      reason: "Tư vấn ban đầu",
      status: "Đã xác nhận",
    },
    {
      id: 3,
      patient: "Hoàng Thị G",
      time: "4:30 PM",
      type: "Gọi điện",
      reason: "Cấp lại đơn thuốc",
      status: "Đã xác nhận",
    },
  ]

  return (
    <Card className="upcoming-appointments-card">
      <CardHeader className="upcoming-appointments-header">
        <CardTitle>Lịch hẹn sắp tới</CardTitle>
        <Button variant="outline" size="sm" className="upcoming-appointments-view-all">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent>
        <div className="upcoming-appointments-list">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="upcoming-appointments-item"
            >
              <div className="upcoming-appointments-item-content">
                <div className="upcoming-appointments-item-header">
                  <p className="upcoming-appointments-item-patient">{apt.patient}</p>
                  <Badge variant="outline" className="upcoming-appointments-item-status">
                    {apt.status}
                  </Badge>
                </div>
                <div className="upcoming-appointments-item-details">
                  <div className="upcoming-appointments-item-detail">
                    <Clock className="upcoming-appointments-item-detail-icon" />
                    <span className="upcoming-appointments-item-detail-text">{apt.time}</span>
                  </div>
                  <div className="upcoming-appointments-item-detail">
                    {apt.type === "Gọi video" ? (
                      <Video className="upcoming-appointments-item-detail-icon" />
                    ) : apt.type === "Gọi điện" ? (
                      <Phone className="upcoming-appointments-item-detail-icon" />
                    ) : null}
                    <span className="upcoming-appointments-item-detail-text">{apt.type}</span>
                  </div>
                </div>
                <p className="upcoming-appointments-item-reason">{apt.reason}</p>
              </div>
              <Button size="sm" className="upcoming-appointments-item-view-btn">
                Xem
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
