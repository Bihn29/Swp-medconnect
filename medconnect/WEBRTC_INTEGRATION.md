# WebRTC Video Call Integration

## Tổng quan

Dự án MedConnect đã được tích hợp WebRTC để hỗ trợ cuộc gọi video giữa bác sĩ và bệnh nhân. Hệ thống sử dụng:

- **WebRTC** cho peer-to-peer video/audio communication
- **Socket.IO** cho signaling server
- **Simple-peer** library để đơn giản hóa WebRTC implementation

## Cấu trúc thư mục

```
client/src/
├── services/
│   └── webrtcService.js          # WebRTC service chính
├── components/VideoCall/
│   ├── VideoCall.jsx             # Component video call UI
│   ├── VideoCall.css             # Styles cho video call
│   ├── VideoCallManager.jsx      # Quản lý video call
│   └── VideoCallManager.css      # Styles cho manager
└── pages/
    ├── Patient/VideoCallPage.jsx  # Trang video call cho bệnh nhân
    └── Doctor/DoctorVideoCallPage.jsx # Trang video call cho bác sĩ

server/
├── services/
│   └── signalingServer.js       # Signaling server
├── models/
│   └── videoCall.model.js       # Database model
└── routes/
    └── videoCallRoutes.js       # API routes
```

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
# Client
cd client
npm install socket.io-client simple-peer

# Server
cd server
npm install socket.io
```

### 2. Cấu hình environment variables

Tạo file `.env` trong thư mục `client`:

```env
REACT_APP_SIGNALING_SERVER_URL=http://localhost:9999
REACT_APP_WEBRTC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
REACT_APP_VIDEO_QUALITY=medium
REACT_APP_AUDIO_QUALITY=medium
REACT_APP_MAX_CALL_DURATION=3600
REACT_APP_DEBUG_WEBRTC=false
```

### 3. Chạy ứng dụng

```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm run dev
```

## Tính năng

### ✅ Đã hoàn thành

1. **WebRTC Service**
   - Kết nối peer-to-peer
   - Quản lý media streams (video/audio)
   - Toggle video/audio controls
   - Error handling và reconnection

2. **Signaling Server**
   - Socket.IO server cho signaling
   - Room management
   - User join/leave events
   - Signal relay

3. **Database Models**
   - VideoCall model với đầy đủ fields
   - Validation và middleware
   - Indexes cho performance
   - Methods và statics

4. **API Routes**
   - Tạo video call room
   - Quản lý trạng thái cuộc gọi
   - Lịch sử cuộc gọi
   - Statistics

5. **UI Components**
   - VideoCall component với controls
   - VideoCallManager để quản lý
   - Responsive design
   - Loading states và error handling

6. **Integration**
   - Tích hợp vào appointment flow
   - Trang riêng cho bệnh nhân và bác sĩ
   - Permission và validation

### 🔄 Cần cải thiện

1. **STUN/TURN Servers**
   - Hiện tại chỉ sử dụng Google STUN servers
   - Cần thêm TURN servers cho production
   - Cấu hình cho NAT traversal

2. **Recording**
   - Chưa implement recording feature
   - Cần thêm MediaRecorder API
   - Lưu trữ và quản lý recordings

3. **Screen Sharing**
   - Chưa có tính năng chia sẻ màn hình
   - Cần thêm getDisplayMedia API

4. **Chat trong cuộc gọi**
   - Chưa có chat text trong cuộc gọi
   - Cần thêm real-time messaging

5. **Mobile Support**
   - Cần test và optimize cho mobile
   - Responsive design improvements

## API Endpoints

### Video Call Routes

```
POST /api/video-calls/create-room
- Tạo phòng video call mới
- Body: { appointmentId }

GET /api/video-calls/room/:roomId
- Lấy thông tin phòng

POST /api/video-calls/start/:roomId
- Bắt đầu cuộc gọi

POST /api/video-calls/end/:roomId
- Kết thúc cuộc gọi

GET /api/video-calls/appointment/:appointmentId
- Lịch sử cuộc gọi của appointment

GET /api/video-calls/active
- Danh sách cuộc gọi đang hoạt động
```

## WebRTC Service API

```javascript
import webrtcService from './services/webrtcService';

// Initialize
await webrtcService.initialize(roomId, isInitiator);

// Start call
await webrtcService.startCall();

// Controls
webrtcService.toggleVideo();
webrtcService.toggleAudio();

// End call
webrtcService.endCall();

// Callbacks
webrtcService.setCallbacks({
  onLocalStream: (stream) => {},
  onRemoteStream: (stream) => {},
  onCallEnded: () => {},
  onError: (error) => {},
  onConnectionStateChange: (state) => {}
});
```

## Troubleshooting

### Lỗi thường gặp

1. **Không thể kết nối**
   - Kiểm tra signaling server đang chạy
   - Kiểm tra firewall settings
   - Kiểm tra HTTPS requirement

2. **Không có video/audio**
   - Kiểm tra camera/microphone permissions
   - Kiểm tra browser compatibility
   - Kiểm tra media constraints

3. **Chất lượng kém**
   - Kiểm tra bandwidth
   - Điều chỉnh video quality settings
   - Kiểm tra STUN/TURN servers

### Debug

Bật debug mode trong `.env`:
```env
REACT_APP_DEBUG_WEBRTC=true
```

## Security Considerations

1. **HTTPS Required**
   - WebRTC yêu cầu HTTPS trong production
   - MediaDevices API chỉ hoạt động với secure context

2. **Room Security**
   - Room IDs được generate ngẫu nhiên
   - Validation appointment permissions
   - Time-based access control

3. **Data Privacy**
   - Không lưu trữ video/audio data
   - Chỉ lưu metadata và statistics
   - GDPR compliance

## Performance Optimization

1. **Bandwidth Management**
   - Adaptive bitrate
   - Quality adjustment based on connection
   - Bandwidth monitoring

2. **Resource Management**
   - Cleanup streams on disconnect
   - Memory leak prevention
   - CPU usage optimization

3. **Scalability**
   - Multiple signaling servers
   - Load balancing
   - CDN for static assets

## Future Enhancements

1. **AI Features**
   - Noise cancellation
   - Background blur
   - Auto-transcription

2. **Advanced Features**
   - Multi-party calls
   - Virtual backgrounds
   - Hand raising
   - Breakout rooms

3. **Analytics**
   - Call quality metrics
   - User engagement tracking
   - Performance monitoring
