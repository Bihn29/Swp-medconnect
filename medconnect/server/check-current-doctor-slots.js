import mongoose from "mongoose";
import DoctorTimeSlot from "./models/doctorTimeSlot.model.js";
import Doctor from "./models/doctor.model.js";
import User from "./models/user.model.js";
import DoctorScheduleRule from "./models/doctor_schedule_rules.model.js";

async function checkCurrentDoctorSlots() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medconnect');
    console.log('Connected to MongoDB');

    // Get all doctors
    const doctors = await Doctor.find().populate('userId');
    console.log('\n📊 All Doctors:');
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.fullName} (${doctor.userId?.email}) - ID: ${doctor._id}`);
    });

    // Check time slots for each doctor
    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Checking slots for: ${doctor.fullName}`);
      
      // Check schedule rules
      const scheduleRules = await DoctorScheduleRule.find({
        doctorId: doctor._id,
        isActive: true
      });
      console.log(`📋 Schedule Rules: ${scheduleRules.length}`);
      
      if (scheduleRules.length > 0) {
        scheduleRules.forEach(rule => {
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          console.log(`  - ${dayNames[rule.weekday]}: ${rule.blocks.length} blocks`);
          rule.blocks.forEach(block => {
            console.log(`    * ${block.startTime} - ${block.endTime}`);
          });
        });
      }

      // Check time slots
      const timeSlots = await DoctorTimeSlot.find({ doctorId: doctor._id });
      console.log(`⏰ Time Slots: ${timeSlots.length}`);
      
      if (timeSlots.length > 0) {
        // Group by date
        const slotsByDate = {};
        timeSlots.forEach(slot => {
          const date = slot.startAt.toISOString().split('T')[0];
          if (!slotsByDate[date]) {
            slotsByDate[date] = [];
          }
          slotsByDate[date].push(slot);
        });

        console.log(`📅 Slots by date:`);
        Object.keys(slotsByDate).slice(0, 5).forEach(date => {
          const slots = slotsByDate[date];
          console.log(`  - ${date}: ${slots.length} slots (${slots[0].startAt.toTimeString().split(' ')[0]} - ${slots[slots.length-1].endAt.toTimeString().split(' ')[0]})`);
        });
        
        if (Object.keys(slotsByDate).length > 5) {
          console.log(`  ... and ${Object.keys(slotsByDate).length - 5} more dates`);
        }
      } else {
        console.log(`❌ No time slots found for this doctor`);
      }
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkCurrentDoctorSlots();
