import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, message, Spin, Table, Tag } from 'antd';
import { ArrowLeftOutlined, VideoCameraOutlined, PhoneOutlined } from '@ant-design/icons';
import VideoCallManager from '../../components/VideoCall/VideoCallManager';
import { api } from '../../lib/api';
import './DoctorVideoCallPage.css';

const { Title, Text } = Typography;

const DoctorVideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoCalls, setVideoCalls] = useState([]);

  useEffect(() => {
    fetchAppointment();
    fetchVideoCalls();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      message.error('Không thể tải thông tin lịch hẹn');
      navigate('/bac-si');
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoCalls = async () => {
    try {
      const response = await api.get(`/video-calls/appointment/${appointmentId}`);
      setVideoCalls(response.data);
    } catch (error) {
      console.error('Error fetching video calls:', error);
    }
  };

  const handleBack = () => {
    navigate('/bac-si');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'ended':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'created':
        return 'Sẵn sàng';
      case 'in_progress':
        return 'Đang diễn ra';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const videoCallColumns = [
    {
      title: 'Phòng',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (roomId) => (
        <Text code>{roomId}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (startedAt) => startedAt ? new Date(startedAt).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Kết thúc',
      dataIndex: 'endedAt',
      key: 'endedAt',
      render: (endedAt) => endedAt ? new Date(endedAt).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'created' && (
            <Button
              type="primary"
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => handleJoinCall(record.roomId)}
            >
              Tham gia
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="primary"
              size="small"
              icon={<VideoCameraOutlined />}
              onClick={() => handleJoinCall(record.roomId)}
            >
              Tham gia
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleJoinCall = (roomId) => {
    navigate(`/bac-si/video-call/${roomId}`);
  };

  if (loading) {
    return (
      <div className="doctor-video-call-page-loading">
        <Spin size="large" />
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="doctor-video-call-page-error">
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
    <div className="doctor-video-call-page">
      <div className="doctor-video-call-page-container">
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
              Quản lý cuộc gọi video
            </Title>
            <Text type="secondary" className="page-subtitle">
              Quản lý cuộc gọi video với bệnh nhân
            </Text>
          </div>
        </div>

        {/* Appointment Info */}
        <Card className="appointment-info-card" style={{ marginBottom: 24 }}>
          <Title level={4}>Thông tin lịch hẹn</Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className="info-item">
              <Text strong>Bệnh nhân:</Text>
              <Text>{appointment.patientId?.name || 'Chưa xác định'}</Text>
            </div>
            <div className="info-item">
              <Text strong>Ngày khám:</Text>
              <Text>{new Date(appointment.scheduledStart).toLocaleDateString('vi-VN')}</Text>
            </div>
            <div className="info-item">
              <Text strong>Thời gian:</Text>
              <Text>
                {new Date(appointment.scheduledStart).toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {new Date(appointment.scheduledEnd).toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </div>
            <div className="info-item">
              <Text strong>Trạng thái:</Text>
              <Tag color={appointment.status === 'accepted' ? 'green' : 'orange'}>
                {appointment.status === 'accepted' ? 'Đã chấp nhận' : 'Chờ chấp nhận'}
              </Tag>
            </div>
          </Space>
        </Card>

        {/* Video Call Manager */}
        <div className="video-call-content">
          <VideoCallManager 
            appointmentId={appointmentId}
            userRole="doctor"
          />
        </div>

        {/* Video Call History */}
        {videoCalls.length > 0 && (
          <Card className="video-call-history-card" style={{ marginTop: 24 }}>
            <Title level={4}>Lịch sử cuộc gọi video</Title>
            <Table
              columns={videoCallColumns}
              dataSource={videoCalls}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Instructions */}
        <Card className="instructions-card" style={{ marginTop: 24 }}>
          <Title level={4}>Hướng dẫn cho bác sĩ</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="instruction-item">
              <Text strong>1. Chuẩn bị:</Text>
              <Text>Đảm bảo camera và microphone hoạt động tốt, có ánh sáng đầy đủ</Text>
            </div>
            <div className="instruction-item">
              <Text strong>2. Môi trường:</Text>
              <Text>Chọn nơi yên tĩnh, chuyên nghiệp để thực hiện cuộc gọi</Text>
            </div>
            <div className="instruction-item">
              <Text strong>3. Thời gian:</Text>
              <Text>Cuộc gọi chỉ có thể bắt đầu khi lịch hẹn đã được chấp nhận</Text>
            </div>
            <div className="instruction-item">
              <Text strong>4. Chất lượng:</Text>
              <Text>Đảm bảo kết nối internet ổn định để có chất lượng video tốt</Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default DoctorVideoCallPage;
