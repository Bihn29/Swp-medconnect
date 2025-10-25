import mongoose from "mongoose";
import DoctorTimeSlot from "./models/doctorTimeSlot.model.js";
import Doctor from "./models/doctor.model.js";
import User from "./models/user.model.js";

async function createTimeSlotsForCurrentDoctor() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medconnect');
    console.log('Connected to MongoDB');

    // Find the doctor with email doctor@test.com
    const user = await User.findOne({ email: 'doctor@test.com' });
    if (!user) {
      console.log('❌ User not found with email: doctor@test.com');
      return;
    }
    console.log('👤 Found user:', user.fullName, user.email);

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      console.log('❌ Doctor profile not found for user:', user.email);
      return;
    }
    console.log('👨‍⚕️ Found doctor:', doctor.fullName, 'ID:', doctor._id);

    // Clear existing time slots for this doctor
    const deletedCount = await DoctorTimeSlot.deleteMany({ doctorId: doctor._id });
    console.log(`🗑️ Deleted ${deletedCount.deletedCount} existing time slots for doctor ${doctor.fullName}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);
    endDate.setHours(23, 59, 59, 999);

    console.log('📅 Creating slots from:', today.toISOString().split('T')[0]);
    console.log('📅 Creating slots until:', endDate.toISOString().split('T')[0]);

    const createdSlots = [];
    const skippedSlots = [];

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const weekday = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (weekday === 0 || weekday === 6) {
        console.log(`Skipping weekend: ${currentDate.toDateString()}`);
        continue;
      }

      console.log(`📅 Processing weekday: ${currentDate.toDateString()} (day ${dayOffset + 1}/14)`);
      let daySlotCount = 0;

      // Create morning slots from 7:00 to 11:20, each slot 20 minutes (14 slots total)
      for (let hour = 7; hour <= 11; hour++) {
        const maxMinute = hour === 11 ? 20 : 60; // Last slot at 11:20
        for (let minute = 0; minute < maxMinute; minute += 20) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(currentDate);
          slotEnd.setHours(hour, minute + 20, 0, 0);

          try {
            console.log(`🔍 Creating slot: ${slotStart.toTimeString()} - ${slotEnd.toTimeString()}`);
            
            const newSlot = await DoctorTimeSlot.create({
              doctorId: doctor._id,
              startAt: slotStart,
              endAt: slotEnd,
              status: "available"
            });
            createdSlots.push(newSlot);
            daySlotCount++;
            console.log(`✅ Slot created successfully: ${newSlot._id}`);
          } catch (error) {
            console.error(`❌ Error creating slot ${slotStart.toTimeString()} - ${slotEnd.toTimeString()}:`, error);
            skippedSlots.push({
              startAt: slotStart,
              endAt: slotEnd,
              reason: error.message
            });
          }
        }
      }

      // Create afternoon slots from 13:00 to 16:40, each slot 20 minutes (12 slots total)
      for (let hour = 13; hour < 17; hour++) {
        const maxMinute = hour === 16 ? 40 : 60; // Last slot at 16:40
        for (let minute = 0; minute < maxMinute; minute += 20) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(currentDate);
          slotEnd.setHours(hour, minute + 20, 0, 0);

          try {
            console.log(`🔍 Creating slot: ${slotStart.toTimeString()} - ${slotEnd.toTimeString()}`);
            
            const newSlot = await DoctorTimeSlot.create({
              doctorId: doctor._id,
              startAt: slotStart,
              endAt: slotEnd,
              status: "available"
            });
            createdSlots.push(newSlot);
            daySlotCount++;
            console.log(`✅ Slot created successfully: ${newSlot._id}`);
          } catch (error) {
            console.error(`❌ Error creating slot ${slotStart.toTimeString()} - ${slotEnd.toTimeString()}:`, error);
            skippedSlots.push({
              startAt: slotStart,
              endAt: slotEnd,
              reason: error.message
            });
          }
        }
      }
      
      console.log(`📊 Day ${dayOffset + 1} completed: ${daySlotCount} slots created`);
    }

    console.log(`✅ Created ${createdSlots.length} new time slots for doctor ${doctor.fullName}`);
    console.log(`⚠️ Skipped ${skippedSlots.length} slots (already exist or error)`);
    console.log(`📊 Expected slots: 10 weekdays × 26 slots/day = 260 slots`);
    console.log(`📊 Actual created: ${createdSlots.length} slots`);

    // Verify the slots were created
    const totalSlots = await DoctorTimeSlot.countDocuments({ doctorId: doctor._id });
    console.log(`🔍 Total slots for doctor ${doctor.fullName}: ${totalSlots}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

createTimeSlotsForCurrentDoctor();
