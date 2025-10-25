import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import Review from "../models/review.model.js";

async function createReviewsForDoctor() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/MedConnect"
    );
    console.log("Connected to MongoDB");

    const doctor = await Doctor.findById("68fd16acb121b97e12af541c");
    const patient = await Patient.findOne();

    if (!doctor) {
      console.log("Doctor not found");
      return;
    }

    if (!patient) {
      console.log("Patient not found");
      return;
    }

    console.log("Creating reviews for doctor:", doctor.fullName);

    const sampleReviews = [
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: patient._id,
        doctorId: doctor._id,
        rating: 5,
        comment:
          "Bác sĩ rất chuyên nghiệp và tận tâm. Tôi rất hài lòng với dịch vụ khám bệnh.",
        tags: ["chuyên nghiệp", "tận tâm", "dịch vụ tốt"],
        verified: true,
        helpfulCount: 3,
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: patient._id,
        doctorId: doctor._id,
        rating: 5,
        comment:
          "Bác sĩ có kiến thức chuyên môn tốt, giải thích rõ ràng về tình trạng bệnh.",
        tags: ["kiến thức tốt", "giải thích rõ ràng"],
        verified: true,
        helpfulCount: 1,
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: patient._id,
        doctorId: doctor._id,
        rating: 5,
        comment:
          "Rất hài lòng với bác sĩ. Thái độ thân thiện, chăm sóc bệnh nhân chu đáo.",
        tags: ["thân thiện", "chu đáo", "chăm sóc tốt"],
        verified: true,
        helpfulCount: 5,
      },
      {
        appointmentId: new mongoose.Types.ObjectId(),
        patientId: patient._id,
        doctorId: doctor._id,
        rating: 5,
        comment:
          "Tuyệt vời! Bác sĩ rất tận tâm, theo dõi tình trạng bệnh của tôi rất kỹ lưỡng.",
        tags: ["tuyệt vời", "tận tâm", "theo dõi kỹ"],
        verified: true,
        helpfulCount: 2,
      },
    ];

    for (const reviewData of sampleReviews) {
      const review = new Review(reviewData);
      await review.save();
      console.log("Created review:", reviewData.rating, "stars");
    }

    console.log("All reviews created successfully!");
  } catch (error) {
    console.error("Error creating reviews:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createReviewsForDoctor();
