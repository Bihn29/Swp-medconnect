import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, message, Modal, Spin, Row, Col } from 'antd';
import {
  VideoCameraOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import VideoCall from './VideoCall';
import VideoCallAPI from '../../services/videoCallAPI';
import { api } from '../../lib/api';

const { Title, Text, Paragraph } = Typography;

const VideoCallManager = ({ appointmentId, userRole = 'patient' }) => {
  const [videoCallData, setVideoCallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [showStartCallModal, setShowStartCallModal] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  useEffect(() => {
    fetchAppointmentInfo();
  }, [appointmentId]);

  const fetchAppointmentInfo = async () => {
    try {
      setIsLoading(true);
      
      // Fetch appointment details
      const appointmentResponse = await api.get(`/appointments/${appointmentId}`);
      setAppointmentInfo(appointmentResponse.data);
      
      // Check if video call already exists
      const videoCallResponse = await VideoCallAPI.getCallHistory(appointmentId);
      if (videoCallResponse.length > 0) {
        setVideoCallData(videoCallResponse[0]);
      }
      
    } catch (error) {
      console.error('Error fetching appointment info:', error);
      message.error('Không thể tải thông tin cuộc hẹn');
    } finally {
      setIsLoading(false);
    }
  };

  const createVideoCallRoom = async () => {
    try {
      setIsLoading(true);
      
      const response = await VideoCallAPI.createRoom(appointmentId);
      
      if (response.success) {
        setVideoCallData(response.data);
        message.success('Phòng video call đã được tạo thành công');
        setShowStartCallModal(false);
      } else {
        message.error(response.message || 'Không thể tạo phòng video call');
      }
      
    } catch (error) {
      console.error('Error creating video call room:', error);
      message.error('Không thể tạo phòng video call');
    } finally {
      setIsLoading(false);
    }
  };

  const startVideoCall = async () => {
    try {
      if (!videoCallData) {
        message.error('Không có dữ liệu video call');
        return;
      }

      // Update video call status to in_progress
      await VideoCallAPI.startCall(videoCallData.roomId);
      
      setIsInCall(true);
      message.success('Cuộc gọi video đã được bắt đầu');
      
    } catch (error) {
      console.error('Error starting video call:', error);
      message.error('Không thể bắt đầu cuộc gọi video');
    }
  };

  const endVideoCall = async () => {
    try {
      if (!videoCallData) {
        return;
      }

      // Update video call status to ended
      await VideoCallAPI.endCall(videoCallData.roomId);
      
      setIsInCall(false);
      message.success('Cuộc gọi video đã kết thúc');
      
    } catch (error) {
      console.error('Error ending video call:', error);
      message.error('Không thể kết thúc cuộc gọi video');
    }
  };

  const canStartCall = () => {
    if (!appointmentInfo) return false;
    
    // Check if appointment is accepted - CHO PHÉP GỌI BẤT CỨ KHI NÀO SAU KHI ACCEPTED
    if (appointmentInfo.status !== 'accepted') {
      return false;
    }
    
    // BỎ CHECK THỜI GIAN - Cho phép gọi bất cứ lúc nào
    // Chỉ cần appointment đã được accepted là gọi được
    return true;
  };

  const getCallStatusText = () => {
    if (!videoCallData) return 'Chưa có cuộc gọi';
    
    switch (videoCallData.status) {
      case 'created':
        return 'Sẵn sàng bắt đầu';
      case 'in_progress':
        return 'Đang diễn ra';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const getCallStatusColor = () => {
    if (!videoCallData) return '#d9d9d9';
    
    switch (videoCallData.status) {
      case 'created':
        return '#52c41a';
      case 'in_progress':
        return '#1890ff';
      case 'ended':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  if (isLoading) {
    return (
      <div className="video-call-manager-loading">
        <Spin size="large" />
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  if (isInCall && videoCallData) {
    const userName = userRole === 'patient' 
      ? appointmentInfo?.patientId?.name 
      : appointmentInfo?.doctorId?.name;
    
    return (
      <VideoCall
        roomId={videoCallData.roomId}
        onCallEnd={endVideoCall}
        appointmentId={appointmentId}
        doctorInfo={appointmentInfo?.doctorId}
        patientInfo={appointmentInfo?.patientId}
        userName={userName}
      />
    );
  }

  return (
    <div className="video-call-manager">
      <Card className="video-call-manager-card">
        <div className="manager-header">
          <Title level={3}>Cuộc gọi video khám bệnh</Title>
          <Text type="secondary">Quản lý cuộc gọi video với bác sĩ</Text>
        </div>

        {appointmentInfo && (
          <div className="appointment-info">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" className="info-card">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="info-item">
                      <CalendarOutlined className="info-icon" />
                      <Text strong>Ngày khám:</Text>
                      <Text>{new Date(appointmentInfo.scheduledStart).toLocaleDateString('vi-VN')}</Text>
                    </div>
                    <div className="info-item">
                      <ClockCircleOutlined className="info-icon" />
                      <Text strong>Thời gian:</Text>
                      <Text>
                        {new Date(appointmentInfo.scheduledStart).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(appointmentInfo.scheduledEnd).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </div>
                    <div className="info-item">
                      <UserOutlined className="info-icon" />
                      <Text strong>Bác sĩ:</Text>
                      <Text>{appointmentInfo.doctorId?.name || 'Chưa xác định'}</Text>
                    </div>
                    <div className="info-item">
                      <Text strong>Trạng thái:</Text>
                      <Text style={{ color: getCallStatusColor() }}>{getCallStatusText()}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <div className="call-actions">
          {!videoCallData ? (
            <Button
              type="primary"
              size="large"
              icon={<VideoCameraOutlined />}
              onClick={() => setShowStartCallModal(true)}
              disabled={!canStartCall()}
              className="action-button"
            >
              Tạo cuộc gọi video
            </Button>
          ) : videoCallData.status === 'created' ? (
            <Button
              type="primary"
              size="large"
              icon={<PhoneOutlined />}
              onClick={startVideoCall}
              disabled={!canStartCall()}
              className="action-button"
            >
              Bắt đầu cuộc gọi
            </Button>
          ) : videoCallData.status === 'ended' ? (
            <Text type="secondary">Cuộc gọi đã kết thúc</Text>
          ) : null}

          {!canStartCall() && (
            <Text type="secondary" className="warning-text">
              Cuộc gọi chỉ có thể bắt đầu khi lịch hẹn đã được chấp nhận
            </Text>
          )}
        </div>
      </Card>

      {/* Start Call Confirmation Modal */}
      <Modal
        title="Tạo cuộc gọi video"
        open={showStartCallModal}
        onOk={createVideoCallRoom}
        onCancel={() => setShowStartCallModal(false)}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={isLoading}
        icon={<ExclamationCircleOutlined />}
      >
        <p>Bạn có chắc chắn muốn tạo cuộc gọi video cho lịch hẹn này?</p>
        <p><Text type="secondary">Cuộc gọi sẽ được tạo và sẵn sàng để bắt đầu.</Text></p>
      </Modal>
    </div>
  );
};

export default VideoCallManager;
