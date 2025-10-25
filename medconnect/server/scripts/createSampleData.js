import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import Review from "../models/review.model.js";
import Specialization from "../models/specialization.model.js";
import Clinic from "../models/clinic.model.js";

// Sample data
const sampleUsers = [
  {
    email: "doctor1@example.com",
    fullName: "BS. Nguyễn Văn An",
    phone: "0123456789",
    role: "doctor",
    passwordHash: "$2b$10$example.hash.for.doctor1",
    authProvider: "local",
  },
  {
    email: "doctor2@example.com",
    fullName: "BS. Trần Thị Bình",
    phone: "0123456790",
    role: "doctor",
    passwordHash: "$2b$10$example.hash.for.doctor2",
    authProvider: "local",
  },
  {
    email: "patient1@example.com",
    fullName: "Nguyễn Văn A",
    phone: "0123456791",
    role: "patient",
    passwordHash: "$2b$10$example.hash.for.patient1",
    authProvider: "local",
  },
  {
    email: "patient2@example.com",
    fullName: "Trần Thị B",
    phone: "0123456792",
    role: "patient",
    passwordHash: "$2b$10$example.hash.for.patient2",
    authProvider: "local",
  },
];

const sampleSpecializations = [
  { name: "Tim mạch", code: "TM", description: "Chuyên khoa tim mạch" },
  { name: "Nội khoa", code: "NK", description: "Chuyên khoa nội khoa" },
  { name: "Ngoại khoa", code: "NGK", description: "Chuyên khoa ngoại khoa" },
];

const sampleClinics = [
  {
    name: "Bệnh viện Đa khoa Trung ương",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    phone: "0281234567",
    latitude: 10.7769,
    longitude: 106.7009,
    geo: {
      type: "Point",
      coordinates: [106.7009, 10.7769], // [lng, lat]
    },
  },
  {
    name: "Phòng khám Đa khoa Sài Gòn",
    address: "456 Đường XYZ, Quận 2, TP.HCM",
    phone: "0287654321",
    latitude: 10.7833,
    longitude: 106.7167,
    geo: {
      type: "Point",
      coordinates: [106.7167, 10.7833], // [lng, lat]
    },
  },
];

const sampleReviews = [
  {
    rating: 5,
    comment:
      "Bác sĩ rất chuyên nghiệp và tận tâm. Tôi rất hài lòng với dịch vụ khám bệnh.",
    tags: ["chuyên nghiệp", "tận tâm", "dịch vụ tốt"],
    isAnonymous: false,
    verified: true,
    helpfulCount: 3,
  },
  {
    rating: 4,
    comment:
      "Bác sĩ có kiến thức chuyên môn tốt, giải thích rõ ràng về tình trạng bệnh.",
    tags: ["kiến thức tốt", "giải thích rõ ràng"],
    isAnonymous: false,
    verified: true,
    helpfulCount: 1,
  },
  {
    rating: 5,
    comment:
      "Rất hài lòng với bác sĩ. Thái độ thân thiện, chăm sóc bệnh nhân chu đáo.",
    tags: ["thân thiện", "chu đáo", "chăm sóc tốt"],
    isAnonymous: false,
    verified: true,
    helpfulCount: 5,
  },
  {
    rating: 3,
    comment:
      "Bác sĩ có chuyên môn nhưng thời gian khám hơi ngắn. Cần cải thiện thêm.",
    tags: ["chuyên môn tốt", "thời gian ngắn"],
    isAnonymous: true,
    verified: true,
    helpfulCount: 0,
  },
  {
    rating: 5,
    comment:
      "Tuyệt vời! Bác sĩ rất tận tâm, theo dõi tình trạng bệnh của tôi rất kỹ lưỡng.",
    tags: ["tuyệt vời", "tận tâm", "theo dõi kỹ"],
    isAnonymous: false,
    verified: true,
    helpfulCount: 2,
  },
];

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/MedConnect"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Specialization.deleteMany({});
    await Clinic.deleteMany({});

    // Create specializations
    const specializations = [];
    for (const specData of sampleSpecializations) {
      const spec = new Specialization(specData);
      await spec.save();
      specializations.push(spec);
      console.log(`Created specialization: ${spec.name}`);
    }

    // Create clinics
    const clinics = [];
    for (const clinicData of sampleClinics) {
      const clinic = new Clinic(clinicData);
      await clinic.save();
      clinics.push(clinic);
      console.log(`Created clinic: ${clinic.name}`);
    }

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.fullName}`);
    }

    // Create doctors
    const doctors = [];
    const doctorUsers = users.filter((u) => u.role === "doctor");
    for (let i = 0; i < doctorUsers.length; i++) {
      const doctor = new Doctor({
        userId: doctorUsers[i]._id,
        fullName: doctorUsers[i].fullName,
        specializationIds: [specializations[i % specializations.length]._id],
        clinicDefaultId: clinics[i % clinics.length]._id,
        yearsExperience: 5 + i,
        bio: `Bác sĩ ${doctorUsers[i].fullName} với ${5 + i} năm kinh nghiệm`,
        isVerified: true,
      });
      await doctor.save();
      doctors.push(doctor);
      console.log(`Created doctor: ${doctor.fullName}`);
    }

    // Create patients
    const patients = [];
    const patientUsers = users.filter((u) => u.role === "patient");
    for (const user of patientUsers) {
      const patient = new Patient({
        userId: user._id,
        fullName: user.fullName,
        dateOfBirth: new Date(1990, 0, 1),
        gender: "male",
        address: "123 Đường ABC, TP.HCM",
      });
      await patient.save();
      patients.push(patient);
      console.log(`Created patient: ${patient.fullName}`);
    }

    // Create appointments
    const appointments = [];
    for (let i = 0; i < 5; i++) {
      const appointment = new Appointment({
        patientId: patients[i % patients.length]._id,
        doctorId: doctors[0]._id,
        scheduledStart: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(
          Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
        ),
        mode: "online",
        status: "done",
        notes: `Sample appointment ${i + 1}`,
      });
      await appointment.save();
      appointments.push(appointment);
      console.log(`Created appointment ${i + 1}`);
    }

    // Create reviews
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const review = new Review({
        appointmentId: appointments[i]._id,
        patientId: appointments[i].patientId,
        doctorId: doctors[0]._id,
        ...reviewData,
      });
      await review.save();
      console.log(`Created review ${i + 1}: ${reviewData.rating} stars`);
    }

    console.log("\n=== Sample data created successfully! ===");
    console.log(`Doctors: ${doctors.length}`);
    console.log(`Patients: ${patients.length}`);
    console.log(`Appointments: ${appointments.length}`);
    console.log(`Reviews: ${sampleReviews.length}`);
    console.log(`Specializations: ${specializations.length}`);
    console.log(`Clinics: ${clinics.length}`);
  } catch (error) {
    console.error("Error creating sample data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createSampleData();
