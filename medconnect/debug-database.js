// Debug script to check database data
import mongoose from 'mongoose';
import { Doctor } from './models/doctor.model.js';
import { DoctorTimeSlot } from './models/doctorTimeSlot.model.js';
import { User } from './models/user.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medconnect';

async function debugDatabase() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check users
    console.log('\n=== Users ===');
    const users = await User.find({}).limit(5).lean();
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`  User ${index + 1}: ${user.email} (ID: ${user._id})`);
    });

    // Check doctors
    console.log('\n=== Doctors ===');
    const doctors = await Doctor.find({}).limit(5).lean();
    console.log(`Found ${doctors.length} doctors:`);
    doctors.forEach((doctor, index) => {
      console.log(`  Doctor ${index + 1}: ${doctor.userId} (ID: ${doctor._id})`);
    });

    // Check time slots
    console.log('\n=== Time Slots ===');
    const timeSlots = await DoctorTimeSlot.find({}).limit(10).lean();
    console.log(`Found ${timeSlots.length} time slots:`);
    timeSlots.forEach((slot, index) => {
      const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
      console.log(`  Slot ${index + 1}: ${startTime} - ${slot.status} (Doctor: ${slot.doctorId})`);
    });

    // Check specific user from auth
    const authUserId = 'app_0282bd36cb9d21f6be6abf0d';
    console.log(`\n=== Checking user ${authUserId} ===`);
    
    // Try to find user by _id
    const userById = await User.findById(authUserId).lean();
    if (userById) {
      console.log(`✅ Found user by ID: ${userById.email}`);
      
      // Find doctor for this user
      const doctor = await Doctor.findOne({ userId: userById._id }).lean();
      if (doctor) {
        console.log(`✅ Found doctor: ${doctor._id}`);
        
        // Find time slots for this doctor
        const doctorSlots = await DoctorTimeSlot.find({ doctorId: doctor._id }).limit(5).lean();
        console.log(`✅ Found ${doctorSlots.length} time slots for this doctor`);
        doctorSlots.forEach((slot, index) => {
          const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
          console.log(`  Slot ${index + 1}: ${startTime} - ${slot.status}`);
        });
      } else {
        console.log(`❌ No doctor found for user ${userById.email}`);
      }
    } else {
      console.log(`❌ User not found by ID: ${authUserId}`);
      
      // Try to find by email pattern
      const usersByEmail = await User.find({ email: { $regex: /app_0282bd36cb9d21f6be6abf0d/i } }).lean();
      console.log(`Found ${usersByEmail.length} users by email pattern`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔍 Disconnected from MongoDB');
  }
}

debugDatabase();
