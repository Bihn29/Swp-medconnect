import Appointment from '../models/appointment.model.js';

/**
 * Get appointment by slotId
 * @route GET /api/appointments/slot/:slotId
 */
export async function getAppointmentBySlotId(req, res) {
  try {
    const { slotId } = req.params;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    console.log("🔍 Getting appointment by slotId:", slotId);

    // Find appointment by slotId
    const appointment = await Appointment.findOne({ slotId })
      .populate('patientId', 'fullName dob gender phone')
      .populate('doctorId', 'fullName specializationIds licenseNo')
      .lean();

    if (!appointment) {
      console.log("❌ No appointment found for slotId:", slotId);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found for this slot'
      });
    }

    console.log("✅ Found appointment:", appointment._id.toString());

    return res.json({
      success: true,
      data: {
        appointmentId: appointment._id.toString(),
        appointment: appointment
      }
    });

  } catch (error) {
    console.error("❌ Error getting appointment by slotId:", error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

