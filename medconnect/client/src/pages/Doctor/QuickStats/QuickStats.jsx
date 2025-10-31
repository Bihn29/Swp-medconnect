import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Users, Calendar, Clock, CheckCircle } from "lucide-react";
import "./QuickStats.scss";

export default function QuickStats() {
  const stats = [
    {
      title: "Lịch hẹn hôm nay",
      value: "8",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Khe trống",
      value: "3",
      icon: Clock,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Tổng bệnh nhân",
      value: "245",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Hoàn thành hôm nay",
      value: "5",
      icon: CheckCircle,
      color: "bg-cyan-100 text-cyan-600",
    },
  ];

  return (
    <div className="quick-stats">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="quick-stats-card">
            <CardHeader className="quick-stats-header">
              <CardTitle className="quick-stats-title">{stat.title}</CardTitle>
              <div className={`quick-stats-icon ${stat.color}`}>
                <Icon className="quick-stats-icon-svg" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="quick-stats-value">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
