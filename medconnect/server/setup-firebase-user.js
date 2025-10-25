import mongoose from 'mongoose';
import Doctor from './models/doctor.model.js';
import User from './models/user.model.js';
import DoctorTimeSlot from './models/doctorTimeSlot.model.js';
import Specialization from './models/specialization.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedConnect';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
  const firebaseUID = 'app_0282bd36cb9d21f6be6abf0d';
  
  // Check if user exists
  let user = await User.findOne({ firebaseUID });
  if (!user) {
    console.log('❌ User not found with Firebase UID:', firebaseUID);
    console.log('📋 Available users:');
    const allUsers = await User.find({}).lean();
    allUsers.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.fullName} (${u.email}) - FirebaseUID: ${u.firebaseUID || 'None'}`);
    });
  } else {
    console.log('✅ Found user:', user.fullName, '(', user.email, ')');
    
    // Check if doctor profile exists
    let doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      console.log('❌ Doctor profile not found for user');
      
      // Get specialization
      let specialization = await Specialization.findOne({ name: 'Sức khỏe tâm thần' });
      if (!specialization) {
        specialization = await Specialization.create({
          name: 'Sức khỏe tâm thần',
          code: 'MENTAL_HEALTH',
          description: 'Chuyên khoa về sức khỏe tâm thần'
        });
        console.log('✅ Created specialization:', specialization.name);
      }
      
      // Create doctor profile
      doctor = await Doctor.create({
        userId: user._id,
        fullName: 'Bùi Ngọc Lan',
        licenseNo: 'DOC789012',
        yearsExperience: 8,
        specializationIds: [specialization._id],
        bio: 'Bác sĩ chuyên khoa sức khỏe tâm thần',
        consultationFee: 600000,
        isActive: true
      });
      console.log('✅ Created doctor profile for:', user.fullName);
    } else {
      console.log('✅ Doctor profile already exists for:', user.fullName);
    }
    
    // Check time slots
    const timeSlots = await DoctorTimeSlot.find({ doctorId: doctor._id }).lean();
    console.log(`📅 Time slots for doctor: ${timeSlots.length}`);
    
    if (timeSlots.length === 0) {
      console.log('❌ No time slots found for doctor');
      
      // Get existing doctor's slots to copy
      const existingDoctor = await Doctor.findOne({}).populate('userId', 'email fullName').lean();
      if (existingDoctor) {
        const existingSlots = await DoctorTimeSlot.find({ doctorId: existingDoctor._id }).lean();
        console.log(`📅 Found ${existingSlots.length} existing slots to copy`);
        
        if (existingSlots.length > 0) {
          // Copy slots to new doctor
          const newSlots = existingSlots.map(slot => ({
            ...slot,
            _id: undefined, // Let MongoDB generate new ID
            doctorId: doctor._id
          }));

          await DoctorTimeSlot.insertMany(newSlots);
          console.log(`✅ Copied ${newSlots.length} time slots to new doctor`);
        }
      }
    } else {
      console.log('✅ Time slots already exist for doctor');
    }
  }

  // Final verification
  const finalUser = await User.findOne({ firebaseUID }).populate('doctorProfile').lean();
  const finalDoctor = await Doctor.findOne({ userId: finalUser?._id }).lean();
  const finalSlots = await DoctorTimeSlot.find({ doctorId: finalDoctor?._id }).lean();
  
  console.log('\n📊 Final Status:');
  console.log(`👤 User: ${finalUser?.fullName || 'Not found'}`);
  console.log(`👨‍⚕️ Doctor: ${finalDoctor?.fullName || 'Not found'}`);
  console.log(`⏰ Time Slots: ${finalSlots.length}`);
  
  if (finalSlots.length > 0) {
    console.log('\n📅 Sample time slots:');
    finalSlots.slice(0, 3).forEach((slot, index) => {
      const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
      console.log(`  ${index + 1}. ${startTime} - ${slot.status}`);
    });
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
