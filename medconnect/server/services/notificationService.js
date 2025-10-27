import Notification from "../models/notification.model.js";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";

/**
 * Notification Service for Appointment Management
 * Handles automatic notifications for appointment status changes
 */

/**
 * Create notification for appointment status change
 */
export async function createAppointmentNotification(
  appointmentId,
  status,
  additionalData = {}
) {
  try {
    // Get appointment with populated data
    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "userId fullName")
      .populate("doctorId", "userId fullName")
      .populate("patientId.userId", "email phone")
      .populate("doctorId.userId", "email phone")
      .lean();

    if (!appointment) {
      console.error("❌ Appointment not found:", appointmentId);
      return null;
    }

    const patientUser = appointment.patientId?.userId;
    const doctorUser = appointment.doctorId?.userId;
    const patientName = appointment.patientId?.fullName || "Bệnh nhân";
    const doctorName = appointment.doctorId?.fullName || "Bác sĩ";

    // Format appointment time
    const appointmentTime = new Date(appointment.scheduledStart).toLocaleString(
      "vi-VN",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    let notifications = [];

    // Create notification based on status
    switch (status) {
      case "accepted":
        // Notify patient that appointment is confirmed
        if (patientUser) {
          notifications.push({
            userId: patientUser._id,
            type: "appointment",
            title: "Lịch hẹn đã được xác nhận",
            message: `Lịch hẹn khám với BS. ${doctorName} vào ${appointmentTime} đã được xác nhận. Vui lòng chuẩn bị đến khám đúng giờ.`,
            priority: "high",
            relatedId: appointmentId,
            relatedType: "appointment",
            metadata: {
              appointmentId,
              doctorName,
              appointmentTime,
              status: "confirmed",
              ...additionalData,
            },
          });
        }
        break;

      case "rejected":
        // Notify patient that appointment is rejected
        if (patientUser) {
          notifications.push({
            userId: patientUser._id,
            type: "appointment",
            title: "Lịch hẹn bị từ chối",
            message: `Lịch hẹn khám với BS. ${doctorName} vào ${appointmentTime} đã bị từ chối. Vui lòng đặt lịch khác hoặc liên hệ phòng khám.`,
            priority: "high",
            relatedId: appointmentId,
            relatedType: "appointment",
            metadata: {
              appointmentId,
              doctorName,
              appointmentTime,
              status: "rejected",
              reason: additionalData.rejectReason,
              ...additionalData,
            },
          });
        }
        break;

      case "cancelled":
        // Notify doctor that patient cancelled
        if (doctorUser) {
          notifications.push({
            userId: doctorUser._id,
            type: "appointment",
            title: "Bệnh nhân đã hủy lịch hẹn",
            message: `Bệnh nhân ${patientName} đã hủy lịch hẹn vào ${appointmentTime}.`,
            priority: "medium",
            relatedId: appointmentId,
            relatedType: "appointment",
            metadata: {
              appointmentId,
              patientName,
              appointmentTime,
              status: "cancelled",
              reason: additionalData.cancelReason,
              ...additionalData,
            },
          });
        }
        break;

      case "rescheduled":
        // Notify both patient and doctor about reschedule
        if (patientUser) {
          notifications.push({
            userId: patientUser._id,
            type: "appointment",
            title: "Lịch hẹn đã được dời",
            message: `Lịch hẹn khám với BS. ${doctorName} đã được dời đến ${appointmentTime}.`,
            priority: "high",
            relatedId: appointmentId,
            relatedType: "appointment",
            metadata: {
              appointmentId,
              doctorName,
              appointmentTime,
              status: "rescheduled",
              ...additionalData,
            },
          });
        }

        if (doctorUser) {
          notifications.push({
            userId: doctorUser._id,
            type: "appointment",
            title: "Lịch hẹn đã được dời",
            message: `Lịch hẹn với bệnh nhân ${patientName} đã được dời đến ${appointmentTime}.`,
            priority: "medium",
            relatedId: appointmentId,
            relatedType: "appointment",
            metadata: {
              appointmentId,
              patientName,
              appointmentTime,
              status: "rescheduled",
              ...additionalData,
            },
          });
        }
        break;

      case "reschedule_requested":
        // Notify doctor about reschedule request
        if (doctorUser) {
          notifications.push({
            userId: doctorUser._id,
            type: "appointment",
            title: "Có yêu cầu dời lịch",
            message: `Bệnh nhân ${patientName} yêu cầu dời lịch từ ${additionalData.originalDateTime} đến ${additionalData.newDateTime}. Lý do: ${additionalData.reason}`,
            priority: "high",
            relatedId: appointmentId,
            relatedType: "reschedule_request",
            metadata: {
              appointmentId,
              patientName,
              originalDateTime: additionalData.originalDateTime,
              newDateTime: additionalData.newDateTime,
              reason: additionalData.reason,
              status: "pending",
              ...additionalData,
            },
          });
        }
        break;

      case "reschedule_rejected":
        // Notify patient about reschedule rejection
        if (patientUser) {
          notifications.push({
            userId: patientUser._id,
            type: "appointment",
            title: "Yêu cầu dời lịch bị từ chối",
            message: `Yêu cầu dời lịch khám với BS. ${doctorName} đã bị từ chối. ${
              additionalData.reviewNotes || ""
            }`,
            priority: "medium",
            relatedId: appointmentId,
            relatedType: "reschedule_request",
            metadata: {
              appointmentId,
              doctorName,
              reason: additionalData.reason,
              reviewNotes: additionalData.reviewNotes,
              status: "rejected",
              ...additionalData,
            },
          });
        }
        break;

      case "reminder":
        // Send reminder notification (24 hours before)
        if (patientUser) {
          notifications.push({
            userId: patientUser._id,
            type: "appointment",
            title: "Nhắc nhở lịch hẹn",
            message: `Bạn có lịch hẹn khám với BS. ${doctorName} vào ngày mai (${appointmentTime}). Vui lòng chuẩn bị đến khám đúng giờ.`,
            priority: "medium",
            relatedId: appointmentId,
            relatedType: "appointment",
            metadata: {
              appointmentId,
              doctorName,
              appointmentTime,
              status: "reminder",
              ...additionalData,
            },
          });
        }
        break;

      default:
        console.log("⚠️ Unknown appointment status:", status);
        return null;
    }

    // Create notifications in database
    if (notifications.length > 0) {
      const createdNotifications = await Notification.insertMany(notifications);
      console.log(
        `✅ Created ${createdNotifications.length} notifications for appointment ${appointmentId}`
      );
      return createdNotifications;
    }

    return null;
  } catch (error) {
    console.error("❌ Error creating appointment notification:", error);
    throw error;
  }
}

/**
 * Create notification for new appointment booking
 */
export async function createBookingNotification(appointmentId) {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "userId fullName")
      .populate("doctorId", "userId fullName")
      .populate("doctorId.userId", "email phone")
      .lean();

    if (!appointment) {
      console.error("❌ Appointment not found:", appointmentId);
      return null;
    }

    const doctorUser = appointment.doctorId?.userId;
    const patientName = appointment.patientId?.fullName || "Bệnh nhân";
    const doctorName = appointment.doctorId?.fullName || "Bác sĩ";

    const appointmentTime = new Date(appointment.scheduledStart).toLocaleString(
      "vi-VN",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Notify doctor about new appointment request
    if (doctorUser) {
      const notification = await Notification.create({
        userId: doctorUser._id,
        type: "appointment",
        title: "Có lịch hẹn mới",
        message: `Bệnh nhân ${patientName} đã đặt lịch hẹn khám vào ${appointmentTime}. Vui lòng xác nhận hoặc từ chối.`,
        priority: "high",
        relatedId: appointmentId,
        relatedType: "appointment",
        metadata: {
          appointmentId,
          patientName,
          appointmentTime,
          status: "pending_confirmation",
        },
      });

      console.log(`✅ Created booking notification for doctor ${doctorName}`);
      return notification;
    }

    return null;
  } catch (error) {
    console.error("❌ Error creating booking notification:", error);
    throw error;
  }
}

/**
 * Send appointment reminder (called by cron job)
 */
export async function sendAppointmentReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Find appointments scheduled for tomorrow
    const appointments = await Appointment.find({
      scheduledStart: {
        $gte: tomorrow,
        $lte: tomorrowEnd,
      },
      status: "accepted",
    })
      .populate("patientId", "userId fullName")
      .populate("doctorId", "userId fullName")
      .lean();

    console.log(`🔔 Found ${appointments.length} appointments for reminder`);

    for (const appointment of appointments) {
      await createAppointmentNotification(appointment._id, "reminder");
    }

    return appointments.length;
  } catch (error) {
    console.error("❌ Error sending appointment reminders:", error);
    throw error;
  }
}

/**
 * Get notification statistics for admin
 */
export async function getNotificationStats() {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const totalNotifications = await Notification.countDocuments();
    const totalUnread = await Notification.countDocuments({ isRead: false });

    return {
      totalNotifications,
      totalUnread,
      byType: stats,
    };
  } catch (error) {
    console.error("❌ Error getting notification stats:", error);
    throw error;
  }
}
