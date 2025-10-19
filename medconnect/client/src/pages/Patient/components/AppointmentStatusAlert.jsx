import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { usePatientAppointments } from '../../../hooks/usePatientAppointments';

export function AppointmentStatusAlert() {
  const { pendingAppointments, upcomingAppointments } = usePatientAppointments();
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('info');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Check if there are pending appointments
    if (pendingAppointments.length > 0) {
      setShowAlert(true);
      setAlertType('warning');
      setAlertMessage(`Bạn có ${pendingAppointments.length} lịch hẹn đang chờ bác sĩ xác nhận. Vui lòng chờ phản hồi từ bác sĩ.`);
    } else if (upcomingAppointments.length > 0) {
      // Check if there are confirmed upcoming appointments
      const confirmedAppointments = upcomingAppointments.filter(apt => apt.status === 'confirmed');
      if (confirmedAppointments.length > 0) {
        setShowAlert(true);
        setAlertType('success');
        setAlertMessage(`Bạn có ${confirmedAppointments.length} lịch hẹn đã được xác nhận và sắp diễn ra.`);
      }
    } else {
      setShowAlert(false);
    }
  }, [pendingAppointments, upcomingAppointments]);

  const getAlertIcon = () => {
    switch (alertType) {
      case 'warning':
        return <ExclamationCircleOutlined />;
      case 'success':
        return <CheckCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  if (!showAlert) return null;

  return (
    <div className="mb-6">
      <Alert
        message={alertMessage}
        type={alertType}
        icon={getAlertIcon()}
        showIcon
        closable
        onClose={() => setShowAlert(false)}
        action={
          <Button 
            size="small" 
            type="primary" 
            onClick={() => {
              // Scroll to appointments section
              const appointmentsSection = document.querySelector('.lg\\:col-span-2');
              if (appointmentsSection) {
                appointmentsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Xem chi tiết
          </Button>
        }
        className="rounded-lg"
      />
    </div>
  );
}
