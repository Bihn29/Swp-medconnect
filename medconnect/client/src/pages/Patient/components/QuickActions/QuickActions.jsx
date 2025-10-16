import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import {
  CalendarOutlined,
  FileTextOutlined,
  WechatOutlined,
  CreditCardOutlined,
  SearchOutlined,
  StarOutlined,
} from "@ant-design/icons";
import "./QuickActions.scss";

/**
 * QuickActions Component
 *
 * Implements multiple Use Cases:
 * - UC8: Search for doctors by name, specialization, or location
 * - UC10: Book available time slots for consultation
 * - UC15: Rating and review system access
 * - UC11: Payment management
 *
 * Provides quick access to common patient tasks
 */
export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      icon: <SearchOutlined />,
      title: "Tìm bác sĩ",
      description: "Tìm theo chuyên khoa, tên, vị trí",
      iconClass: "primary",
      onClick: () => navigate("/tim-kiem-bac-si"), // UC8: Search doctors
    },
    {
      id: 2,
      icon: <CalendarOutlined />,
      title: "Đặt lịch mới",
      description: "Đặt lịch khám trực tiếp hoặc online",
      iconClass: "secondary",
      onClick: () => navigate("/danh-sach-bac-si"), // UC10: Book appointment
    },
    {
      id: 3,
      icon: <FileTextOutlined />,
      title: "Hồ sơ y tế",
      description: "Xem kết quả khám và đơn thuốc",
      iconClass: "accent",
      onClick: () => navigate("/ho-so-y-te"), // UC14: Consultation records
    },
    {
      id: 4,
      icon: <StarOutlined />,
      title: "Đánh giá",
      description: "Đánh giá bác sĩ sau khám",
      iconClass: "info",
      onClick: () => navigate("/danh-gia-bac-si"), // UC15: Rating system
    },
    {
      id: 5,
      icon: <WechatOutlined />,
      title: "Video call",
      description: "Tham gia khám online",
      iconClass: "accent",
      onClick: () => navigate("/video-call"), // UC13: Video consultation
    },
    {
      id: 6,
      icon: <CreditCardOutlined />,
      title: "Thanh toán",
      description: "Xem lịch sử thanh toán",
      iconClass: "info",
      onClick: () => navigate("/thanh-toan"), // UC11: Payment history
    },
  ];

  return (
    <Card className="medical-card fade-in">
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="quick-actions-grid quick-actions-grid-6">
          {actions.map((action) => (
            <div
              key={action.id}
              className="quick-action-card"
              onClick={action.onClick}
            >
              <div className={`quick-action-icon ${action.iconClass}`}>
                <div style={{ fontSize: "20px" }}>{action.icon}</div>
              </div>
              <h4 className="quick-action-title">{action.title}</h4>
              <p className="quick-action-description">{action.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
