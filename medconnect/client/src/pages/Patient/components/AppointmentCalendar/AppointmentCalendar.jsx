import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import "./AppointmentCalendar.scss";

const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 16));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const appointmentDays = [5, 12, 16, 20, 25];
  const days = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const monthName = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-balance">Lịch hẹn</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium capitalize">
              {monthName}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="flex h-10 items-center justify-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const hasAppointment = day && appointmentDays.includes(day);
            const isToday = day === 16;
            return (
              <button
                key={index}
                disabled={!day}
                className={`flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                  !day
                    ? "cursor-default"
                    : isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : hasAppointment
                    ? "bg-accent/20 font-medium text-accent hover:bg-accent/30"
                    : "hover:bg-muted"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent/40" />
            <span>Có lịch hẹn</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
