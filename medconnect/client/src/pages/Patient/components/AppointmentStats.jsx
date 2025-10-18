import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { usePatientAppointments } from '../../../hooks/usePatientAppointments';

export function AppointmentStats() {
  const { appointments, pendingAppointments, upcomingAppointments, pastAppointments } = usePatientAppointments();

  const stats = [
    {
      title: 'Tổng lịch hẹn',
      value: appointments.length,
      icon: <CalendarOutlined style={{ fontSize: '20px' }} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Chờ xác nhận',
      value: pendingAppointments.length,
      icon: <ClockCircleOutlined style={{ fontSize: '20px' }} />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      title: 'Sắp tới',
      value: upcomingAppointments.filter(apt => apt.status === 'confirmed').length,
      icon: <CheckCircleOutlined style={{ fontSize: '20px' }} />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Đã hoàn thành',
      value: pastAppointments.filter(apt => apt.status === 'done').length,
      icon: <CheckCircleOutlined style={{ fontSize: '20px' }} />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <Card className="medical-card fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Thống kê lịch hẹn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        {pendingAppointments.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />
              <span className="text-sm font-medium text-amber-800">
                Có {pendingAppointments.length} lịch hẹn đang chờ bác sĩ xác nhận
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
