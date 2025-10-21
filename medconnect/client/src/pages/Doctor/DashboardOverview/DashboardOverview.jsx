import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Badge } from "../../../components/ui/Badge"
import { getDoctorAppointmentsWithFallback } from "../../../lib/api"
import "./DashboardOverview.scss"

export default function DashboardOverview() {
  const [todaySchedule, setTodaySchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        console.log("🔍 Fetching today's schedule for:", today);
        const response = await getDoctorAppointmentsWithFallback({ date: today });
        console.log("🔍 Today's schedule response:", response);
        
        if (response.success && response.data?.appointments) {
          setTodaySchedule(response.data.appointments);
          console.log("✅ Today's appointments loaded:", response.data.appointments.length);
        } else {
          console.log("⚠️ No appointments found for today");
          setTodaySchedule([]);
        }
      } catch (error) {
        console.error('Error fetching today schedule:', error);
        setTodaySchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySchedule();
  }, []);

  return (
    <Card className="dashboard-overview-card">
      <CardHeader>
        <CardTitle>Lịch làm việc hôm nay</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="dashboard-overview-schedule">
          {loading ? (
            <div className="text-center py-4">Đang tải lịch làm việc...</div>
          ) : todaySchedule.length === 0 ? (
            <div className="text-center py-4">Không có lịch hẹn nào hôm nay</div>
          ) : (
            todaySchedule.map((appointment, index) => (
              <div
                key={appointment._id || index}
                className="dashboard-overview-appointment"
              >
                <div className="dashboard-overview-appointment-content">
                  <div className="dashboard-overview-appointment-time">
                    {new Date(appointment.scheduledStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="dashboard-overview-appointment-info">
                    <p className="dashboard-overview-appointment-patient">
                      {appointment.patientId?.fullName || appointment.patient?.fullName || 'N/A'}
                    </p>
                    <p className="dashboard-overview-appointment-type">
                      Tư vấn {appointment.appointmentType || 'Trực tiếp'}
                    </p>
                  </div>
                </div>
                <div className="dashboard-overview-appointment-badges">
                  <Badge variant={appointment.appointmentType === "online" ? "default" : "secondary"}>
                    {appointment.appointmentType === "online" ? "Trực tuyến" : "Trực tiếp"}
                  </Badge>
                  <Badge
                    variant={appointment.status === "accepted" ? "default" : "outline"}
                    className={appointment.status === "accepted" ? "dashboard-overview-status-confirmed" : ""}
                  >
                    {appointment.status === "accepted" ? "Đã chấp nhận" : 
                     appointment.status === "pending_doctor" ? "Chờ bác sĩ xác nhận" : 
                     appointment.status === "in_progress" ? "Đang khám" :
                     appointment.status === "done" ? "Hoàn thành" :
                     appointment.status === "rejected" ? "Bác sĩ từ chối" :
                     appointment.status === "cancelled" ? "Đã hủy" :
                     appointment.status === "no_show" ? "Không đến khám" : appointment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}