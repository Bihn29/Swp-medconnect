import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/MedConnect");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create test appointments
const createTestAppointments = async () => {
  try {
    // Get first doctor
    const doctor = await Doctor.findOne().lean();
    if (!doctor) {
      console.log("❌ No doctors found in database");
      return;
    }

    // Get first patient
    const patient = await Patient.findOne().lean();
    if (!patient) {
      console.log("❌ No patients found in database");
      return;
    }

    console.log(`📋 Creating test appointments for patient: ${patient.fullName} (${patient._id})`);
    console.log(`👨‍⚕️ With doctor: ${doctor.fullName} (${doctor._id})`);

    // Create appointments with different statuses (all online to avoid clinicId requirement)
    const appointments = [
      {
        patientId: patient._id,
        doctorId: doctor._id,
        slotId: new mongoose.Types.ObjectId(), // Mock slot ID
        mode: "online",
        scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduledEnd: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Tomorrow + 30 min
        status: "pending_doctor",
        reason: "Khám tổng quát",
        autoExpireAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
      },
      {
        patientId: patient._id,
        doctorId: doctor._id,
        slotId: new mongoose.Types.ObjectId(), // Mock slot ID
        mode: "online",
        scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        scheduledEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Day after tomorrow + 30 min
        status: "pending_doctor",
        reason: "Tư vấn sức khỏe",
        autoExpireAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
      },
      {
        patientId: patient._id,
        doctorId: doctor._id,
        slotId: new mongoose.Types.ObjectId(), // Mock slot ID
        mode: "online",
        scheduledStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        scheduledEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 3 days from now + 30 min
        status: "accepted",
        reason: "Theo dõi điều trị",
        autoExpireAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
      }
    ];

    for (const appointmentData of appointments) {
      // Check if appointment already exists
      const existingAppointment = await Appointment.findOne({
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        scheduledStart: appointmentData.scheduledStart
      });

      if (!existingAppointment) {
        const appointment = new Appointment(appointmentData);
        await appointment.save();
        console.log(`✅ Created appointment: ${appointmentData.status} - ${appointmentData.reason}`);
      } else {
        console.log(`⚠️ Appointment already exists: ${appointmentData.status} - ${appointmentData.reason}`);
      }
    }

    console.log("🎉 Test appointments created successfully!");
    
    // Show all appointments for this patient
    const allAppointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "fullName")
      .lean();
    
    console.log(`📊 Total appointments for patient: ${allAppointments.length}`);
    allAppointments.forEach(apt => {
      console.log(`- ${apt.status}: ${apt.reason} with ${apt.doctorId?.fullName}`);
    });

  } catch (error) {
    console.error("❌ Error creating test appointments:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createTestAppointments();
  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
};

// Run the script
main().catch(console.error);
