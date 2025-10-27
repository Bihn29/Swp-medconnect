import { useState, useEffect } from "react";
import { Clock, Users, FileText } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import "./DoctorDashboard.scss";
import { getDoctorProfileWithFallback, getDoctorDashboardStatsWithFallback } from "../../../lib/api";

export default function DoctorDashboard() {
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Fetch doctor info and dashboard stats
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // Fetch doctor info
        const doctor = await getDoctorProfileWithFallback();
        if (doctor) {
          setDoctorInfo(doctor);
        } else {
          console.error("No doctor found");
        }

        // Fetch dashboard stats
        const stats = await getDoctorDashboardStatsWithFallback();
        if (stats) setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();

    // Listen for doctor profile update event
    const handleDoctorProfileUpdate = (event) => {
      if (event.detail?.doctor) {
        setDoctorInfo(event.detail.doctor);
      } else {
        fetchDoctorData();
      }
    };

    window.addEventListener('doctorProfileUpdated', handleDoctorProfileUpdate);

    return () => {
      window.removeEventListener('doctorProfileUpdated', handleDoctorProfileUpdate);
    };
  }, []);

  const stats = dashboardStats
    ? [
        {
          label: "Ca khám hôm nay",
          value: dashboardStats.todayAppointmentsCount || "0",
          icon: Clock,
          color: "dashboard-stat-card-teal",
        },
        {
          label: "Slot trống",
          value: dashboardStats.availableSlotsToday || "0",
          icon: Users,
          color: "dashboard-stat-card-teal",
        },
        {
          label: "Lịch hẹn chờ",
          value: dashboardStats.pendingAppointmentsCount || "0",
          icon: FileText,
          color: "dashboard-stat-card-teal",
        },
        {
          label: "Tổng ca tuần này",
          value: dashboardStats.weeklyAppointmentsCount || "0",
          icon: FileText,
          color: "dashboard-stat-card-teal",
        },
      ]
    : [];

  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-main-content">
        <main className="doctor-content-area">
          <div className="dashboard-content-padding">
            <div className="dashboard-main-content">
              <div className="dashboard-stats">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="stat-card">
                      <div className="stat-card-content">
                        <div>
                          <p className="stat-label">{stat.label}</p>
                          <p className="stat-value">{stat.value}</p>
                        </div>
                        <Icon className="stat-icon" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Card className="dashboard-info-card">
                <h3 className="dashboard-info-title">Thông tin nhanh</h3>
                <div className="dashboard-info-content">
                  <div>
                    <p className="dashboard-info-label">Lịch hẹn hôm nay</p>
                    <p className="dashboard-info-value">
                      {dashboardStats?.todayAppointmentsCount || "0"} cuộc hẹn
                    </p>
                  </div>
                  <div>
                    <p className="dashboard-info-label">Slot trống</p>
                    <p className="dashboard-info-value">
                      {dashboardStats?.availableSlotsToday || "0"} slot
                    </p>
                  </div>
                  <div>
                    <p className="dashboard-info-label">Chờ xác nhận</p>
                    <p className="dashboard-info-value">
                      {dashboardStats?.pendingAppointmentsCount || "0"} lịch hẹn
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
