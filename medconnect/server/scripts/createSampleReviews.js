import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";

// Sample review data
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

async function createSampleReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/medconnect"
    );
    console.log("Connected to MongoDB");

    // Get a random doctor
    const doctor = await Doctor.findOne();
    if (!doctor) {
      console.log("No doctor found. Please create a doctor first.");
      return;
    }

    // Get a random patient
    const patient = await Patient.findOne();
    if (!patient) {
      console.log("No patient found. Please create a patient first.");
      return;
    }

    // Create sample appointments first
    const appointments = [];
    for (let i = 0; i < 5; i++) {
      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        scheduledStart: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // Past dates
        scheduledEnd: new Date(
          Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
        ),
        mode: "online",
        status: "done",
        notes: `Sample appointment ${i + 1}`,
      });
      await appointment.save();
      appointments.push(appointment);
    }

    // Create sample reviews
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const review = new Review({
        appointmentId: appointments[i]._id,
        patientId: patient._id,
        doctorId: doctor._id,
        ...reviewData,
      });
      await review.save();
      console.log(`Created review ${i + 1}: ${reviewData.rating} stars`);
    }

    console.log("Sample reviews created successfully!");
    console.log(`Doctor: ${doctor.fullName}`);
    console.log(`Patient: ${patient.fullName}`);
    console.log(`Total reviews: ${sampleReviews.length}`);
  } catch (error) {
    console.error("Error creating sample reviews:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createSampleReviews();
