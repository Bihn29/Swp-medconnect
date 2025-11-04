/* =======================================================
 * Script: Fix Education Level Price Index
 * PURPOSE: Xóa unique index cũ trên educationLevel và đảm bảo compound index đúng
 * ======================================================= */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

/**
 * Fix education level price indexes
 * Drops old unique index on educationLevel and ensures compound index exists
 */
async function fixEducationLevelPriceIndex() {
  try {
    console.log("🔄 Fixing Education Level Price indexes...");

    await mongoose.connect(
      process.env.MONGODB_URL || "mongodb://localhost:27017/MedConnect"
    );
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("EducationLevelPrices");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("📋 Current indexes:", indexes);

    // Drop old unique index on educationLevel if exists
    try {
      await collection.dropIndex("educationLevel_1");
      console.log("✅ Dropped old unique index on educationLevel");
    } catch (error) {
      if (error.code === 27) {
        // Index not found
        console.log(
          "ℹ️  Old unique index on educationLevel not found (already removed)"
        );
      } else {
        console.error("❌ Error dropping index:", error.message);
      }
    }

    // Ensure compound unique index exists
    try {
      await collection.createIndex(
        { educationLevel: 1, mode: 1 },
        { unique: true, name: "educationLevel_1_mode_1" }
      );
      console.log(
        "✅ Created/verified compound unique index on (educationLevel, mode)"
      );
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        // Index already exists
        console.log("ℹ️  Compound unique index already exists");
      } else {
        console.error("❌ Error creating compound index:", error.message);
      }
    }

    // Verify indexes
    const finalIndexes = await collection.indexes();
    console.log("\n📋 Final indexes:", finalIndexes);

    console.log("\n✅ Index fix complete!");
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error fixing indexes:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  fixEducationLevelPriceIndex()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { fixEducationLevelPriceIndex };
