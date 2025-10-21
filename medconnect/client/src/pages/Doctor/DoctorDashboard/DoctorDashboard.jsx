import { useState, useEffect } from "react";
import { Clock, Users, FileText, Upload } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import Sidebar from "../Sidebar/Sidebar";
import ScheduleManagement from "../ScheduleManagement/ScheduleManagement";
import AppointmentList from "../AppointmentList/AppointmentList";
import MedicalHistory from "../MedicalHistory/MedicalHistory";
import ProfileSettings from "../ProfileSettings/ProfileSettings";
import "./DoctorDashboard.scss";
import { getDoctorProfileWithFallback, getDoctorDashboardStatsWithFallback, api } from "../../../lib/api";

export default function DoctorDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
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
          console.error('No doctor found');
        }

            // Fetch dashboard stats
            const stats = await getDoctorDashboardStatsWithFallback();
            if (stats) setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();
  }, []);

  // Get doctor info from API data
  const doctorName = doctorInfo?.userId?.fullName || doctorInfo?.fullName || "Đang tải...";
  const doctorAvatar = doctorInfo?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor";

  const stats = dashboardStats ? [
    {
      label: "Ca khám hôm nay",
      value: dashboardStats.todayAppointmentsCount || "0",
      icon: Clock,
      color: "dashboard-stat-card-teal"
    },
    {
      label: "Slot trống",
      value: dashboardStats.availableSlotsToday || "0",
      icon: Users,
      color: "dashboard-stat-card-teal"
    },
    {
      label: "Lịch hẹn chờ",
      value: dashboardStats.pendingAppointmentsCount || "0",
      icon: FileText,
      color: "dashboard-stat-card-teal"
    },
    {
      label: "Tổng ca tuần này",
      value: dashboardStats.weeklyAppointmentsCount || "0",
      icon: FileText,
      color: "dashboard-stat-card-teal"
    }
  ] : [];

  return (
    <div className="doctor-dashboard-container">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="doctor-main-content">
        <main className="doctor-content-area">
          <div className="dashboard-content-padding">
            {/* Dashboard */}
            {activeMenu === "dashboard" && (
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

                <div className="dashboard-grid">
                  <Card className="dashboard-shortcuts-card">
                    <h3 className="dashboard-shortcuts-title">Lối tắt</h3>
                    <div className="dashboard-shortcuts-buttons">
                      <Button
                        onClick={() => setActiveMenu("schedule")}
                        variant="outline"
                        className="dashboard-shortcut-btn"
                      >
                        Xem lịch làm việc
                      </Button>
                      <Button
                        onClick={() => setActiveMenu("appointments")}
                        variant="outline"
                        className="dashboard-shortcut-btn"
                      >
                        Xem lịch hẹn
                      </Button>
                      <Button
                        onClick={() => setActiveMenu("medical-history")}
                        variant="outline"
                        className="dashboard-shortcut-btn"
                      >
                        Tạo tóm tắt khám
                      </Button>
                    </div>
                  </Card>

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
            )}

            {/* Schedule */}
            {activeMenu === "schedule" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-900">Lịch làm việc tuần</h3>
                <ScheduleManagement />
              </div>
            )}

            {/* Appointments */}
            {activeMenu === "appointments" && (
              <div className="space-y-6">
                <AppointmentList />
              </div>
            )}

                 {/* Medical History */}
                 {activeMenu === "medical-history" && <MedicalHistory />}

                 {/* Notifications */}
                 {activeMenu === "notifications" && (
                   <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-slate-900">Thông báo hệ thống</h3>
                     <div className="bg-white p-6 rounded-lg border border-gray-200">
                       <p className="text-gray-600">Chưa có thông báo mới</p>
                     </div>
                   </div>
                 )}

                 {/* Reviews */}
                 {activeMenu === "reviews" && (
                   <div className="space-y-6">
                     <h3 className="text-xl font-semibold text-slate-900">Đánh giá từ bệnh nhân</h3>
                     <div className="bg-white p-6 rounded-lg border border-gray-200">
                       <p className="text-gray-600">Chưa có đánh giá nào</p>
                     </div>
                   </div>
                 )}

            {/* Settings */}
            {activeMenu === "settings" && (
              <div className="space-y-6">
                <Card className="p-6 border-0 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Cập nhật ảnh đại diện</h3>
                  <div className="flex items-center gap-6">
                    <img
                      src={doctorAvatar || "/placeholder.svg"}
                      alt={doctorName}
                      className="w-24 h-24 rounded-full border-2 border-teal-600"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Chọn ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              // Validate file size (max 2MB)
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Kích thước ảnh không được vượt quá 2MB");
                                return;
                              }

                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                alert("Vui lòng chọn file ảnh hợp lệ");
                                return;
                              }

                              // Resize image to reduce size
                              const canvas = document.createElement('canvas');
                              const ctx = canvas.getContext('2d');
                              const img = new Image();
                              
                              img.onload = async () => {
                                // Calculate new dimensions (max 300x300)
                                const maxSize = 300;
                                let { width, height } = img;
                                
                                if (width > height) {
                                  if (width > maxSize) {
                                    height = (height * maxSize) / width;
                                    width = maxSize;
                                  }
                                } else {
                                  if (height > maxSize) {
                                    width = (width * maxSize) / height;
                                    height = maxSize;
                                  }
                                }
                                
                                canvas.width = width;
                                canvas.height = height;
                                
                                // Draw resized image
                                ctx.drawImage(img, 0, 0, width, height);
                                
                                // Convert to base64 with quality 0.8
                                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                                
                                // Call API to update avatar
                                await api.put("/api/doctors/me/profile", { avatarUrl: base64 });
                                alert("Ảnh đại diện đã được cập nhật thành công");
                                // Refresh doctor data
                                window.location.reload();
                              };
                              
                              img.src = URL.createObjectURL(file);
                            } catch (error) {
                              console.error("Error updating avatar:", error);
                              alert("Có lỗi xảy ra khi cập nhật ảnh đại diện");
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </Card>
                <ProfileSettings />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}