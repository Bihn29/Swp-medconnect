/**
 * Script để tạo appointment online test cho video call reminder
 * 
 * Usage: node server/scripts/createTestOnlineAppointment.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";

dotenv.config();

async function createTestAppointment() {
  try {
    console.log("🚀 Creating test online appointment...");
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/MedConnect";
    console.log(`📦 Connecting to MongoDB: ${mongoUrl}`);
    
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");
    
    // Find the first active patient and doctor
    const patient = await Patient.findOne()
      .populate("userId", "email")
      .lean();
    
    const doctor = await Doctor.findOne({ isActive: true, isVerified: true })
      .populate("userId", "email")
      .lean();
    
    if (!patient) {
      console.log("❌ No patient found in database");
      await mongoose.connection.close();
      return;
    }
    
    if (!doctor) {
      console.log("❌ No active doctor found in database");
      await mongoose.connection.close();
      return;
    }
    
    console.log(`\n📋 Found patient: ${patient.fullName} (${patient.userId?.email || 'no email'})`);
    console.log(`👨‍⚕️ Found doctor: ${doctor.fullName} (${doctor.userId?.email || 'no email'})`);
    
    // Delete old test appointments first
    await Appointment.deleteMany({
      patientId: patient._id,
      reason: "Test appointment for video call reminder",
    });
    console.log("🗑️  Deleted old test appointments");
    
    // Calculate time: 10.5 minutes from now
    const now = new Date();
    const testStartTime = new Date(now.getTime() + 10.5 * 60 * 1000);
    const testEndTime = new Date(testStartTime.getTime() + 30 * 60 * 1000); // 30 min duration
    
    console.log(`\n⏰ Creating appointment for:`);
    console.log(`   Start: ${testStartTime.toLocaleString("vi-VN")}`);
    console.log(`   End: ${testEndTime.toLocaleString("vi-VN")}`);
    console.log(`   In ${Math.round((testStartTime.getTime() - now.getTime()) / 60000)} minutes`);
    
    // Find or create a time slot
    let timeSlot = await DoctorTimeSlot.findOne({
      doctorId: doctor._id,
      startAt: testStartTime,
      endAt: testEndTime,
    }).lean();
    
    if (!timeSlot) {
      console.log("📝 No time slot found, creating one...");
      const newSlot = await DoctorTimeSlot.create({
        doctorId: doctor._id,
        startAt: testStartTime,
        endAt: testEndTime,
        status: "available",
      });
      timeSlot = newSlot;
      console.log("✅ Created new time slot");
    }
    
    // Create test appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      slotId: timeSlot._id,
      mode: "online",
      scheduledStart: testStartTime,
      scheduledEnd: testEndTime,
      status: "accepted",
      reason: "Test appointment for video call reminder",
    });
    
    console.log("\n✅ Test appointment created successfully!");
    console.log(`   Appointment ID: ${appointment._id}`);
    console.log(`   Patient: ${patient.fullName}`);
    console.log(`   Doctor: ${doctor.fullName}`);
    console.log(`   Mode: online`);
    console.log(`   Status: accepted`);
    console.log(`   Scheduled start: ${testStartTime.toLocaleString("vi-VN")}`);
    
    if (patient.userId?.email) {
      console.log(`\n📧 Email will be sent to: ${patient.userId.email}`);
      console.log(`   ⏰ Reminder will be sent automatically in ~1 minute`);
    } else {
      console.log(`\n⚠️  Patient has no email, reminder won't be sent`);
    }
    
    console.log("\n💡 Now you can run:");
    console.log("   node scripts/testVideoCallReminder.js");
    console.log("   Or wait 1 minute for the automatic cron job to send the reminder");
    
  } catch (error) {
    console.error("❌ Error creating test appointment:", error);
    console.error(error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
    process.exit(0);
  }
}

// Run the test
createTestAppointment();

