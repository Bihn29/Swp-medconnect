import mongoose from "mongoose";
import DoctorTimeSlot from "./models/doctorTimeSlot.model.js";
import Doctor from "./models/doctor.model.js";
import User from "./models/user.model.js";

const MONGODB_URI = "mongodb://localhost:27017/MedConnect";

async function checkSlots() {
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

    // Count total slots for this doctor
    const totalSlots = await DoctorTimeSlot.countDocuments({ doctorId: doctor._id });
    console.log("📊 Total slots for doctor:", totalSlots);

    // Count slots by date
    const slotsByDate = await DoctorTimeSlot.aggregate([
      { $match: { doctorId: doctor._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log("📅 Slots by date:");
    slotsByDate.forEach(item => {
      console.log(`  ${item._id}: ${item.count} slots`);
    });

    // Count slots by weekday
    const slotsByWeekday = await DoctorTimeSlot.aggregate([
      { $match: { doctorId: doctor._id } },
      {
        $group: {
          _id: { $dayOfWeek: "$startAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log("📅 Slots by weekday (1=Sunday, 7=Saturday):");
    slotsByWeekday.forEach(item => {
      const dayNames = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      console.log(`  ${dayNames[item._id]}: ${item.count} slots`);
    });

    // Show sample slots
    const sampleSlots = await DoctorTimeSlot.find({ doctorId: doctor._id })
      .sort({ startAt: 1 })
      .limit(5)
      .lean();

    console.log("🔍 Sample slots:");
    sampleSlots.forEach(slot => {
      console.log(`  ${slot.startAt.toISOString()} - ${slot.endAt.toISOString()} (${slot.status})`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

checkSlots();
