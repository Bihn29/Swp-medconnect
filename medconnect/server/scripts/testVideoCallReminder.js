/**
 * Script test để chạy video call reminder ngay lập tức
 * 
 * Usage: node server/scripts/testVideoCallReminder.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { runReminderNow } from "../services/videoCallReminderService.js";

dotenv.config();

async function testVideoCallReminder() {
  try {
    console.log("🚀 Starting test for video call reminder...");
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/MedConnect";
    console.log(`📦 Connecting to MongoDB: ${mongoUrl}`);
    
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB");
    
    // Run the reminder service
    console.log("\n⏰ Running video call reminder now...");
    const result = await runReminderNow();
    
    console.log("\n📊 Results:");
    console.log(`  - Total appointments found: ${result.total}`);
    console.log(`  - Emails sent: ${result.sent}`);
    console.log(`  - Skipped: ${result.skipped}`);
    
    if (result.sent > 0) {
      console.log("\n✅ Test completed successfully! Emails were sent.");
    } else if (result.total === 0) {
      console.log("\n⚠️  No appointments found in the 10-11 minute window.");
      console.log("💡 Tip: Create an online appointment scheduled to start in 10-11 minutes to test this.");
    } else {
      console.log("\n⚠️  No emails were sent. Check if appointments have valid patient emails.");
    }
    
  } catch (error) {
    console.error("❌ Error during test:", error);
    console.error(error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
    process.exit(0);
  }
}

// Run the test
testVideoCallReminder();

