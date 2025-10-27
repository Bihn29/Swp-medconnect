import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined, VideoCameraOutlined } from '@ant-design/icons';
import VideoCallManager from '../../components/VideoCall/VideoCallManager';
import { api } from '../../lib/api';
import './VideoCallPage.css';

const { Title, Text } = Typography;

const VideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/patients/me/appointments/${appointmentId}`);
      
      if (response.success) {
        setAppointment(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch appointment');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      message.error('Không thể tải thông tin lịch hẹn');
      navigate('/benh-nhan');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/benh-nhan');
  };

  if (loading) {
    return (
      <div className="video-call-page-loading">
        <Spin size="large" />
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="video-call-page-error">
        <Card>
          <Title level={4}>Không tìm thấy lịch hẹn</Title>
          <Text type="secondary">Lịch hẹn không tồn tại hoặc bạn không có quyền truy cập.</Text>
          <br />
          <Button type="primary" onClick={handleBack} style={{ marginTop: 16 }}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="video-call-page">
      <div className="video-call-page-container">
        {/* Header */}
        <div className="page-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="back-button"
          >
            Quay lại
          </Button>
          
          <div className="header-content">
            <Title level={2} className="page-title">
              <VideoCameraOutlined className="title-icon" />
              Cuộc gọi video khám bệnh
            </Title>
            <Text type="secondary" className="page-subtitle">
              Kết nối với bác sĩ qua video call
            </Text>
          </div>
        </div>

        {/* Video Call Manager */}
        <div className="video-call-content">
          <VideoCallManager 
            appointmentId={appointmentId}
            userRole="patient"
          />
        </div>

        {/* Instructions */}
        <Card className="instructions-card">
          <Title level={4}>Hướng dẫn sử dụng</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="instruction-item">
              <Text strong>1. Kiểm tra thiết bị:</Text>
              <Text>Đảm bảo camera và microphone hoạt động bình thường</Text>
            </div>
            <div className="instruction-item">
              <Text strong>2. Kết nối mạng:</Text>
              <Text>Đảm bảo kết nối internet ổn định để có chất lượng video tốt</Text>
            </div>
            <div className="instruction-item">
              <Text strong>3. Thời gian:</Text>
              <Text>Cuộc gọi chỉ có thể bắt đầu trong thời gian cho phép (15 phút trước và sau giờ hẹn)</Text>
            </div>
            <div className="instruction-item">
              <Text strong>4. Quyền riêng tư:</Text>
              <Text>Đảm bảo bạn ở nơi riêng tư và có ánh sáng đầy đủ</Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default VideoCallPage;
