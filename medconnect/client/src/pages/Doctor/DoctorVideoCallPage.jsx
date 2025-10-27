import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import jitsiService from '../../services/jitsiService';
import './DoctorVideoCallPage.css';

const DoctorVideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const containerId = 'jitsi-container-doctor';
  const hasJoinedConference = useRef(false);

  useEffect(() => {
    // Tạo room ID ngẫu nhiên để tránh membersOnly mode
    // Sử dụng appointmentId + random string để tạo room mới mỗi lần
    const randomString = Math.random().toString(36).substring(7);
    const roomId = `medconnect-${appointmentId}-${randomString}`;
    console.log('Initializing Jitsi Meet with room:', roomId);
    
    initializeJitsiCall(roomId);

    return () => {
      // Cleanup on unmount
      if (jitsiService.isInitialized()) {
        jitsiService.endCall();
      }
    };
  }, [appointmentId]);

  const initializeJitsiCall = async (roomId) => {
    try {
      // Set up callbacks
      jitsiService.setCallbacks({
        onConferenceJoined: () => {
          console.log('✅ Doctor joined conference successfully');
          hasJoinedConference.current = true; // Đánh dấu đã join thành công
          // Đợi một chút rồi báo thành công
          setTimeout(() => {
            message.success('Đã kết nối cuộc gọi video thành công');
          }, 500);
        },
        onParticipantJoined: (event) => {
          console.log('Participant joined:', event);
          message.info('Bệnh nhân đã tham gia');
        },
        onParticipantLeft: (event) => {
          console.log('Participant left:', event);
        },
        onAudioMuteStatusChanged: (isMuted) => {
          console.log('Audio muted:', isMuted);
        },
        onVideoMuteStatusChanged: (isMuted) => {
          console.log('Video muted:', isMuted);
        },
        onReadyToClose: () => {
          console.log('Ready to close');
          // CHỈ redirect nếu đã thực sự join conference (không phải lỗi membersOnly)
          if (hasJoinedConference.current) {
            console.log('Closing video call window...');
            // Đóng TAB HIỆN TẠI thay vì redirect về dashboard
            window.close();
          } else {
            console.log('Not redirecting - conference failed before joining');
          }
        },
        onError: (error) => {
          console.error('Jitsi Error:', error);
          // Nếu là lỗi membersOnly, CHỈ HƯỚNG DẪN - KHÔNG REDIRECT
          if (error?.error === 'membersOnly' || error?.toString().includes('membersOnly')) {
            console.log('Room requires moderator. Please click "Mình là quản trị viên" button.');
            message.warning('Vui lòng bấm nút "Mình là quản trị viên" để bắt đầu cuộc gọi');
            // KHÔNG redirect - để user bấm nút "Mình là quản trị viên"
            return;
          } else {
            message.error('Có lỗi xảy ra trong cuộc gọi video');
          }
        }
      });

      // Initialize Jitsi Meet
      await jitsiService.initialize(containerId, roomId, {
        displayName: 'Bác sĩ',
        email: ''
      });
      
      console.log('✅ Jitsi initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Jitsi call:', error);
      message.error('Không thể khởi tạo cuộc gọi video');
    }
  };

  const handleBack = () => {
    if (jitsiService.isInitialized()) {
      jitsiService.endCall();
    }
    navigate('/bac-si');
  };

  return (
    <div className="doctor-video-call-page">
      {/* Jitsi Meet Container - Fullscreen, không có nút back */}
      <div className="jitsi-container-wrapper">
        <div 
          id={containerId} 
          ref={jitsiContainerRef}
          style={{
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>
    </div>
  );
};

export default DoctorVideoCallPage;
