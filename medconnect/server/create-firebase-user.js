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
  // Get existing doctor to copy data
  const existingDoctor = await Doctor.findOne({}).populate('userId', 'email fullName').lean();
  console.log('👨‍⚕️ Existing doctor:', existingDoctor?.userId?.fullName);

  // Create a specialization first
  let specialization = await Specialization.findOne({ name: 'Sức khỏe tâm thần' });
  if (!specialization) {
    specialization = await Specialization.create({
      name: 'Sức khỏe tâm thần',
      code: 'MENTAL_HEALTH',
      description: 'Chuyên khoa về sức khỏe tâm thần'
    });
    console.log('✅ Created specialization:', specialization.name);
  }

  // Create a new user with Firebase UID
  const firebaseUID = 'app_0282bd36cb9d21f6be6abf0d';
  let user = await User.findOne({ firebaseUID });
  if (!user) {
    user = await User.create({
      firebaseUID: firebaseUID,
      email: 'buingoclan@example.com',
      fullName: 'Bùi Ngọc Lan',
      phone: '0999888777',
      role: 'doctor',
      isActive: true,
      passwordHash: 'dummy_hash_for_firebase_user'
    });
    console.log('✅ Created user with Firebase UID:', user.fullName);
  } else {
    console.log('👤 User already exists:', user.fullName);
  }

  // Create a doctor profile for the new user
  let doctor = await Doctor.findOne({ userId: user._id });
  if (!doctor) {
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
    console.log('👨‍⚕️ Doctor profile already exists for:', user.fullName);
  }

  // Copy time slots from existing doctor to new doctor
  if (existingDoctor && doctor) {
    const existingSlots = await DoctorTimeSlot.find({ doctorId: existingDoctor._id }).lean();
    console.log(`📅 Found ${existingSlots.length} existing slots to copy`);

    if (existingSlots.length > 0) {
      // Clear existing slots for new doctor
      await DoctorTimeSlot.deleteMany({ doctorId: doctor._id });
      console.log('🧹 Cleared existing slots for new doctor');

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

  // Verify data
  const totalUsers = await User.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalSlots = await DoctorTimeSlot.countDocuments();
  
  console.log('\n📊 Database Summary:');
  console.log(`👤 Users: ${totalUsers}`);
  console.log(`👨‍⚕️ Doctors: ${totalDoctors}`);
  console.log(`⏰ Time Slots: ${totalSlots}`);
  
  console.log('\n🔍 New doctor time slots:');
  const newDoctorSlots = await DoctorTimeSlot.find({ doctorId: doctor._id })
    .sort({ startAt: 1 })
    .limit(5)
    .lean();
    
  newDoctorSlots.forEach((slot, index) => {
    const startTime = new Date(slot.startAt).toLocaleString('vi-VN');
    console.log(`  ${index + 1}. ${startTime} - ${slot.status}`);
  });

  console.log('\n✅ Setup completed successfully!');
  console.log('🔑 Firebase UID: app_0282bd36cb9d21f6be6abf0d');
  console.log('👤 Doctor name: Bùi Ngọc Lan');
  console.log('📧 Email: buingoclan@example.com');

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
