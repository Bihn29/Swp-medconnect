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

  // Create a user
  let user = await User.findOne({ email: 'doctor@example.com' });
  if (!user) {
    user = await User.create({
      email: 'doctor@example.com',
      fullName: 'Bùi Ngọc Lan',
      phone: '0123456789',
      role: 'doctor',
      isActive: true,
      passwordHash: 'dummy_hash_for_testing' // Temporary hash for testing
    });
    console.log('✅ Created user:', user.fullName);
  }

  // Create a doctor profile
  let doctor = await Doctor.findOne({ userId: user._id });
  if (!doctor) {
    doctor = await Doctor.create({
      userId: user._id,
      licenseNo: 'DOC123456',
      yearsExperience: 5,
      specializationIds: [specialization._id],
      bio: 'Bác sĩ chuyên khoa sức khỏe tâm thần',
      consultationFee: 500000,
      isActive: true
    });
    console.log('✅ Created doctor profile for:', user.fullName);
  }

  // Create some time slots for today and tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Clear existing slots for this doctor
  await DoctorTimeSlot.deleteMany({ doctorId: doctor._id });
  console.log('🧹 Cleared existing time slots');

  // Create time slots for today
  const todaySlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    const startAt = new Date(today);
    startAt.setHours(hour, 0, 0, 0);
    
    const endAt = new Date(today);
    endAt.setHours(hour + 1, 0, 0, 0);
    
    todaySlots.push({
      doctorId: doctor._id,
      startAt,
      endAt,
      status: 'available'
    });
  }

  // Create time slots for tomorrow
  const tomorrowSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    const startAt = new Date(tomorrow);
    startAt.setHours(hour, 0, 0, 0);
    
    const endAt = new Date(tomorrow);
    endAt.setHours(hour + 1, 0, 0, 0);
    
    tomorrowSlots.push({
      doctorId: doctor._id,
      startAt,
      endAt,
      status: 'available'
    });
  }

  // Insert all slots
  const allSlots = [...todaySlots, ...tomorrowSlots];
  await DoctorTimeSlot.insertMany(allSlots);
  console.log(`✅ Created ${allSlots.length} time slots`);

  // Verify data
  const totalUsers = await User.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalSlots = await DoctorTimeSlot.countDocuments();
  
  console.log('\n📊 Database Summary:');
  console.log(`👤 Users: ${totalUsers}`);
  console.log(`👨‍⚕️ Doctors: ${totalDoctors}`);
  console.log(`⏰ Time Slots: ${totalSlots}`);
  
  console.log('\n🔍 Sample time slots:');
  const sampleSlots = await DoctorTimeSlot.find({ doctorId: doctor._id })
    .sort({ startAt: 1 })
    .limit(5)
    .lean();
    
  sampleSlots.forEach((slot, index) => {
    console.log(`  ${index + 1}. ${slot.startAt.toLocaleString('vi-VN')} - ${slot.status}`);
  });

  console.log('\n✅ Sample data created successfully!');
  console.log('📧 Doctor email: doctor@example.com');
  console.log('👤 Doctor name: Bùi Ngọc Lan');

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
