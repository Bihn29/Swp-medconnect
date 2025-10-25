import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";

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

async function createSampleReviewsOnly() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/MedConnect"
    );
    console.log("Connected to MongoDB");

    // Get existing data
    const doctor = await Doctor.findOne();
    const patient = await Patient.findOne();

    if (!doctor) {
      console.log("No doctor found. Please create a doctor first.");
      return;
    }

    if (!patient) {
      console.log("No patient found. Please create a patient first.");
      return;
    }

    // Clear existing reviews
    await Review.deleteMany({});

    // Create sample reviews with fake appointment IDs
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const review = new Review({
        appointmentId: new mongoose.Types.ObjectId(), // Fake appointment ID
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
createSampleReviewsOnly();
