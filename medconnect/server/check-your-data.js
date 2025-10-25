import mongoose from 'mongoose';
import User from './models/user.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedConnect';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
  const firebaseUID = 'app_0282bd36cb9d21f6be6abf0d';
  
  // Check if user exists with this FirebaseUID
  const user = await User.findOne({ firebaseUID }).lean();
  if (user) {
    console.log('✅ Found user with FirebaseUID:', firebaseUID);
    console.log('👤 User details:');
    console.log(`  Name: ${user.fullName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  FirebaseUID: ${user.firebaseUID}`);
  } else {
    console.log('❌ User NOT found with FirebaseUID:', firebaseUID);
    console.log('\n📋 All users in your database:');
    const allUsers = await User.find({}).lean();
    allUsers.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.fullName} (${u.email}) - FirebaseUID: ${u.firebaseUID || 'None'}`);
    });
    
    console.log('\n💡 Solution: You need to update one of your existing users with FirebaseUID:', firebaseUID);
    console.log('   Or update the authentication to use email instead of FirebaseUID');
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
