// WebRTC Configuration
export const WEBRTC_CONFIG = {
  // Signaling Server URL
  SIGNALING_SERVER_URL: import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:9999',
  
  // STUN Servers
  STUN_SERVERS: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302'
  ],
  
  // Video/Audio Quality Settings
  VIDEO_QUALITY: import.meta.env.VITE_VIDEO_QUALITY || 'medium',
  AUDIO_QUALITY: import.meta.env.VITE_AUDIO_QUALITY || 'medium',
  
  // Call Duration Limits
  MAX_CALL_DURATION: parseInt(import.meta.env.VITE_MAX_CALL_DURATION) || 3600, // 1 hour
  
  // Debug Settings
  DEBUG: import.meta.env.VITE_DEBUG_WEBRTC === 'true',
  ENABLE_VIDEO_CALL: import.meta.env.VITE_ENABLE_VIDEO_CALL !== 'false',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api',
  
  // Media Constraints
  MEDIA_CONSTRAINTS: {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
      frameRate: { ideal: 30, max: 60 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    }
  },
  
  // Connection Timeouts
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  ICE_GATHERING_TIMEOUT: 10000, // 10 seconds
  
  // Reconnection Settings
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 2000, // 2 seconds
};

export default WEBRTC_CONFIG;
