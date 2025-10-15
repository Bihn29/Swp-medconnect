import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import {
  CalendarOutlined,
  FileTextOutlined,
  WechatOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";

export function QuickActions() {
  const actions = [
    {
      id: 1,
      icon: <CalendarOutlined />,
      title: "Đặt lịch mới",
      description: "Tìm bác sĩ và đặt lịch",
      iconClass: "primary",
      onClick: () => console.log("Navigate to book appointment"),
    },
    {
      id: 2,
      icon: <FileTextOutlined />,
      title: "Hồ sơ y tế",
      description: "Xem kết quả khám",
      iconClass: "secondary",
      onClick: () => console.log("Navigate to medical records"),
    },
    {
      id: 3,
      icon: <WechatOutlined />,
      title: "Nhắn tin",
      description: "Chat với bác sĩ",
      iconClass: "accent",
      onClick: () => console.log("Navigate to chat"),
    },
    {
      id: 4,
      icon: <CreditCardOutlined />,
      title: "Thanh toán",
      description: "Xem hóa đơn",
      iconClass: "info",
      onClick: () => console.log("Navigate to payments"),
    },
  ];

  return (
    <Card className="medical-card fade-in">
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="quick-actions-grid">
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
