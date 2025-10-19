import mongoose from "mongoose";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Doctor from "../models/doctor.model.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/medconnect");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create test time slots for a doctor
const createTestTimeSlots = async () => {
  try {
    // Get first doctor
    const doctor = await Doctor.findOne().lean();
    if (!doctor) {
      console.log("❌ No doctors found in database");
      return;
    }

    console.log(`📋 Creating time slots for doctor: ${doctor.fullName} (${doctor._id})`);

    // Create time slots for today and next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      // Create slots from 9:00 AM to 5:00 PM, 30 minutes each
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startAt = new Date(currentDate);
          startAt.setHours(hour, minute, 0, 0);

          const endAt = new Date(currentDate);
          endAt.setHours(hour, minute + 30, 0, 0);

          // Skip if slot already exists
          const existingSlot = await DoctorTimeSlot.findOne({
            doctorId: doctor._id,
            startAt,
            endAt
          });

          if (!existingSlot) {
            await DoctorTimeSlot.create({
              doctorId: doctor._id,
              startAt,
              endAt,
              status: "available"
            });
            console.log(`✅ Created slot: ${startAt.toLocaleString()} - ${endAt.toLocaleString()}`);
          }
        }
      }
    }

    console.log("🎉 Test time slots created successfully!");
  } catch (error) {
    console.error("❌ Error creating test time slots:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createTestTimeSlots();
  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
};

// Run the script
main().catch(console.error);
