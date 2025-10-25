// Script to create session cookie for doctor
import mongoose from 'mongoose';
import User from './server/models/user.model.js';
import Doctor from './server/models/doctor.model.js';
import admin from 'firebase-admin';

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/MedConnect";

async function createDoctorSession() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Find doctor user
    const doctorUser = await User.findOne({ role: 'doctor' });
    if (!doctorUser) {
      console.log('❌ No doctor user found');
      return;
    }

    console.log('👨‍⚕️ Found doctor user:', doctorUser.fullName, doctorUser.email);

    // Create Firebase session cookie
    const sessionCookie = await admin.auth().createSessionCookie(doctorUser._id.toString(), {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
    });

    console.log('🍪 Session cookie created:', sessionCookie);
    console.log('📋 To test, use this cookie in browser:');
    console.log(`document.cookie = "session=${sessionCookie}; path=/; domain=localhost"`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createDoctorSession();
