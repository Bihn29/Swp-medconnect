import mongoose from "mongoose";
import admin from "firebase-admin";
import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "medconnect-demo",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "test@medconnect-demo.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMOCK_KEY_FOR_TESTING\n-----END PRIVATE KEY-----"
    })
  });
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/MedConnect");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create session cookie for test user
const createSessionCookie = async () => {
  try {
    // Get test patient user
    const patientUser = await User.findOne({ email: "patient@test.com" });
    if (!patientUser) {
      console.log("❌ Test patient user not found");
      return;
    }

    console.log(`📋 Creating session cookie for user: ${patientUser.email} (${patientUser._id})`);

    // Create custom token
    const customToken = await admin.auth().createCustomToken(patientUser._id.toString(), {
      app_user_id: patientUser._id.toString(),
      email: patientUser.email,
      role: patientUser.role
    });

    console.log("✅ Custom token created:", customToken);

    // Note: In a real scenario, you would exchange this custom token for a session cookie
    // For testing purposes, we'll just show the token
    console.log("\n🔑 To test the API, you can:");
    console.log("1. Use this custom token to authenticate");
    console.log("2. Or manually create a session cookie using Firebase Auth");
    console.log("\n📝 Custom Token:", customToken);

  } catch (error) {
    console.error("❌ Error creating session cookie:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createSessionCookie();
  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
};

// Run the script
main().catch(console.error);
