/**
 * Script để tự động hủy các appointments chưa thanh toán sau 10 phút
 * Chạy định kỳ bằng cron job
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Appointment from "../models/appointment.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import TempOrder from "../models/TempOrder.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medconnect";

async function cancelUnpaidAppointments() {
  try {
    console.log("🔍 Checking for unpaid appointments past deadline...");

    // Tìm appointments chưa thanh toán và đã quá deadline
    const unpaidAppointments = await Appointment.find({
      paymentStatus: "unpaid",
      paymentDeadline: { $lt: new Date() }, // Deadline đã qua
      status: { $ne: "cancelled" }, // Chưa bị hủy
    });

    if (unpaidAppointments.length === 0) {
      console.log("✅ No unpaid appointments to cancel");
      return { cancelled: 0 };
    }

    console.log(`⚠️  Found ${unpaidAppointments.length} unpaid appointment(s) to cancel`);

    let cancelledCount = 0;
    let slotReleasedCount = 0;

    for (const appointment of unpaidAppointments) {
      try {
        // 1. Hủy appointment
        appointment.status = "cancelled";
        appointment.cancelReason = "Không thanh toán trong thời hạn 10 phút";
        appointment.cancelledAt = new Date();
        await appointment.save();

        console.log(`❌ Cancelled appointment ${appointment._id}`);
        cancelledCount++;

        // 2. Giải phóng time slot
        if (appointment.slotId) {
          await DoctorTimeSlot.findByIdAndUpdate(appointment.slotId, {
            status: "available",
          });
          console.log(`🔓 Released time slot ${appointment.slotId}`);
          slotReleasedCount++;
        }

        // 3. Xóa TempOrder nếu có
        const deletedTempOrders = await TempOrder.deleteMany({
          appointmentId: appointment._id,
        });
        if (deletedTempOrders.deletedCount > 0) {
          console.log(`🗑️  Deleted ${deletedTempOrders.deletedCount} TempOrder(s) for appointment ${appointment._id}`);
        }

      } catch (error) {
        console.error(`❌ Error cancelling appointment ${appointment._id}:`, error);
      }
    }

    console.log(`✅ Cancellation complete: ${cancelledCount} appointment(s) cancelled, ${slotReleasedCount} slot(s) released`);

    return {
      cancelled: cancelledCount,
      slotsReleased: slotReleasedCount,
    };

  } catch (error) {
    console.error("❌ Error in cancelUnpaidAppointments:", error);
    throw error;
  }
}

// Nếu chạy trực tiếp (không import)
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      console.log("🚀 Connecting to MongoDB...");
      await mongoose.connect(MONGODB_URI);
      console.log("✅ Connected to MongoDB");

      const result = await cancelUnpaidAppointments();
      console.log("📊 Result:", result);

      await mongoose.disconnect();
      console.log("👋 Disconnected from MongoDB");
      process.exit(0);
    } catch (error) {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    }
  })();
}

export default cancelUnpaidAppointments;

