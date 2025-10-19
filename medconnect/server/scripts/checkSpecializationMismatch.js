import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import Specialization from "../models/specialization.model.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/MedConnect"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const checkSpecializationMismatch = async () => {
  try {
    await connectDB();

    console.log("\n=== Checking Specialization ID Mismatch ===");

    // Get all specializations
    const specializations = await Specialization.find({}).lean();
    console.log(
      `\nFound ${specializations.length} specializations in database:`
    );
    specializations.forEach((spec) => {
      console.log(`- ${spec.name} (ID: ${spec._id})`);
    });

    // Get all doctors with their specialization IDs
    const doctors = await Doctor.find({}).lean();
    console.log(`\nFound ${doctors.length} doctors:`);

    doctors.forEach((doctor) => {
      console.log(`\nDoctor: ${doctor.fullName}`);
      console.log(
        `Specialization IDs: ${JSON.stringify(doctor.specializationIds)}`
      );

      if (doctor.specializationIds && doctor.specializationIds.length > 0) {
        doctor.specializationIds.forEach((specId) => {
          const spec = specializations.find(
            (s) => s._id.toString() === specId.toString()
          );
          if (spec) {
            console.log(`  ✓ Found specialization: ${spec.name}`);
          } else {
            console.log(`  ✗ Missing specialization for ID: ${specId}`);
          }
        });
      }
    });

    // Test filtering with actual specialization ID
    if (specializations.length > 0) {
      const firstSpec = specializations[0];
      console.log(
        `\n=== Testing filter with actual specialization: ${firstSpec.name} (${firstSpec._id}) ===`
      );

      const filteredDoctors = await Doctor.find({
        specializationIds: {
          $in: [new mongoose.Types.ObjectId(firstSpec._id)],
        },
      }).lean();

      console.log(
        `Found ${filteredDoctors.length} doctors with specialization "${firstSpec.name}"`
      );
      filteredDoctors.forEach((doctor) => {
        console.log(`- ${doctor.fullName}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

checkSpecializationMismatch();
