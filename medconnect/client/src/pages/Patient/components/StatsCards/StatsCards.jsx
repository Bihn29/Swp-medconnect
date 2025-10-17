import React from "react";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/Card";

const stats = [
  {
    title: "Tổng lịch hẹn",
    value: "24",
    icon: Calendar,
    description: "Trong tháng này",
    trend: "+12% so với tháng trước",
    trendUp: true,
  },
  {
    title: "Đang chờ",
    value: "3",
    icon: Clock,
    description: "Chờ xác nhận",
    trend: "-2 so với tháng trước",
    trendUp: false,
  },
  {
    title: "Đã hoàn thành",
    value: "18",
    icon: CheckCircle2,
    description: "Tháng này",
    trend: "+8 so với tháng trước",
    trendUp: true,
  },
  {
    title: "Đã hủy",
    value: "3",
    icon: XCircle,
    description: "Tháng này",
    trend: "0 so với tháng trước",
    trendUp: null, // neutral
  },
];

export function StatsCards() {
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
              border: "1px solid #e5e7eb",
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
