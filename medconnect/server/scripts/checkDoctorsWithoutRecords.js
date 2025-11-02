import mongoose from "mongoose";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

const MONGODB_URI =
  process.env.MONGODB_URL ||
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect";

async function checkDoctorsWithoutRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all users with role "doctor"
    const doctorUsers = await User.find({ role: "doctor" });
    console.log(`📋 Found ${doctorUsers.length} users with role "doctor"\n`);

    let missingDoctorCount = 0;
    const missingDoctors = [];

    // Check each doctor user
    for (const user of doctorUsers) {
      const doctorRecord = await Doctor.findOne({ userId: user._id });

      if (!doctorRecord) {
        missingDoctorCount++;
        missingDoctors.push({
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          status: user.status,
          createdAt: user.createdAt,
        });

        console.log(`❌ User without Doctor record:`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created At: ${user.createdAt}`);
        console.log("");
      } else {
        console.log(`✅ User has Doctor record:`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Doctor ID: ${doctorRecord._id}`);
        console.log(`   Doctor Name: ${doctorRecord.fullName}`);
        console.log(`   Is Verified: ${doctorRecord.isVerified}`);
        console.log(`   Is Active: ${doctorRecord.isActive}`);
        console.log("");
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total doctor users: ${doctorUsers.length}`);
    console.log(
      `   Users WITH Doctor records: ${doctorUsers.length - missingDoctorCount}`
    );
    console.log(`   Users WITHOUT Doctor records: ${missingDoctorCount}`);

    if (missingDoctorCount > 0) {
      console.log(
        `\n⚠️  Found ${missingDoctorCount} users without Doctor records:`
      );
      missingDoctors.forEach((user, index) => {
        console.log(
          `\n${index + 1}. ${user.fullName || "No name"} (${user.email})`
        );
        console.log(`   User ID: ${user.userId}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }

    // Check collection names
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`\n📚 Available collections:`);
    collections.forEach((collection) => {
      const count = mongoose.connection.db
        .collection(collection.name)
        .countDocuments();
      console.log(`   - ${collection.name}`);
    });

    // Try to find Doctors in different collection names
    const possibleCollectionNames = ["Doctors", "doctors", "Doctor", "doctor"];
    console.log(`\n🔍 Checking Doctor records in collections:`);
    for (const collectionName of possibleCollectionNames) {
      try {
        const count = await mongoose.connection.db
          .collection(collectionName)
          .countDocuments();
        if (count > 0) {
          console.log(
            `   ✅ Found ${count} records in "${collectionName}" collection`
          );

          // Sample a few records
          const samples = await mongoose.connection.db
            .collection(collectionName)
            .find({})
            .limit(3)
            .toArray();
          samples.forEach((doc, index) => {
            console.log(`      Sample ${index + 1}:`, {
              _id: doc._id,
              userId: doc.userId,
              fullName: doc.fullName,
              isVerified: doc.isVerified,
            });
          });
        }
      } catch (err) {
        // Collection doesn't exist
      }
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkDoctorsWithoutRecords();
