# Hướng dẫn Test Video Call WebRTC

## 🚀 Cách chạy và test Video Call

### 1. Cài đặt và chạy ứng dụng

```bash
# Terminal 1 - Server
cd server
npm install
npm start

# Terminal 2 - Client  
cd client
npm install
npm run dev
```

### 2. Cấu hình Environment

Tạo file `.env` trong thư mục `client` (hoặc sử dụng config có sẵn):

```env
REACT_APP_SIGNALING_SERVER_URL=http://localhost:9999
REACT_APP_WEBRTC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
REACT_APP_VIDEO_QUALITY=medium
REACT_APP_AUDIO_QUALITY=medium
REACT_APP_MAX_CALL_DURATION=3600
REACT_APP_DEBUG_WEBRTC=false
REACT_APP_ENABLE_VIDEO_CALL=true
REACT_APP_API_BASE_URL=http://localhost:9999/api
```

### 3. Test Video Call

#### Bước 1: Tạo Appointment
1. Đăng nhập với tài khoản bệnh nhân
2. Vào trang đặt lịch khám
3. Chọn bác sĩ và đặt lịch với mode "online"
4. Chờ bác sĩ duyệt appointment

#### Bước 2: Duyệt Appointment (Bác sĩ)
1. Đăng nhập với tài khoản bác sĩ
2. Vào trang quản lý lịch hẹn
3. Duyệt appointment đã đặt

#### Bước 3: Test Video Call
1. **Bệnh nhân**: Vào dashboard, sẽ thấy:
   - Thông báo video call sắp tới
   - Button "Video Call" trong danh sách lịch hẹn
   - Click vào button để vào trang video call

2. **Bác sĩ**: Vào trang quản lý lịch hẹn:
   - Sẽ thấy button "Tham gia" cho appointment đã duyệt
   - Click vào để vào trang video call

#### Bước 4: Thực hiện Video Call
1. Cả hai bên sẽ thấy giao diện video call
2. Test các tính năng:
   - Toggle video on/off
   - Toggle audio on/off
   - End call
   - Connection status

### 4. Cấu trúc File đã tổ chức

```
client/src/
├── config/
│   └── webrtcConfig.js          # Cấu hình WebRTC
├── services/
│   ├── webrtcService.js         # WebRTC service chính
│   └── videoCallAPI.js          # API service cho video call
├── components/VideoCall/
│   ├── VideoCall.jsx            # Component video call UI
│   ├── VideoCall.css            # Styles
│   ├── VideoCallManager.jsx     # Quản lý video call
│   ├── VideoCallManager.css     # Styles
│   └── index.js                 # Export components
└── pages/
    ├── Patient/
    │   ├── VideoCallPage.jsx     # Trang video call cho bệnh nhân
    │   ├── VideoCallPage.css     # Styles
    │   └── components/
    │       ├── MyAppointments/   # Đã cập nhật với video call button
    │       └── VideoCallNotification/ # Thông báo video call
    └── Doctor/
        ├── DoctorVideoCallPage.jsx # Trang video call cho bác sĩ
        └── DoctorVideoCallPage.css  # Styles

server/
├── services/
│   └── signalingServer.js      # Signaling server
├── models/
│   └── videoCall.model.js       # Database model (đã cập nhật)
└── routes/
    └── videoCallRoutes.js       # API routes
```

### 5. API Endpoints

```
POST /api/video-calls/create-room
GET  /api/video-calls/room/:roomId
POST /api/video-calls/start/:roomId
POST /api/video-calls/end/:roomId
GET  /api/video-calls/appointment/:appointmentId
GET  /api/video-calls/active
```

### 6. Routes đã thêm

```
# Patient routes
/benh-nhan/video-call/:appointmentId

# Doctor routes  
/bac-si/video-call/:appointmentId
```

### 7. Tính năng đã implement

✅ **WebRTC Service**
- Peer-to-peer video/audio communication
- Toggle video/audio controls
- Error handling và reconnection
- Connection state management

✅ **Signaling Server**
- Socket.IO server cho signaling
- Room management
- User join/leave events

✅ **Database Models**
- VideoCall model với đầy đủ fields
- Validation và middleware
- Participant tracking

✅ **UI Components**
- VideoCall component với controls
- VideoCallManager để quản lý
- Responsive design
- Loading states

✅ **Dashboard Integration**
- VideoCallNotification component
- Button video call trong MyAppointments
- Link navigation đến video call page

✅ **API Integration**
- VideoCallAPI service
- CRUD operations
- Error handling

### 8. Test Cases

#### Test Case 1: Tạo Video Call Room
1. Tạo appointment online
2. Duyệt appointment
3. Kiểm tra video call room được tạo
4. Verify database có record VideoCall

#### Test Case 2: Join Video Call
1. Bệnh nhân click "Video Call" button
2. Navigate đến video call page
3. Verify WebRTC service initialize
4. Test camera/microphone permissions

#### Test Case 3: Video Call Controls
1. Test toggle video on/off
2. Test toggle audio on/off
3. Test end call
4. Verify connection status updates

#### Test Case 4: Multi-user Test
1. Mở 2 browser windows
2. Login với 2 tài khoản khác nhau
3. Join cùng 1 video call room
4. Verify video/audio streaming

### 9. Troubleshooting

#### Lỗi thường gặp:

1. **"Failed to get user media"**
   - Kiểm tra camera/microphone permissions
   - Đảm bảo sử dụng HTTPS hoặc localhost

2. **"Cannot connect to signaling server"**
   - Kiểm tra server đang chạy trên port 9999
   - Kiểm tra CORS settings

3. **"Room not found"**
   - Kiểm tra appointment đã được duyệt
   - Kiểm tra video call room đã được tạo

4. **Video không hiển thị**
   - Kiểm tra browser compatibility
   - Kiểm tra media constraints
   - Test với different browsers

### 10. Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### 11. Next Steps

1. **Production Setup**
   - Thêm TURN servers
   - SSL certificates
   - Load balancing

2. **Advanced Features**
   - Screen sharing
   - Chat trong cuộc gọi
   - Recording
   - Mobile optimization

3. **Monitoring**
   - Call quality metrics
   - Error tracking
   - Performance monitoring
