import React from "react";
import { Calendar, FileText, MessageSquare, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import "./QuickActions.scss";

const actions = [
  {
    title: "Đặt lịch mới",
    description: "Tạo lịch hẹn khám bệnh",
    icon: Calendar,
    variant: "default",
  },
  {
    title: "Hồ sơ bệnh án",
    description: "Xem lịch sử khám bệnh",
    icon: FileText,
    variant: "outline",
  },
  {
    title: "Nhắn tin",
    description: "Liên hệ với bác sĩ",
    icon: MessageSquare,
    variant: "outline",
  },
  {
    title: "Cài đặt",
    description: "Quản lý tài khoản",
    icon: Settings,
    variant: "outline",
  },
];

export function QuickActions() {
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
              className="h-auto w-full justify-start gap-3 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-semibold text-balance">
                  {action.title}
                </span>
                <span className="text-xs text-muted-foreground text-pretty">
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
