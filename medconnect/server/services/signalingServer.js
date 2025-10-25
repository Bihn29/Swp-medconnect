import { Server } from 'socket.io';
import VideoCall from '../models/videoCall.model.js';

class SignalingServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.rooms = new Map(); // Store room information
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join room
      socket.on('join-room', async (roomId) => {
        try {
          console.log(`User ${socket.id} joining room: ${roomId}`);
          
          // Validate room exists in database
          const videoCall = await VideoCall.findOne({ roomId });
          if (!videoCall) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          // Join socket room
          socket.join(roomId);
          
          // Store user info
          socket.roomId = roomId;
          socket.userId = socket.id;

          // Get room info
          if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
              users: new Set(),
              createdAt: new Date()
            });
          }

          const room = this.rooms.get(roomId);
          room.users.add(socket.id);

          // Notify other users in the room
          socket.to(roomId).emit('user-joined', socket.id);
          
          // Send current room users to the new user
          socket.emit('room-users', Array.from(room.users));

          console.log(`User ${socket.id} joined room ${roomId}. Total users: ${room.users.size}`);

        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle WebRTC signaling
      socket.on('signal', (data) => {
        try {
          const { roomId, signal } = data;
          console.log(`Relaying signal from ${socket.id} to room ${roomId}`);
          
          // Relay signal to other users in the room
          socket.to(roomId).emit('signal', {
            signal,
            from: socket.id
          });
        } catch (error) {
          console.error('Error handling signal:', error);
        }
      });

      // Handle call end
      socket.on('end-call', async (roomId) => {
        try {
          console.log(`Call ended in room ${roomId} by user ${socket.id}`);
          
          // Update video call record
          await VideoCall.findOneAndUpdate(
            { roomId },
            { 
              endedAt: new Date(),
              status: 'ended'
            }
          );

          // Notify all users in the room
          this.io.to(roomId).emit('call-ended', {
            endedBy: socket.id,
            endedAt: new Date()
          });

          // Clean up room
          this.cleanupRoom(roomId);

        } catch (error) {
          console.error('Error ending call:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        try {
          const roomId = socket.roomId;
          console.log(`User ${socket.id} disconnected from room ${roomId}`);

          if (roomId) {
            // Notify other users
            socket.to(roomId).emit('user-left', socket.id);

            // Remove user from room
            const room = this.rooms.get(roomId);
            if (room) {
              room.users.delete(socket.id);
              
              // If room is empty, clean it up
              if (room.users.size === 0) {
                this.cleanupRoom(roomId);
              }
            }
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  // Clean up room data
  cleanupRoom(roomId) {
    console.log(`Cleaning up room: ${roomId}`);
    this.rooms.delete(roomId);
  }

  // Create a new video call room
  async createVideoCallRoom(appointmentId, provider = 'webrtc') {
    try {
      const roomId = `room_${appointmentId}_${Date.now()}`;
      
      const videoCall = new VideoCall({
        appointmentId,
        provider,
        roomId,
        status: 'created'
      });

      await videoCall.save();

      return {
        roomId,
        videoCallId: videoCall._id
      };
    } catch (error) {
      console.error('Error creating video call room:', error);
      throw error;
    }
  }

  // Get room information
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      roomId,
      userCount: room.users.size,
      createdAt: room.createdAt,
      users: Array.from(room.users)
    };
  }

  // Get all active rooms
  getAllRooms() {
    const rooms = [];
    for (const [roomId, room] of this.rooms) {
      rooms.push({
        roomId,
        userCount: room.users.size,
        createdAt: room.createdAt
      });
    }
    return rooms;
  }
}

export default SignalingServer;
