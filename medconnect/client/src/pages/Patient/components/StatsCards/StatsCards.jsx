import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/Card";
import { api } from "../../../../lib/api";
import { Spin } from "antd";

export function StatsCards() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all appointments
      const response = await api.get("/api/patients/me/appointments");

      if (response.success) {
        const appointments = response.data.appointments || [];

        // Calculate stats
        const totalAppointments = appointments.length;
        const pendingAppointments = appointments.filter(
          (apt) => apt.status === "pending_doctor"
        ).length;
        const completedAppointments = appointments.filter(
          (apt) => apt.status === "done"
        ).length;
        const cancelledAppointments = appointments.filter(
          (apt) => apt.status === "cancelled"
        ).length;

        const statsData = [
          {
            title: "Tổng lịch hẹn",
            value: totalAppointments.toString(),
            icon: Calendar,
            description: "Tất cả thời gian",
            trend:
              totalAppointments > 0
                ? `+${totalAppointments} lịch hẹn`
                : "Chưa có lịch hẹn",
            trendUp: totalAppointments > 0,
          },
          {
            title: "Đang chờ",
            value: pendingAppointments.toString(),
            icon: Clock,
            description: "Chờ xác nhận",
            trend:
              pendingAppointments > 0
                ? `${pendingAppointments} lịch chờ`
                : "Không có lịch chờ",
            trendUp: null,
          },
          {
            title: "Đã hoàn thành",
            value: completedAppointments.toString(),
            icon: CheckCircle2,
            description: "Đã khám xong",
            trend:
              completedAppointments > 0
                ? `${completedAppointments} lịch hoàn thành`
                : "Chưa có lịch hoàn thành",
            trendUp: completedAppointments > 0,
          },
          {
            title: "Đã hủy",
            value: cancelledAppointments.toString(),
            icon: XCircle,
            description: "Đã hủy",
            trend:
              cancelledAppointments > 0
                ? `${cancelledAppointments} lịch đã hủy`
                : "Không có lịch hủy",
            trendUp: false,
          },
        ];

        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default stats if API fails
      setStats([
        {
          title: "Tổng lịch hẹn",
          value: "0",
          icon: Calendar,
          description: "Không thể tải dữ liệu",
          trend: "Lỗi kết nối",
          trendUp: null,
        },
        {
          title: "Đang chờ",
          value: "0",
          icon: Clock,
          description: "Không thể tải dữ liệu",
          trend: "Lỗi kết nối",
          trendUp: null,
        },
        {
          title: "Đã hoàn thành",
          value: "0",
          icon: CheckCircle2,
          description: "Không thể tải dữ liệu",
          trend: "Lỗi kết nối",
          trendUp: null,
        },
        {
          title: "Đã hủy",
          value: "0",
          icon: XCircle,
          description: "Không thể tải dữ liệu",
          trend: "Lỗi kết nối",
          trendUp: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #cbd5e1",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "150px",
            }}
          >
            <Spin size="large" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #cbd5e1",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#374151",
                    margin: 0,
                  }}
                >
                  {stat.title}
                </p>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#111827",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  {stat.description}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#dbeafe",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#2563eb",
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  color:
                    stat.trendUp === true
                      ? "#16a34a"
                      : stat.trendUp === false
                      ? "#dc2626"
                      : "#6b7280",
                }}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
