import express from 'express';
import VideoCall from '../models/videoCall.model.js';
import Appointment from '../models/appointment.model.js';

const router = express.Router();

// Create video call room
router.post('/create-room', async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    // Check if appointment exists and is valid
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is accepted
    if (appointment.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Appointment must be accepted before starting video call'
      });
    }

    // Check if video call already exists
    const existingVideoCall = await VideoCall.findOne({ appointmentId });
    if (existingVideoCall) {
      return res.status(400).json({
        success: false,
        message: 'Video call already exists for this appointment',
        data: existingVideoCall
      });
    }

    // Create video call room
    const roomId = `MedConnect_${appointmentId}_${Date.now()}`;
    const videoCall = new VideoCall({
      appointmentId,
      provider: 'jitsi',
      roomId,
      status: 'created'
    });

    await videoCall.save();

    res.json({
      success: true,
      message: 'Video call room created successfully',
      data: {
        videoCallId: videoCall._id,
        roomId: videoCall.roomId,
        appointmentId: videoCall.appointmentId
      }
    });

  } catch (error) {
    console.error('Error creating video call room:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get video call room info
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoCall = await VideoCall.findOne({ roomId });
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Video call room not found'
      });
    }

    res.json({
      success: true,
      data: videoCall
    });

  } catch (error) {
    console.error('Error getting video call room:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start video call
router.post('/start/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoCall = await VideoCall.findOne({ roomId });
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Video call room not found'
      });
    }

    // Update video call status
    videoCall.status = 'in_progress';
    videoCall.startedAt = new Date();
    await videoCall.save();

    res.json({
      success: true,
      message: 'Video call started successfully',
      data: videoCall
    });

  } catch (error) {
    console.error('Error starting video call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// End video call
router.post('/end/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoCall = await VideoCall.findOne({ roomId });
    if (!videoCall) {
      return res.status(404).json({
        success: false,
        message: 'Video call room not found'
      });
    }

    // Update video call status
    videoCall.status = 'ended';
    videoCall.endedAt = new Date();
    await videoCall.save();

    res.json({
      success: true,
      message: 'Video call ended successfully',
      data: videoCall
    });

  } catch (error) {
    console.error('Error ending video call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get video call history for appointment
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const videoCalls = await VideoCall.find({ appointmentId })
      .sort({ createdAt: -1 })
      .populate('appointmentId', 'patientId doctorId scheduledStart scheduledEnd status');

    res.json({
      success: true,
      data: videoCalls
    });

  } catch (error) {
    console.error('Error getting video call history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get active video calls
router.get('/active', async (req, res) => {
  try {
    const activeVideoCalls = await VideoCall.find({
      status: { $in: ['created', 'in_progress'] }
    })
      .populate('appointmentId', 'patientId doctorId scheduledStart scheduledEnd status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: activeVideoCalls
    });

  } catch (error) {
    console.error('Error getting active video calls:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
