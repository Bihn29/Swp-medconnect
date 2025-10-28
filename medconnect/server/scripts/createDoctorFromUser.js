import mongoose from "mongoose";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/MedConnect", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createDoctorFromUser() {
  try {
    console.log("🔍 Creating doctor from existing user...\n");

    // Find user with doctor role
    const doctorUser = await User.findOne({ role: "doctor" });

    if (!doctorUser) {
      console.log("❌ No doctor user found");
      return;
    }

    console.log("👤 Found doctor user:", doctorUser.fullName, doctorUser.email);

    // Check if doctor record already exists
    const existingDoctor = await Doctor.findOne({ userId: doctorUser._id });

    if (existingDoctor) {
      console.log("✅ Doctor record already exists:", existingDoctor._id);
      return;
    }

    // Get clinic
    const clinic = await Clinic.findOne({});

    if (!clinic) {
      console.log("❌ No clinic found");
      return;
    }

    console.log("🏥 Using clinic:", clinic.name);

    // Create doctor record
    const doctorData = {
      userId: doctorUser._id,
      fullName: doctorUser.fullName, // Add fullName from user
      licenseNo: "LIC-" + Date.now(),
      clinicDefaultId: clinic._id,
      isVerified: true,
      specializationIds: [], // Will be empty for now
      ratingCount: 0,
      ratingAvg: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const doctor = new Doctor(doctorData);
    await doctor.save();

    console.log("\n✅ Doctor record created successfully!");
    console.log("📋 Doctor details:");
    console.log(`   ID: ${doctor._id}`);
    console.log(`   User ID: ${doctor.userId}`);
    console.log(`   License: ${doctor.licenseNo}`);
    console.log(`   Clinic: ${clinic.name}`);
    console.log(`   Verified: ${doctor.isVerified}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

createDoctorFromUser();
