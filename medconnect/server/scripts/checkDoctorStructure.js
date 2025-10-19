import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";

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

const checkDoctorStructure = async () => {
  try {
    await connectDB();

    console.log("\n=== Checking Doctor Document Structure ===");

    // Get first doctor to check structure
    const doctor = await Doctor.findOne({}).lean();

    if (doctor) {
      console.log("\nDoctor document structure:");
      console.log(JSON.stringify(doctor, null, 2));

      console.log("\nSpecializationIds field:");
      console.log("Type:", typeof doctor.specializationIds);
      console.log("Value:", doctor.specializationIds);
      console.log("Is Array:", Array.isArray(doctor.specializationIds));
      console.log("Length:", doctor.specializationIds?.length || 0);

      if (doctor.specializationIds && doctor.specializationIds.length > 0) {
        console.log("First specialization ID:", doctor.specializationIds[0]);
        console.log(
          "Is ObjectId:",
          mongoose.Types.ObjectId.isValid(doctor.specializationIds[0])
        );
      }
    } else {
      console.log("No doctors found in database");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

checkDoctorStructure();
