import mongoose from "mongoose";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Specialization from "../models/specialization.model.js";

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

// Create test data
const createTestData = async () => {
  try {
    // Create specializations
    const specializations = [
      { name: "Nội khoa", description: "Chuyên khoa nội tổng quát" },
      { name: "Ngoại khoa", description: "Chuyên khoa ngoại tổng quát" },
      { name: "Tim mạch", description: "Chuyên khoa tim mạch" },
      { name: "Thần kinh", description: "Chuyên khoa thần kinh" }
    ];

    const createdSpecializations = [];
    for (const spec of specializations) {
      const existingSpec = await Specialization.findOne({ name: spec.name });
      if (!existingSpec) {
        const newSpec = await Specialization.create(spec);
        createdSpecializations.push(newSpec);
        console.log(`✅ Created specialization: ${spec.name}`);
      } else {
        createdSpecializations.push(existingSpec);
        console.log(`⚠️ Specialization already exists: ${spec.name}`);
      }
    }

    // Create test users
    const users = [
      {
        email: "patient@test.com",
        fullName: "Nguyễn Văn A",
        phone: "0123456789",
        role: "patient",
        status: "active",
        authProvider: "local",
        passwordHash: "$2b$10$dummy.hash.for.testing.purposes.only"
      },
      {
        email: "doctor@test.com", 
        fullName: "Bác sĩ Nguyễn Văn B",
        phone: "0987654321",
        role: "doctor",
        status: "active",
        authProvider: "local",
        passwordHash: "$2b$10$dummy.hash.for.testing.purposes.only"
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const newUser = await User.create(userData);
        createdUsers.push(newUser);
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    // Create patient profile
    const patientUser = createdUsers.find(u => u.role === "patient");
    if (patientUser) {
      const existingPatient = await Patient.findOne({ userId: patientUser._id });
      if (!existingPatient) {
        await Patient.create({
          userId: patientUser._id,
          fullName: patientUser.fullName,
          dob: new Date("1990-01-01"),
          gender: "male",
          phone: patientUser.phone,
          address: "123 Đường ABC, Quận 1, TP.HCM"
        });
        console.log(`✅ Created patient profile for: ${patientUser.fullName}`);
      } else {
        console.log(`⚠️ Patient profile already exists for: ${patientUser.fullName}`);
      }
    }

    // Create doctor profile
    const doctorUser = createdUsers.find(u => u.role === "doctor");
    if (doctorUser) {
      const existingDoctor = await Doctor.findOne({ userId: doctorUser._id });
      if (!existingDoctor) {
        await Doctor.create({
          userId: doctorUser._id,
          fullName: doctorUser.fullName,
          specializationIds: [createdSpecializations[0]._id, createdSpecializations[1]._id],
          bio: "Bác sĩ có kinh nghiệm nhiều năm trong lĩnh vực y tế",
          yearsExperience: 10,
          isVerified: true,
          ratingAvg: 4.5,
          ratingCount: 100
        });
        console.log(`✅ Created doctor profile for: ${doctorUser.fullName}`);
      } else {
        console.log(`⚠️ Doctor profile already exists for: ${doctorUser.fullName}`);
      }
    }

    console.log("🎉 Test data created successfully!");
  } catch (error) {
    console.error("❌ Error creating test data:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createTestData();
  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
};

// Run the script
main().catch(console.error);
