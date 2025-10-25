import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Space, Typography, message, Modal, Spin } from 'antd';
import {
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  PhoneOutlined,
  PhoneFilled,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import webrtcService from '../../services/webrtcService';
import './VideoCall.css';

const { Title, Text } = Typography;

const VideoCall = ({ 
  roomId, 
  isInitiator = false, 
  onCallEnd, 
  appointmentId,
  doctorInfo,
  patientInfo 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [callStatus, setCallStatus] = useState('connecting');
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    initializeCall();
    
    return () => {
      // Cleanup on unmount
      webrtcService.endCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      setIsLoading(true);
      setCallStatus('connecting');

      // Set up callbacks
      webrtcService.setCallbacks({
        onLocalStream: (stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setIsVideoEnabled(webrtcService.isVideoEnabled());
          setIsAudioEnabled(webrtcService.isAudioEnabled());
        },
        onRemoteStream: (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setCallStatus('connected');
          setIsConnected(true);
          setIsLoading(false);
        },
        onCallEnded: () => {
          setCallStatus('ended');
          setIsConnected(false);
          setIsLoading(false);
          onCallEnd?.();
        },
        onError: (error) => {
          console.error('WebRTC Error:', error);
          message.error('Có lỗi xảy ra trong cuộc gọi video');
          setCallStatus('error');
          setIsLoading(false);
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') {
            setCallStatus('connected');
            setIsConnected(true);
            setIsLoading(false);
          } else if (state === 'disconnected') {
            setCallStatus('disconnected');
            setIsConnected(false);
          }
        }
      });

      // Initialize WebRTC
      const success = await webrtcService.initialize(roomId, isInitiator);
      if (success) {
        await webrtcService.startCall();
      } else {
        throw new Error('Failed to initialize WebRTC');
      }

    } catch (error) {
      console.error('Failed to initialize call:', error);
      message.error('Không thể khởi tạo cuộc gọi video');
      setCallStatus('error');
      setIsLoading(false);
    }
  };

  const toggleVideo = () => {
    const enabled = webrtcService.toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const toggleAudio = () => {
    const enabled = webrtcService.toggleAudio();
    setIsAudioEnabled(enabled);
  };

  const handleEndCall = () => {
    setShowEndCallModal(true);
  };

  const confirmEndCall = () => {
    webrtcService.endCall();
    setShowEndCallModal(false);
    onCallEnd?.();
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Đang kết nối...';
      case 'connected':
        return 'Đã kết nối';
      case 'disconnected':
        return 'Mất kết nối';
      case 'ended':
        return 'Cuộc gọi đã kết thúc';
      case 'error':
        return 'Có lỗi xảy ra';
      default:
        return 'Đang khởi tạo...';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected':
        return '#52c41a';
      case 'connecting':
        return '#1890ff';
      case 'disconnected':
      case 'ended':
      case 'error':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  if (isLoading) {
    return (
      <div className="video-call-loading">
        <Card className="loading-card">
          <div className="loading-content">
            <Spin size="large" />
            <Title level={4}>Đang khởi tạo cuộc gọi video...</Title>
            <Text type="secondary">{getStatusText()}</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      <Card className="video-call-card">
        {/* Header */}
        <div className="video-call-header">
          <div className="call-info">
            <Title level={4} className="call-title">
              Cuộc gọi video khám bệnh
            </Title>
            <div className="status-indicator">
              <div 
                className="status-dot" 
                style={{ backgroundColor: getStatusColor() }}
              />
              <Text className="status-text">{getStatusText()}</Text>
            </div>
          </div>
          
          <div className="participant-info">
            <div className="participant">
              <UserOutlined className="participant-icon" />
              <div className="participant-details">
                <Text strong>{isInitiator ? patientInfo?.name : doctorInfo?.name}</Text>
                <Text type="secondary" className="participant-role">
                  {isInitiator ? 'Bệnh nhân' : 'Bác sĩ'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="video-area">
          {/* Remote Video */}
          <div className="remote-video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
              style={{ display: isConnected ? 'block' : 'none' }}
            />
            {!isConnected && (
              <div className="no-video-placeholder">
                <UserOutlined className="placeholder-icon" />
                <Text type="secondary">Đang chờ kết nối...</Text>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="local-video-container">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
            {!isVideoEnabled && (
              <div className="video-disabled-overlay">
                <VideoCameraOutlined className="disabled-icon" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="video-controls">
          <Space size="large">
            <Button
              type={isVideoEnabled ? "primary" : "default"}
              shape="circle"
              size="large"
              icon={isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
              onClick={toggleVideo}
              className="control-button"
            />
            
            <Button
              type={isAudioEnabled ? "primary" : "default"}
              shape="circle"
              size="large"
              icon={isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={toggleAudio}
              className="control-button"
            />
            
            <Button
              type="primary"
              danger
              shape="circle"
              size="large"
              icon={<PhoneFilled />}
              onClick={handleEndCall}
              className="control-button end-call-button"
            />
          </Space>
        </div>
      </Card>

      {/* End Call Confirmation Modal */}
      <Modal
        title="Kết thúc cuộc gọi"
        open={showEndCallModal}
        onOk={confirmEndCall}
        onCancel={() => setShowEndCallModal(false)}
        okText="Kết thúc"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        icon={<ExclamationCircleOutlined />}
      >
        <p>Bạn có chắc chắn muốn kết thúc cuộc gọi video này?</p>
      </Modal>
    </div>
  );
};

export default VideoCall;
