import mongoose from "mongoose";
import DoctorTimeSlot from "./models/doctorTimeSlot.model.js";
import Doctor from "./models/doctor.model.js";
import User from "./models/user.model.js";

const MONGODB_URI = "mongodb://localhost:27017/MedConnect";

async function clearOldSlots() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a doctor
    const doctor = await Doctor.findOne().lean();
    if (!doctor) {
      console.log("❌ No doctor found");
      return;
    }

    console.log("🔍 Found doctor:", doctor.fullName);

    // Delete all existing slots for this doctor
    const deleteResult = await DoctorTimeSlot.deleteMany({ doctorId: doctor._id });
    console.log("🗑️ Deleted", deleteResult.deletedCount, "old slots");

    console.log("✅ All old slots cleared");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

clearOldSlots();
