import mongoose from 'mongoose';
import Doctor from './models/doctor.model.js';
import User from './models/user.model.js';
import DoctorTimeSlot from './models/doctorTimeSlot.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedConnect';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
  // Check users
  const users = await User.find({}).lean();
  console.log('📊 Total users:', users.length);
  
  if (users.length > 0) {
    console.log('👤 Users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
    });
  }

  // Check doctors
  const doctors = await Doctor.find({}).populate('userId', 'email fullName').lean();
  console.log('\n📊 Total doctors:', doctors.length);
  
  if (doctors.length > 0) {
    console.log('👨‍⚕️ Doctors:');
    doctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.userId?.fullName} (${doctor.userId?.email}) - License: ${doctor.licenseNo}`);
    });
  }

  // Check time slots
  const timeSlots = await DoctorTimeSlot.find({}).lean();
  console.log('\n📊 Total time slots:', timeSlots.length);
  
  if (timeSlots.length > 0) {
    console.log('⏰ Time slots:');
    timeSlots.forEach((slot, index) => {
      const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
      console.log(`  ${index + 1}. ${startTime} - Status: ${slot.status}`);
    });
  }

  // Check specific doctor's time slots
  if (doctors.length > 0) {
    const doctorId = doctors[0]._id;
    const doctorSlots = await DoctorTimeSlot.find({ doctorId }).lean();
    console.log(`\n⏰ Time slots for doctor ${doctors[0].userId?.fullName}:`, doctorSlots.length);
    
    if (doctorSlots.length > 0) {
      console.log('📅 Sample slots:');
      doctorSlots.slice(0, 5).forEach((slot, index) => {
        const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
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
