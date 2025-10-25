import mongoose from "mongoose";
import DoctorTimeSlot from "./models/doctorTimeSlot.model.js";
import Doctor from "./models/doctor.model.js";
import User from "./models/user.model.js";
import DoctorScheduleRule from "./models/doctor_schedule_rules.model.js";

async function checkAndCreateSlotsForCurrentDoctor() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medconnect');
    console.log('Connected to MongoDB');

    // Get all doctors
    const doctors = await Doctor.find().populate('userId');
    console.log('\n📊 All Doctors:');
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.fullName} (${doctor.userId?.email}) - ID: ${doctor._id}`);
    });

    // Find doctor by email (assuming doctor@test.com or similar)
    const doctorEmails = ['doctor@test.com', 'buingoclan@example.com', 'patient@test.com'];
    let targetDoctor = null;
    
    for (const email of doctorEmails) {
      const user = await User.findOne({ email });
      if (user) {
        const doctor = await Doctor.findOne({ userId: user._id });
        if (doctor) {
          targetDoctor = doctor;
          console.log(`\n🎯 Found target doctor: ${doctor.fullName} (${email})`);
          break;
        }
      }
    }

    if (!targetDoctor) {
      console.log('❌ No doctor found with common emails');
      return;
    }

    // Check schedule rules
    let scheduleRules = await DoctorScheduleRule.find({
      doctorId: targetDoctor._id,
      isActive: true
    });

    if (scheduleRules.length === 0) {
      console.log('📋 No schedule rules found, creating default ones...');
      
      // Create default schedule rules for weekdays (Monday to Friday)
      const defaultRules = [];
      for (let weekday = 1; weekday <= 5; weekday++) {
        const rule = {
          doctorId: targetDoctor._id,
          weekday: weekday,
          blocks: [
            { startTime: "07:00", endTime: "11:40" },
            { startTime: "13:00", endTime: "17:00" }
          ],
          slotBlockMinutes: 20,
          consultMinutes: 20,
          effectiveFrom: new Date(),
          isActive: true
        };
        defaultRules.push(rule);
      }
      
      scheduleRules = await DoctorScheduleRule.insertMany(defaultRules);
      console.log(`✅ Created ${scheduleRules.length} default schedule rules`);
    } else {
      console.log(`📋 Found ${scheduleRules.length} existing schedule rules`);
    }

    // Check existing time slots
    const existingSlots = await DoctorTimeSlot.find({ doctorId: targetDoctor._id });
    console.log(`⏰ Existing time slots: ${existingSlots.length}`);

    if (existingSlots.length === 0) {
      console.log('🔧 No time slots found, creating them...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 14);

      const createdSlots = [];

      for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        const weekday = currentDate.getDay();

        const dayRule = scheduleRules.find(rule => rule.weekday === weekday);
        if (!dayRule) continue;

        const generatedSlots = DoctorScheduleRule.generateSlotsForDate({
          date: currentDate,
          blocks: dayRule.blocks,
          slotBlockMinutes: dayRule.slotBlockMinutes
        });

        for (const slotData of generatedSlots) {
          const newSlot = await DoctorTimeSlot.create({
            doctorId: targetDoctor._id,
            startAt: slotData.startAt,
            endAt: slotData.endAt,
            status: "available"
          });
          createdSlots.push(newSlot);
        }
      }

      console.log(`✅ Created ${createdSlots.length} time slots`);
    } else {
      console.log('✅ Time slots already exist');
    }

    // Final verification
    const finalSlots = await DoctorTimeSlot.find({ doctorId: targetDoctor._id });
    console.log(`\n🎉 Final result: ${finalSlots.length} time slots for doctor ${targetDoctor.fullName}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkAndCreateSlotsForCurrentDoctor();
