import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import WEBRTC_CONFIG from '../config/webrtcConfig';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.roomId = null;
    this.callbacks = {
      onLocalStream: null,
      onRemoteStream: null,
      onCallEnded: null,
      onError: null,
      onConnectionStateChange: null,
    };
  }

  // Initialize WebRTC service
  async initialize(roomId, isInitiator = false) {
    try {
      this.roomId = roomId;
      this.isInitiator = isInitiator;

      // Connect to signaling server
      this.socket = io(WEBRTC_CONFIG.SIGNALING_SERVER_URL);
      
      // Setup socket event listeners
      this.setupSocketListeners();

      // Get user media
      await this.getUserMedia();

      // Create peer connection
      this.createPeerConnection();

      return true;
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      this.callbacks.onError?.(error);
      return false;
    }
  }

  // Get user media (camera and microphone)
  async getUserMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(WEBRTC_CONFIG.MEDIA_CONSTRAINTS);

      this.callbacks.onLocalStream?.(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  // Create peer connection
  createPeerConnection() {
    const config = {
      iceServers: WEBRTC_CONFIG.STUN_SERVERS.map(url => ({ urls: url }))
    };

    this.peer = new SimplePeer({
      initiator: this.isInitiator,
      trickle: false,
      stream: this.localStream,
      config: config
    });

    // Handle peer events
    this.peer.on('signal', (data) => {
      console.log('Sending signal:', data);
      this.socket.emit('signal', {
        roomId: this.roomId,
        signal: data
      });
    });

    this.peer.on('stream', (stream) => {
      console.log('Received remote stream');
      this.remoteStream = stream;
      this.callbacks.onRemoteStream?.(stream);
    });

    this.peer.on('connect', () => {
      console.log('Peer connected');
      this.callbacks.onConnectionStateChange?.('connected');
    });

    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.callbacks.onConnectionStateChange?.('disconnected');
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
      this.callbacks.onError?.(error);
    });
  }

  // Setup socket event listeners
  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket.emit('join-room', this.roomId);
    });

    this.socket.on('user-joined', (userId) => {
      console.log('User joined:', userId);
      if (this.isInitiator) {
        this.callbacks.onConnectionStateChange?.('user-joined');
      }
    });

    this.socket.on('signal', (data) => {
      console.log('Received signal:', data);
      if (this.peer) {
        this.peer.signal(data.signal);
      }
    });

    this.socket.on('user-left', (userId) => {
      console.log('User left:', userId);
      this.endCall();
    });

    this.socket.on('call-ended', () => {
      console.log('Call ended by remote user');
      this.endCall();
    });
  }

  // Start call
  async startCall() {
    try {
      if (!this.peer) {
        throw new Error('Peer connection not initialized');
      }

      if (this.isInitiator) {
        // Initiator creates offer
        this.peer.signal();
      }

      return true;
    } catch (error) {
      console.error('Failed to start call:', error);
      this.callbacks.onError?.(error);
      return false;
    }
  }

  // End call
  endCall() {
    try {
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      if (this.socket) {
        this.socket.emit('leave-room', this.roomId);
        this.socket.disconnect();
        this.socket = null;
      }

      this.callbacks.onCallEnded?.();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get connection state
  getConnectionState() {
    if (this.peer) {
      return this.peer.connected ? 'connected' : 'disconnected';
    }
    return 'disconnected';
  }

  // Check if video is enabled
  isVideoEnabled() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      return videoTrack ? videoTrack.enabled : false;
    }
    return false;
  }

  // Check if audio is enabled
  isAudioEnabled() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? audioTrack.enabled : false;
    }
    return false;
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;
