import mongoose from 'mongoose';
import User from './models/user.model.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MedConnect';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
  const firebaseUID = 'app_0282bd36cb9d21f6be6abf0d';
  
  // Update user with FirebaseUID
  const user = await User.findOneAndUpdate(
    { email: 'buingoclan@example.com' },
    { firebaseUID: firebaseUID },
    { new: true }
  );
  
  if (user) {
    console.log('✅ Updated user with FirebaseUID:');
    console.log(`  Name: ${user.fullName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  FirebaseUID: ${user.firebaseUID}`);
  } else {
    console.log('❌ User not found with email: buingoclan@example.com');
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
