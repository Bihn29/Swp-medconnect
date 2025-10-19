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

const testDoctorFiltering = async () => {
  try {
    await connectDB();

    console.log("\n=== Testing Doctor Filtering ===");

    // Get all specializations
    const specializations = await Specialization.find({}).lean();
    console.log(`\nFound ${specializations.length} specializations:`);
    specializations.forEach((spec) => {
      console.log(`- ${spec.name} (ID: ${spec._id})`);
    });

    // Get all doctors with their specializations
    const allDoctors = await Doctor.find({})
      .populate("specializationIds", "name")
      .lean();

    console.log(`\nFound ${allDoctors.length} doctors:`);
    allDoctors.forEach((doctor) => {
      const specNames =
        doctor.specializationIds?.map((s) => s.name).join(", ") || "None";
      console.log(`- ${doctor.fullName}: ${specNames}`);
    });

    // Test filtering by first specialization
    if (specializations.length > 0) {
      const firstSpec = specializations[0];
      console.log(
        `\n=== Testing filter by specialization: ${firstSpec.name} ===`
      );

      // Test with ObjectId
      const filteredDoctors = await Doctor.find({
        specializationIds: {
          $in: [new mongoose.Types.ObjectId(firstSpec._id)],
        },
      })
        .populate("specializationIds", "name")
        .lean();

      console.log(
        `Found ${filteredDoctors.length} doctors for specialization "${firstSpec.name}":`
      );
      filteredDoctors.forEach((doctor) => {
        const specNames =
          doctor.specializationIds?.map((s) => s.name).join(", ") || "None";
        console.log(`- ${doctor.fullName}: ${specNames}`);
      });

      // Test with string ID (what the API receives)
      const filteredDoctorsString = await Doctor.find({
        specializationIds: { $in: [firstSpec._id.toString()] },
      })
        .populate("specializationIds", "name")
        .lean();

      console.log(
        `\nWith string ID, found ${filteredDoctorsString.length} doctors`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

testDoctorFiltering();
