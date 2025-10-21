"use client"

import { Card, CardContent } from "../../../components/ui/Card"
import { Users, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import "./StatsGrid.scss"

const stats = [
  {
    icon: Users,
    label: "Tổng bệnh nhân",
    value: "1,248",
    change: "+12% từ tháng trước",
    color: "text-blue-500",
  },
  {
    icon: Calendar,
    label: "Lịch hẹn hôm nay",
    value: "8",
    change: "2 chờ xác nhận",
    color: "text-teal-500",
  },
  {
    icon: CheckCircle,
    label: "Hoàn thành",
    value: "6",
    change: "lịch hẹn hôm nay",
    color: "text-green-500",
  },
  {
    icon: AlertCircle,
    label: "Cần theo dõi",
    value: "12",
    change: "từ tuần trước",
    color: "text-orange-500",
  },
]

export default function StatsGrid() {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <Card key={stat.label} className="stats-card">
          <CardContent className="stats-card-content">
            <div className="stats-card-body">
              <div className="stats-card-info">
                <p className="stats-card-label">{stat.label}</p>
                <p className="stats-card-value">{stat.value}</p>
                <p className="stats-card-change">{stat.change}</p>
              </div>
              <div className="stats-card-icon">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
