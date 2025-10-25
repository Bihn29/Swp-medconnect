import mongoose from 'mongoose';
import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';
import DoctorTimeSlot from './models/doctorTimeSlot.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URL || 'mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect';
console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI);

async function debugTimeSlots() {
  try {
    console.log('🔍 Debugging Time Slots...\n');
    
    // 1. Find doctor "Bùi Ngọc Lan" (from the image)
    const doctorUser = await User.findOne({ email: 'doctor8@medconnect.vn' }).lean();
    if (!doctorUser) {
      console.log('❌ Doctor user not found');
      return;
    }
    
    console.log('👤 Found doctor user:', doctorUser.fullName, doctorUser.email);
    
    const doctor = await Doctor.findOne({ userId: doctorUser._id }).lean();
    if (!doctor) {
      console.log('❌ Doctor profile not found');
      return;
    }
    
    console.log('👨‍⚕️ Found doctor profile:', doctor.fullName, 'ID:', doctor._id);
    
    // 2. Check time slots for 2025-10-24 (from the image)
    const targetDate = new Date('2025-10-24');
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    console.log('📅 Checking time slots for:', targetDate.toISOString().split('T')[0]);
    console.log('📅 Date range:', startDate.toISOString(), 'to', endDate.toISOString());
    
    const timeSlots = await DoctorTimeSlot.find({
      doctorId: doctor._id,
      startAt: { $gte: startDate, $lte: endDate },
      status: "available",
    })
      .sort({ startAt: 1 })
      .lean();
    
    console.log(`\n📊 Found ${timeSlots.length} time slots:`);
    
    if (timeSlots.length > 0) {
      console.log('\n📋 First 5 time slots:');
      timeSlots.slice(0, 5).forEach((slot, index) => {
        console.log(`   ${index + 1}. ID: ${slot._id}`);
        console.log(`      Start: ${slot.startAt}`);
        console.log(`      End: ${slot.endAt}`);
        console.log(`      Status: ${slot.status}`);
        console.log(`      Doctor ID: ${slot.doctorId}`);
        console.log('');
      });
      
      // Check if slots have proper data
      const emptySlots = timeSlots.filter(slot => 
        !slot.startAt || !slot.endAt || !slot.status
      );
      
      if (emptySlots.length > 0) {
        console.log(`❌ Found ${emptySlots.length} slots with missing data:`);
        emptySlots.forEach(slot => {
          console.log(`   - Slot ${slot._id}:`, {
            startAt: slot.startAt,
            endAt: slot.endAt,
            status: slot.status,
            doctorId: slot.doctorId
          });
        });
      } else {
        console.log('✅ All slots have proper data');
      }
    } else {
      console.log('❌ No time slots found for this date');
    }
    
    // 3. Check all time slots for this doctor
    const allSlots = await DoctorTimeSlot.find({
      doctorId: doctor._id
    }).lean();
    
    console.log(`\n📊 Total time slots for doctor: ${allSlots.length}`);
    
    if (allSlots.length > 0) {
      const dates = [...new Set(allSlots.map(slot => 
        new Date(slot.startAt).toISOString().split('T')[0]
      ))];
      console.log('📅 Available dates:', dates.sort());
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

debugTimeSlots();
