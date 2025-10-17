import React from "react";
import { Card, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Calendar, Video, Search } from 'lucide-react';
import "./WelcomeSection.scss";

export function WelcomeSection() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Chào buổi sáng" : currentHour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardContent className="p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-balance lg:text-3xl">{greeting}, Nguyễn Văn A</h2>
            <p className="text-muted-foreground text-pretty">
              Hôm nay bạn có 2 lịch hẹn. Hãy chuẩn bị sẵn sàng cho buổi khám.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              Đặt lịch ngay
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Video className="h-4 w-4" />
              Tư vấn online
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Search className="h-4 w-4" />
              Tìm bác sĩ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
