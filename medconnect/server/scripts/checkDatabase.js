import mongoose from "mongoose";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Clinic from "../models/clinic.model.js";
import Appointment from "../models/appointment.model.js";

// Connect to MongoDB Atlas
mongoose.connect(
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function checkDatabase() {
  try {
    console.log("🔍 Checking database contents...\n");

    const users = await User.find({});
    const doctors = await Doctor.find({});
    const patients = await Patient.find({});
    const clinics = await Clinic.find({});
    const appointments = await Appointment.find({});

    console.log(`👥 Users: ${users.length}`);
    console.log(`👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`👤 Patients: ${patients.length}`);
    console.log(`🏥 Clinics: ${clinics.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);

    if (users.length > 0) {
      console.log("\n📋 Recent users:");
      users.slice(0, 3).forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`
        );
      });
    }

    if (doctors.length > 0) {
      console.log("\n👨‍⚕️ Recent doctors:");
      doctors.slice(0, 3).forEach((doctor, index) => {
        console.log(
          `${index + 1}. ${doctor.userId?.fullName || "Unknown"} - License: ${
            doctor.licenseNo
          }`
        );
      });
    }

    if (appointments.length > 0) {
      console.log("\n📅 Recent appointments:");
      appointments.slice(0, 5).forEach((apt, index) => {
        console.log(
          `${index + 1}. Mode: ${apt.mode} - Status: ${apt.status} - Created: ${
            apt.createdAt
          }`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabase();
