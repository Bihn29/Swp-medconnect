import mongoose from 'mongoose';
import User from './models/user.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedConnect';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
  const firebaseUID = 'app_0282bd36cb9d21f6be6abf0d';
  
  // Check user with FirebaseUID
  const user = await User.findOne({ firebaseUID }).lean();
  if (user) {
    console.log('✅ Found user with FirebaseUID:');
    console.log(`  Name: ${user.fullName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  FirebaseUID: ${user.firebaseUID}`);
  } else {
    console.log('❌ User not found with FirebaseUID:', firebaseUID);
    
    // Check all users
    const allUsers = await User.find({}).lean();
    console.log('\n📋 All users:');
    allUsers.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.fullName} (${u.email}) - FirebaseUID: ${u.firebaseUID || 'None'}`);
    });
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
