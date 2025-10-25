import mongoose from 'mongoose';
import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URL || 'mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect';
console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI);

async function debugDoctorAuth() {
  try {
    console.log('🔍 Debugging Doctor Authentication...\n');
    
    // 1. Get all users first
    const allUsers = await User.find({}).lean();
    console.log(`📊 Found ${allUsers.length} total users:`);
    
    allUsers.forEach(user => {
      console.log(`   - ${user.fullName || 'No name'} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
    });
    
    // 2. Get all users with role 'doctor'
    const doctorUsers = await User.find({ role: 'doctor' }).lean();
    console.log(`\n👨‍⚕️ Found ${doctorUsers.length} doctor users:`);
    
    for (const user of doctorUsers) {
      console.log(`\n👤 User: ${user.fullName || 'No name'} (${user.email})`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Status: ${user.status}`);
      console.log(`   - Auth Provider: ${user.authProvider}`);
      
      // 2. Check if doctor profile exists
      const doctorProfile = await Doctor.findOne({ userId: user._id }).lean();
      if (doctorProfile) {
        console.log(`   ✅ Doctor profile exists: ${doctorProfile.fullName}`);
        console.log(`   - Doctor ID: ${doctorProfile._id}`);
        console.log(`   - License: ${doctorProfile.licenseNo || 'No license'}`);
        console.log(`   - Verified: ${doctorProfile.isVerified || false}`);
      } else {
        console.log(`   ❌ No doctor profile found for this user`);
      }
    }
    
    // 3. Check all doctor profiles
    console.log('\n📋 All Doctor Profiles:');
    const allDoctors = await Doctor.find({}).populate('userId', 'email fullName status').lean();
    
    for (const doctor of allDoctors) {
      console.log(`\n👨‍⚕️ Doctor: ${doctor.fullName}`);
      console.log(`   - Doctor ID: ${doctor._id}`);
      console.log(`   - User ID: ${doctor.userId}`);
      if (doctor.userId) {
        console.log(`   - User Email: ${doctor.userId.email}`);
        console.log(`   - User Status: ${doctor.userId.status}`);
      } else {
        console.log(`   ❌ User not found or populated`);
      }
    }
    
    // 4. Check for orphaned records
    console.log('\n🔍 Checking for orphaned records...');
    
    // Doctors without valid users
    const orphanedDoctors = await Doctor.find({
      userId: { $exists: true },
      $expr: {
        $not: {
          $in: ["$userId", doctorUsers.map(u => u._id)]
        }
      }
    }).lean();
    
    if (orphanedDoctors.length > 0) {
      console.log(`❌ Found ${orphanedDoctors.length} orphaned doctor profiles:`);
      orphanedDoctors.forEach(doc => {
        console.log(`   - ${doc.fullName} (User ID: ${doc.userId})`);
      });
    } else {
      console.log('✅ No orphaned doctor profiles found');
    }
    
    // Users without doctor profiles
    const usersWithoutProfiles = doctorUsers.filter(user => 
      !allDoctors.some(doc => doc.userId?.toString() === user._id.toString())
    );
    
    if (usersWithoutProfiles.length > 0) {
      console.log(`❌ Found ${usersWithoutProfiles.length} users without doctor profiles:`);
      usersWithoutProfiles.forEach(user => {
        console.log(`   - ${user.fullName || 'No name'} (${user.email})`);
      });
    } else {
      console.log('✅ All doctor users have profiles');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

debugDoctorAuth();
