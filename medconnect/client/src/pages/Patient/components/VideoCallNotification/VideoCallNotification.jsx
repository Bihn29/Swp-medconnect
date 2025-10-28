import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Badge, message } from 'antd';
import { VideoCameraOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../lib/api';
import './VideoCallNotification.css';

const { Title, Text } = Typography;

const VideoCallNotification = () => {
  const [upcomingVideoCalls, setUpcomingVideoCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingVideoCalls();
  }, []);

  const fetchUpcomingVideoCalls = async () => {
    try {
      setLoading(true);
      
      // Get upcoming appointments that are accepted and online
      const response = await api.get('/api/patients/me/appointments?limit=10');
      
      if (response.success) {
        const appointments = response.data.appointments || [];
        
        // Filter for accepted online appointments within next 24 hours
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const upcomingCalls = appointments.filter(appointment => {
          const appointmentTime = new Date(appointment.scheduledStart);
          return (
            appointment.status === 'accepted' &&
            appointment.mode === 'online' &&
            appointmentTime >= now &&
            appointmentTime <= tomorrow
          );
        });
        
        setUpcomingVideoCalls(upcomingCalls);
      }
    } catch (error) {
      console.error('Error fetching upcoming video calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVideoCall = (appointmentId) => {
    navigate(`/benh-nhan/video-call/${appointmentId}`);
  };

  const getTimeUntilCall = (scheduledStart) => {
    const now = new Date();
    const appointmentTime = new Date(scheduledStart);
    const diffMs = appointmentTime - now;
    
    if (diffMs <= 0) return 'Đã đến giờ';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const isCallTime = (scheduledStart) => {
    // BỎ CHECK THỜI GIAN - Cho phép gọi bất cứ lúc nào sau khi accepted
    // Chỉ cần appointment status là 'accepted' là được
    return true;
  };

  if (loading) {
    return (
      <Card className="video-call-notification-card">
        <div className="loading-content">
          <Text>Đang tải...</Text>
        </div>
      </Card>
    );
  }

  if (upcomingVideoCalls.length === 0) {
    return null; // Don't show if no upcoming calls
  }

  return (
    <Card className="video-call-notification-card">
      <div className="notification-header">
        <Title level={4} className="notification-title">
          <VideoCameraOutlined className="title-icon" />
          Cuộc gọi video sắp tới
        </Title>
        <Badge count={upcomingVideoCalls.length} />
      </div>

      <div className="upcoming-calls-list">
        {upcomingVideoCalls.map((appointment) => {
          const doctorName = appointment.doctorId?.fullName || 'Bác sĩ';
          const specialty = appointment.doctorId?.specializationIds?.[0]?.name || '';
          const appointmentTime = new Date(appointment.scheduledStart);
          const timeText = appointmentTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const dateText = appointmentTime.toLocaleDateString('vi-VN');
          const timeUntil = getTimeUntilCall(appointment.scheduledStart);
          const canJoin = isCallTime(appointment.scheduledStart);

          return (
            <div key={appointment._id} className="call-item">
              <div className="call-info">
                <div className="doctor-info">
                  <UserOutlined className="doctor-icon" />
                  <div className="doctor-details">
                    <Text strong>{doctorName}</Text>
                    <Text type="secondary" className="specialty">{specialty}</Text>
                  </div>
                </div>
                
                <div className="time-info">
                  <div className="appointment-time">
                    <ClockCircleOutlined className="time-icon" />
                    <Text>{dateText} - {timeText}</Text>
                  </div>
                  <div className="time-until">
                    <Text type={canJoin ? 'success' : 'secondary'}>
                      {canJoin ? 'Có thể tham gia' : `Còn ${timeUntil}`}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="call-actions">
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  onClick={() => handleJoinVideoCall(appointment._id)}
                  disabled={!canJoin}
                  className="join-call-button"
                >
                  {canJoin ? 'Tham gia ngay' : 'Chờ đến giờ'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {upcomingVideoCalls.length > 0 && (
        <div className="notification-footer">
          <Button 
            type="link" 
            onClick={() => navigate('/my-appointments')}
            className="view-all-button"
          >
            Xem tất cả lịch hẹn
          </Button>
        </div>
      )}
    </Card>
  );
};

export default VideoCallNotification;
