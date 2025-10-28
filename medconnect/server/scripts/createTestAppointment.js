import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import User from "../models/user.model.js";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/MedConnect", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestAppointment() {
  try {
    console.log("🔍 Creating test appointment...\n");

    // Find existing patient and doctor
    const patient = await Patient.findOne({}).populate("userId");
    const doctor = await Doctor.findOne({}).populate("userId");
    const clinic = await Clinic.findOne({});

    if (!patient) {
      console.log("❌ No patient found. Please create a patient first.");
      return;
    }

    if (!doctor) {
      console.log("❌ No doctor found. Please create a doctor first.");
      return;
    }

    if (!clinic) {
      console.log("❌ No clinic found. Please create a clinic first.");
      return;
    }

    console.log("👤 Patient:", patient.userId?.fullName || "Unknown");
    console.log("👨‍⚕️ Doctor:", doctor.userId?.fullName || "Unknown");
    console.log("🏥 Clinic:", clinic.name);

    // Create test appointment - OFFLINE mode
    const appointmentData = {
      patientId: patient._id,
      doctorId: doctor._id,
      clinicId: clinic._id,
      mode: "offline", // This should be offline for direct consultation
      scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledEnd: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Tomorrow + 30 minutes
      status: "accepted",
      reason: "Test appointment for offline consultation",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    console.log("\n✅ Test appointment created successfully!");
    console.log("📋 Appointment details:");
    console.log(`   ID: ${appointment._id}`);
    console.log(`   Mode: ${appointment.mode}`);
    console.log(`   Status: ${appointment.status}`);
    console.log(`   Start: ${appointment.scheduledStart}`);
    console.log(`   End: ${appointment.scheduledEnd}`);
    console.log(`   Clinic: ${clinic.name}`);

    // Also create an ONLINE appointment for comparison
    const onlineAppointmentData = {
      ...appointmentData,
      mode: "online",
      clinicId: undefined, // Online appointments don't need clinic
      reason: "Test appointment for online consultation",
    };

    const onlineAppointment = new Appointment(onlineAppointmentData);
    await onlineAppointment.save();

    console.log("\n✅ Test ONLINE appointment created for comparison!");
    console.log(`   ID: ${onlineAppointment._id}`);
    console.log(`   Mode: ${onlineAppointment.mode}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

createTestAppointment();
