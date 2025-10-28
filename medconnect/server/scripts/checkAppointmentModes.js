import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/MedConnect", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAppointmentModes() {
  try {
    console.log("🔍 Checking appointment modes...\n");

    // Get all appointments
    const appointments = await Appointment.find({})
      .populate("patientId", "userId")
      .populate("doctorId", "userId")
      .populate("clinicId", "name")
      .lean();

    console.log(`📊 Total appointments: ${appointments.length}\n`);

    // Group by mode
    const modeStats = {};
    appointments.forEach((apt) => {
      if (!modeStats[apt.mode]) {
        modeStats[apt.mode] = 0;
      }
      modeStats[apt.mode]++;
    });

    console.log("📈 Mode statistics:");
    Object.entries(modeStats).forEach(([mode, count]) => {
      console.log(`  ${mode}: ${count} appointments`);
    });

    console.log("\n📋 Recent appointments (last 10):");
    const recentAppointments = appointments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    recentAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt._id}`);
      console.log(`   Mode: ${apt.mode}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Created: ${apt.createdAt}`);
      console.log(`   Clinic: ${apt.clinicId?.name || "N/A"}`);
      console.log(`   Rescheduled: ${apt.rescheduledFromId ? "Yes" : "No"}`);
      console.log("   ---");
    });

    // Check for appointments with wrong mode
    console.log("\n⚠️  Checking for potential issues:");

    const offlineWithoutClinic = appointments.filter(
      (apt) => apt.mode === "offline" && !apt.clinicId
    );

    if (offlineWithoutClinic.length > 0) {
      console.log(
        `❌ Found ${offlineWithoutClinic.length} offline appointments without clinic:`
      );
      offlineWithoutClinic.forEach((apt) => {
        console.log(`   - ${apt._id} (created: ${apt.createdAt})`);
      });
    }

    const onlineWithClinic = appointments.filter(
      (apt) => apt.mode === "online" && apt.clinicId
    );

    if (onlineWithClinic.length > 0) {
      console.log(
        `❌ Found ${onlineWithClinic.length} online appointments with clinic:`
      );
      onlineWithClinic.forEach((apt) => {
        console.log(`   - ${apt._id} (created: ${apt.createdAt})`);
      });
    }

    console.log("\n✅ Check completed!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkAppointmentModes();
