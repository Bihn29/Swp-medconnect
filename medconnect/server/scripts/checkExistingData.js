import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import { config } from "dotenv";

// Load environment variables
config();

const MONGODB_URI =
  process.env.MONGODB_URL ||
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect";

async function checkExistingData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check doctors
    const doctors = await Doctor.find().populate("userId");
    console.log(`\n👨‍⚕️ Found ${doctors.length} doctors:`);
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.fullName} (ID: ${doctor._id})`);
      console.log(
        `   - Rating: ${doctor.ratingAvg || 0} (${
          doctor.ratingCount || 0
        } reviews)`
      );
      console.log(
        `   - Specialization: ${
          doctor.specializationIds?.length || 0
        } specializations`
      );
    });

    // Check patients
    const patients = await Patient.find().populate("userId").limit(5);
    console.log(`\n👤 Found ${patients.length} patients:`);
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.fullName} (ID: ${patient._id})`);
    });

    // Check reviews - first without populate
    const reviews = await Review.find().sort({ createdAt: -1 });
    console.log(`\n⭐ Found ${reviews.length} reviews:`);
    reviews.forEach((review, index) => {
      console.log(
        `${index + 1}. Rating: ${review.rating} - "${review.comment?.substring(
          0,
          50
        )}..."`
      );
      console.log(`   - Doctor ID: ${review.doctorId}`);
      console.log(`   - Patient ID: ${review.patientId}`);
      console.log(`   - Date: ${review.createdAt}`);
    });

    // Check collection names
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`\n📚 Available collections:`);
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });

    // Try to find reviews in different collection names
    const possibleCollectionNames = ["reviews", "Reviews", "review", "Review"];
    for (const collectionName of possibleCollectionNames) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`\n🔍 Collection "${collectionName}": ${count} documents`);
        if (count > 0) {
          const sampleDocs = await collection.find().limit(3).toArray();
          console.log(`   Sample documents:`, sampleDocs);
        }
      } catch (error) {
        console.log(`   Collection "${collectionName}" not found`);
      }
    }

    // Check reviews by doctor
    if (doctors.length > 0) {
      const firstDoctor = doctors[0];
      const doctorReviews = await Review.find({ doctorId: firstDoctor._id })
        .populate("patientId")
        .sort({ createdAt: -1 });

      console.log(`\n📊 Reviews for ${firstDoctor.fullName}:`);
      console.log(`   - Total reviews: ${doctorReviews.length}`);

      if (doctorReviews.length > 0) {
        const avgRating =
          doctorReviews.reduce((sum, r) => sum + r.rating, 0) /
          doctorReviews.length;
        console.log(`   - Average rating: ${avgRating.toFixed(1)}`);

        // Show recent reviews
        console.log(`   - Recent reviews:`);
        doctorReviews.slice(0, 3).forEach((review, index) => {
          console.log(
            `     ${index + 1}. ${
              review.rating
            }⭐ - "${review.comment?.substring(0, 40)}..."`
          );
        });
      }
    }

    console.log("\n✅ Data check completed!");
  } catch (error) {
    console.error("❌ Error checking data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
checkExistingData();
