import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";

// Connect to MongoDB Atlas
mongoose.connect(
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function fixRescheduledAppointmentStatus() {
  try {
    console.log("🔍 Fixing rescheduled appointment status...\n");

    // Find the specific appointment for Do Duc Minh
    const rescheduledAppointment = await Appointment.findOne({
      status: "rescheduled",
      patientId: { $exists: true },
    })
      .populate("patientId", "fullName")
      .populate("rescheduledToId")
      .lean();

    if (!rescheduledAppointment) {
      console.log("❌ No rescheduled appointment found");
      return;
    }

    console.log("📋 Found rescheduled appointment:");
    console.log(
      `   Patient: ${rescheduledAppointment.patientId?.fullName || "Unknown"}`
    );
    console.log(
      `   Original: ${rescheduledAppointment.scheduledStart} - Status: ${rescheduledAppointment.status}`
    );
    console.log(
      `   Rescheduled to: ${
        rescheduledAppointment.rescheduledToId?.scheduledStart || "N/A"
      }`
    );
    console.log(
      `   New status: ${
        rescheduledAppointment.rescheduledToId?.status || "N/A"
      }`
    );

    if (rescheduledAppointment.rescheduledToId) {
      // Update the new appointment status from in_progress to accepted
      const updateResult = await Appointment.findByIdAndUpdate(
        rescheduledAppointment.rescheduledToId._id,
        {
          status: "accepted",
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updateResult) {
        console.log("\n✅ Successfully updated new appointment status:");
        console.log(`   From: in_progress`);
        console.log(`   To: accepted`);
        console.log(`   New appointment ID: ${updateResult._id}`);
      } else {
        console.log("❌ Failed to update appointment status");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

fixRescheduledAppointmentStatus();
