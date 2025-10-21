import mongoose from "mongoose";
import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";

// Sample clinics data
const sampleClinics = [
  {
    name: "Phòng khám Đa khoa Hồng Hà",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    phone: "028-3822-1234",
    latitude: 10.7769,
    longitude: 106.7009,
    geo: {
      type: "Point",
      coordinates: [106.7009, 10.7769] // [lng, lat]
    }
  },
  {
    name: "Phòng khám Chuyên khoa Tim mạch",
    address: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM", 
    phone: "028-3822-5678",
    latitude: 10.7769,
    longitude: 106.7009,
    geo: {
      type: "Point",
      coordinates: [106.7009, 10.7769]
    }
  },
  {
    name: "Phòng khám Nhi khoa An Bình",
    address: "789 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
    phone: "028-3842-9012",
    latitude: 10.8014,
    longitude: 106.7055,
    geo: {
      type: "Point", 
      coordinates: [106.7055, 10.8014]
    }
  }
];

async function createSampleClinics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/medconnect");
    console.log("Connected to MongoDB");

    // Clear existing clinics
    await Clinic.deleteMany({});
    console.log("Cleared existing clinics");

    // Create sample clinics
    const clinics = await Clinic.insertMany(sampleClinics);
    console.log(`Created ${clinics.length} sample clinics`);

    // Update doctors to have default clinics
    const doctors = await Doctor.find({});
    for (let i = 0; i < doctors.length && i < clinics.length; i++) {
      doctors[i].clinicDefaultId = clinics[i]._id;
      await doctors[i].save();
      console.log(`Updated doctor ${doctors[i].fullName} with clinic ${clinics[i].name}`);
    }

    console.log("Sample clinics created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating sample clinics:", error);
    process.exit(1);
  }
}

// Run the script
createSampleClinics();
