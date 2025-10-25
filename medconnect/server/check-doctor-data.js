import mongoose from 'mongoose';
import Doctor from './models/doctor.model.js';
import User from './models/user.model.js';
import DoctorTimeSlot from './models/doctorTimeSlot.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedConnect';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
  const firebaseUID = 'app_0282bd36cb9d21f6be6abf0d';
  
  // Find user
  const user = await User.findOne({ firebaseUID }).lean();
  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }
  
  console.log('👤 User:', user.fullName, '(', user.email, ')');
  
  // Find doctor profile
  const doctor = await Doctor.findOne({ userId: user._id }).lean();
  if (!doctor) {
    console.log('❌ Doctor profile not found for this user');
    process.exit(1);
  }
  
  console.log('👨‍⚕️ Doctor:', doctor.fullName, '- License:', doctor.licenseNo);
  
  // Find time slots
  const timeSlots = await DoctorTimeSlot.find({ doctorId: doctor._id }).lean();
  console.log(`⏰ Time slots: ${timeSlots.length}`);
  
  if (timeSlots.length > 0) {
    console.log('\n📅 Sample time slots:');
    timeSlots.slice(0, 5).forEach((slot, index) => {
      const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
      console.log(`  ${index + 1}. ${startTime} - ${slot.status}`);
    });
    
    // Check slots for specific date (2025-10-23)
    const targetDate = '2025-10-23';
    const slotsForDate = timeSlots.filter(slot => {
      const slotDate = new Date(slot.startAt).toISOString().split('T')[0];
      return slotDate === targetDate;
    });
    
    console.log(`\n📅 Slots for ${targetDate}: ${slotsForDate.length}`);
    if (slotsForDate.length > 0) {
      slotsForDate.slice(0, 3).forEach((slot, index) => {
        const startTime = new Date(slot.startAt).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        console.log(`  ${index + 1}. ${startTime} - ${slot.status}`);
      });
    }
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
