import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import "./QuickActions.scss";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Đặt lịch mới",
      description: "Tạo lịch hẹn khám bệnh",
      icon: Calendar,
      variant: "outline",
      path: "/dat-lich",
    },
    {
      title: "Hồ sơ bệnh án",
      description: "Xem lịch sử khám bệnh",
      icon: FileText,
      variant: "outline",
      path: "/benh-nhan/ho-so-benh-an",
    },
    {
      title: "Cài đặt",
      description: "Quản lý tài khoản",
      icon: Settings,
      variant: "outline",
      path: "/benh-nhan/cai-dat",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto w-full justify-start gap-3 p-4 text-left quick-action-button"
              style={{
                textAlign: "left",
                justifyContent: "flex-start",
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => action.path && navigate(action.path)}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0"
                style={{
                  minWidth: "2.5rem",
                  minHeight: "2.5rem",
                  overflow: "visible",
                }}
              >
                <Icon
                  className="h-5 w-5 text-primary"
                  style={{
                    display: "block",
                    width: "1.25rem",
                    height: "1.25rem",
                    flexShrink: 0,
                  }}
                />
              </div>
              <div
                className="flex flex-col items-start gap-0.5 text-left"
                style={{ flex: 1, minWidth: 0 }}
              >
                <span className="font-semibold text-left">{action.title}</span>
                <span className="text-xs text-muted-foreground text-left">
                  {action.description}
                </span>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
