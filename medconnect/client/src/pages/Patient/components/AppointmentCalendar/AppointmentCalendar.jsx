import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { api } from "../../../../lib/api";
import { Spin } from "antd";
import "./AppointmentCalendar.scss";

const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Get start and end of current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      const response = await api.get(`/api/patients/me/appointments?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
      
      if (response.success) {
        setAppointments(response.data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getAppointmentDays = () => {
    const today = new Date();
    const appointmentDays = appointments.map(appointment => {
      const appointmentDate = new Date(appointment.scheduledStart);
      return {
        day: appointmentDate.getDate(),
        status: appointment.status,
        mode: appointment.mode,
        id: appointment._id
      };
    });
    return appointmentDays;
  };

  const appointmentDays = getAppointmentDays();
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

  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                        currentDate.getFullYear() === today.getFullYear();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Lịch hẹn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[300px]">
            <Spin size="large" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
            const appointmentForDay = appointmentDays.find(apt => apt.day === day);
            const hasAppointment = day && appointmentForDay;
            const isToday = day && isCurrentMonth && day === today.getDate();
            
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
                title={hasAppointment ? `Lịch hẹn: ${appointmentForDay.status}` : ""}
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
