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

async function checkRescheduledAppointments() {
  try {
    console.log("🔍 Checking rescheduled appointments...\n");

    // Find all rescheduled appointments
    const rescheduledAppointments = await Appointment.find({
      status: "rescheduled",
    })
      .populate("patientId", "fullName")
      .populate("rescheduledToId", "status scheduledStart scheduledEnd")
      .lean();

    console.log(
      `📊 Found ${rescheduledAppointments.length} rescheduled appointments\n`
    );

    rescheduledAppointments.forEach((apt, index) => {
      console.log(
        `${index + 1}. Patient: ${apt.patientId?.fullName || "Unknown"}`
      );
      console.log(`   Original: ${apt.scheduledStart} - Status: ${apt.status}`);
      console.log(
        `   Rescheduled to: ${apt.rescheduledToId?.scheduledStart || "N/A"}`
      );
      console.log(`   New status: ${apt.rescheduledToId?.status || "N/A"}`);
      console.log(`   Mode: ${apt.mode}`);
      console.log("   ---");
    });

    // Check appointments with in_progress status
    const inProgressAppointments = await Appointment.find({
      status: "in_progress",
    })
      .populate("patientId", "fullName")
      .populate("rescheduledFromId", "status")
      .lean();

    console.log(
      `\n📊 Found ${inProgressAppointments.length} in_progress appointments\n`
    );

    inProgressAppointments.forEach((apt, index) => {
      console.log(
        `${index + 1}. Patient: ${apt.patientId?.fullName || "Unknown"}`
      );
      console.log(
        `   Scheduled: ${apt.scheduledStart} - Status: ${apt.status}`
      );
      console.log(`   Mode: ${apt.mode}`);
      console.log(
        `   Rescheduled from: ${apt.rescheduledFromId ? "Yes" : "No"}`
      );
      if (apt.rescheduledFromId) {
        console.log(`   Original status: ${apt.rescheduledFromId.status}`);
      }
      console.log("   ---");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkRescheduledAppointments();
